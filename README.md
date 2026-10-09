# stock-search

A small web app where a signed-in user looks up a stock's opening price by
ticker symbol. Quotes are fetched live from the [Finnhub](https://finnhub.io/)
`/quote` API behind authentication, so the app is really two things stacked
together: a minimal email/password auth system, and a quote lookup backed by
an external market-data provider.

## Table of contents

- [What it does](#what-it-does)
- [Tech stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Setup](#setup)
- [Quick start](#quick-start)
- [Environment variables](#environment-variables)
- [Available scripts](#available-scripts)
- [Project structure](#project-structure)
- [Data model](#data-model)
- [Testing](#testing)
- [Current status / roadmap](#current-status--roadmap)

## What it does

- A visitor lands on `/`, and can **sign up** or **log in** with an email and
  password. Passwords are hashed with argon2id; sessions are server-side
  records looked up via an `httpOnly` cookie (the cookie holds a random
  token, the database stores only its SHA-256 hash).
- Once signed in, the user can visit `/lookup` and enter a ticker symbol
  (e.g. `AAPL`, `BRK.B`). The server validates the symbol, calls Finnhub's
  `/quote` endpoint, and returns the opening price and the date it applies
  to — or a friendly error message (invalid symbol, not found, rate limited,
  timed out, or upstream unavailable).
- Looking up a price requires an active session — there's no anonymous
  lookup path.

## Tech stack

| Layer | Choice |
|---|---|
| Framework | [Next.js 16](https://nextjs.org/) (App Router, `src/app`), React 19, TypeScript (strict) |
| Database | PostgreSQL via [Neon](https://neon.tech/) (serverless Postgres) |
| ORM | [Prisma 7](https://www.prisma.io/), client generated to `src/generated/prisma` |
| Auth | Hand-rolled: argon2 password hashing + server-side sessions (no third-party auth library) |
| External API | [Finnhub](https://finnhub.io/docs/api/quote) `/quote` endpoint |
| Tests | [Vitest](https://vitest.dev/) (node environment) |

## Prerequisites

- **Node.js 20+** and npm
- A **Neon** Postgres project with two branches: one for development/production
  data and one dedicated **test branch** (the test suite refuses to run
  against anything else — see [Testing](#testing))
- A **Finnhub** API key ([finnhub.io](https://finnhub.io/) has a free tier) for
  fetching quotes
- `argon2` is a native addon; make sure your platform has the usual Node
  native-build toolchain available (it ships prebuilt binaries for common
  platforms, so this is rarely an issue)

## Setup

1. **Install dependencies** (also runs `prisma generate` via `postinstall`):

   ```sh
   npm install
   ```

2. **Create your env files.** This project uses two separate files so the
   test suite can never accidentally point at real data:

   - `.env` — used by `npm run dev` / `npm run build` / `npm start`
   - `.env.test` — used by `npm test`, must point at a Neon **test** branch

   Each needs:

   ```sh
   DATABASE_URL="<Neon pooled connection string>"
   DIRECT_URL="<Neon direct (non-pooled) connection string>"
   FINNHUB_API_KEY="<your Finnhub API key>"
   ```

   Prisma 7 keeps connection URLs out of `schema.prisma`: the app's runtime
   client (`src/db.ts`) connects via `DATABASE_URL` through
   `@prisma/adapter-neon`, while `prisma migrate` (`prisma.config.ts`) uses
   the **direct**, non-pooled `DIRECT_URL`.

3. **Apply the database schema:**

   ```sh
   npx prisma migrate dev
   ```

   This runs the migrations in `prisma/migrations/` against `DIRECT_URL` and
   regenerates the Prisma client.

## Quick start

Once `.env` is populated and migrations are applied:

```sh
npm install
npx prisma migrate dev
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000), create an account,
and look up a symbol.

## Environment variables

| Variable | Used by | Purpose |
|---|---|---|
| `DATABASE_URL` | app runtime (`src/db.ts`) | Neon **pooled** connection string |
| `DIRECT_URL` | `prisma migrate` (`prisma.config.ts`) | Neon **direct** (non-pooled) connection string, required for migrations |
| `FINNHUB_API_KEY` | `src/lib/finnhub.ts` | Finnhub API key for `/quote` calls; lookups return a config error if unset |

`.env` and `.env.test` are both gitignored — never commit real credentials.

## Available scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the Next.js dev server |
| `npm run build` | Run `prisma generate`, then build for production |
| `npm start` | Run the production build |
| `npm run typecheck` | `tsc --noEmit` |
| `npm test` | Run the Vitest suite once (against `.env.test`) |
| `npm run test:watch` | Run Vitest in watch mode |
| `npx prisma generate` | Regenerate the Prisma client into `src/generated/prisma` |
| `npx prisma migrate dev` | Create/apply a migration against `DIRECT_URL` |

## Project structure

```
src/
  app/              # Next.js App Router pages
    page.tsx         # Landing page (signed-in vs. signed-out states)
    login/           # Login page, form, and server action
    signup/          # Signup page, form, and server action
    logout/          # Logout server action
    lookup/          # Stock lookup page, form, and server action
  components/       # Shared UI (brand mark, icons, password field)
  lib/              # Pure/server helpers
    symbol.ts        # Ticker normalization + validation
    auth.ts          # Email normalization/validation, password policy
    password.ts       # argon2 hashing/verification
    session.ts        # Session token + cookie helpers
    current-user.ts   # Resolve the current user from the session cookie
    finnhub.ts         # Finnhub /quote client
  test/             # Test-only guards (e.g. refuse to test against prod DB)
  db.ts             # PrismaClient singleton (Neon adapter)
  generated/prisma/ # Generated Prisma client (gitignored, do not edit)
prisma/
  schema.prisma     # Source of truth for the schema
  migrations/       # SQL migrations
docs/
  data-model.md     # ER diagram and relationship notes
```

## Data model

See [`docs/data-model.md`](docs/data-model.md) for the full ER diagram. In short:

- **User** — email (case-insensitive, via Postgres `citext`) + argon2id password hash.
- **Session** — server-side session row; the primary key is the SHA-256 hash of
  the cookie token, so a database leak can't be replayed as a valid cookie.
  Deleting the row logs the user out.
- **Quote** — an append-only log of every upstream Finnhub `/quote` call.
  Designed to double as a cache (reuse the newest row for a symbol within a
  TTL) and to distinguish a real "not found" from an error.
- **StockLookup** — one row per user search (history), pointing at the
  `Quote` that answered it, or an error code if the call failed.

## Testing

Tests run with Vitest in a Node environment (`vitest.config.mts`). Before any
test touches the database, `vitest.setup.ts` loads `.env.test` and calls a
guard (`src/test/db-guard.ts`) that **throws if `DATABASE_URL` isn't the Neon
test branch** — this is a deliberate safety check so a misconfigured env
can't let a test run wipe real data. Set up a dedicated Neon test branch and
point `.env.test` at it before running `npm test`.

```sh
npm test          # run once
npm run test:watch
```

## Current status / roadmap

This project follows staged commit prefixes (`U1`, `V2`, `V3`, ...) tracking
demo milestones; development is in progress toward an MVP. As of now:

- ✅ Signup, login, logout, and session handling
- ✅ Authenticated stock lookup against the live Finnhub `/quote` API, with
  symbol validation and error handling (invalid symbol, not found, rate
  limited, timed out, upstream unavailable)
- ✅ `Quote` (cache/log) and `StockLookup` (history) tables exist in the schema
- ⏳ The lookup flow does not yet write to `Quote` / `StockLookup` — every
  lookup currently calls Finnhub directly, with no caching or persisted
  search history yet
