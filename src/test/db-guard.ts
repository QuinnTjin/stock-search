/**
 * Safety guard: the test suite must run against the Neon *test* branch, never
 * production. Test setup/teardown (migrations, truncation, seeding) can wipe a
 * database, so a mistaken prod DATABASE_URL here would destroy real data.
 *
 * Endpoint ids come from the Neon branches (project broad-paper-52812469 — see
 * `.neon` / `neon branches list`):
 *   test branch   br-curly-fog-b8q0u77u  -> endpoint ep-square-wave-b8aj92hf
 *   prod branch   br-round-base-b8xhxq8c -> endpoint ep-weathered-glitter-b85flr94
 * If a branch is ever recreated, update these to match .env.test (and .env).
 */
export const TEST_DB_ENDPOINT = "ep-square-wave-b8aj92hf";
export const PROD_DB_ENDPOINT = "ep-weathered-glitter-b85flr94";

/**
 * Pull the Neon endpoint id out of a connection string's host, e.g.
 * `ep-square-wave-b8aj92hf-pooler.c-14.us-east-1.aws.neon.tech` -> `ep-square-wave-b8aj92hf`.
 */
export function endpointIdFromUrl(databaseUrl: string): string {
  const { hostname } = new URL(databaseUrl);
  return hostname.split(".")[0].replace(/-pooler$/, "");
}

/** Throw unless `databaseUrl` points at the Neon test branch. */
export function assertTestDatabase(databaseUrl: string | undefined): void {
  if (!databaseUrl) {
    throw new Error(
      "DATABASE_URL is not set. Tests must point at the Neon test branch — check .env.test.",
    );
  }

  let endpoint: string;
  try {
    endpoint = endpointIdFromUrl(databaseUrl);
  } catch {
    throw new Error(`DATABASE_URL is not a valid URL: ${databaseUrl}`);
  }

  if (endpoint === PROD_DB_ENDPOINT) {
    throw new Error(
      `Refusing to run tests against the production branch (endpoint "${endpoint}"). ` +
        "Point DATABASE_URL at the Neon test branch in .env.test.",
    );
  }

  if (endpoint !== TEST_DB_ENDPOINT) {
    throw new Error(
      `DATABASE_URL endpoint "${endpoint}" is not the test branch ("${TEST_DB_ENDPOINT}"). ` +
        "Refusing to run tests against an unexpected database — check .env.test.",
    );
  }
}
