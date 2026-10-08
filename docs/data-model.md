# Data Model

PostgreSQL (Neon) via Prisma. `quotes` is an append-only log of Finnhub `/quote` calls that doubles as the cache; `stock_lookups` is one row per user search, pointing at the quote that answered it.

```mermaid
erDiagram
    USER ||--o{ SESSION : "has"
    USER ||--o{ STOCK_LOOKUP : "performs"
    QUOTE |o--o{ STOCK_LOOKUP : "answers (null = ERROR)"

    USER {
        uuid id PK
        citext email UK
        string password_hash
        timestamptz created_at
        timestamptz updated_at
    }
    SESSION {
        varchar id PK "sha256(token)"
        uuid user_id FK
        timestamptz expires_at
        timestamptz created_at
        varchar user_agent
    }
    QUOTE {
        uuid id PK
        varchar symbol "UPPERCASE, indexed w/ fetched_at"
        enum status "FOUND or NOT_FOUND"
        decimal open_price "o, null if NOT_FOUND"
        decimal current_price "c"
        decimal high_price "h"
        decimal low_price "l"
        decimal previous_close "pc"
        decimal change "d"
        decimal change_percent "dp"
        timestamptz quoted_at "from t, null if t=0"
        timestamptz fetched_at "cache freshness"
    }
    STOCK_LOOKUP {
        uuid id PK
        uuid user_id FK
        varchar symbol "UPPERCASE"
        uuid quote_id FK "nullable"
        boolean served_from_cache
        varchar error_code "nullable; XOR quote_id"
        timestamptz created_at
    }
```

## Relationships

- **User → Session** (1 to 0..N): cascade on delete.
- **User → StockLookup** (1 to 0..N): cascade on delete.
- **Quote → StockLookup** (0..1 to 0..N): many lookups can share one cached quote; `quote_id` is null when the lookup errored. Restrict on delete, so pruning the cache never erases history.