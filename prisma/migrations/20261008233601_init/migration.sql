-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "citext";

-- CreateEnum
CREATE TYPE "quote_status" AS ENUM ('FOUND', 'NOT_FOUND');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "email" CITEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" VARCHAR(64) NOT NULL,
    "user_id" UUID NOT NULL,
    "expires_at" TIMESTAMPTZ(6) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_agent" VARCHAR(512),

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quotes" (
    "id" UUID NOT NULL,
    "symbol" VARCHAR(20) NOT NULL,
    "status" "quote_status" NOT NULL,
    "open_price" DECIMAL(18,6),
    "current_price" DECIMAL(18,6),
    "high_price" DECIMAL(18,6),
    "low_price" DECIMAL(18,6),
    "previous_close" DECIMAL(18,6),
    "change" DECIMAL(18,6),
    "change_percent" DECIMAL(12,6),
    "quoted_at" TIMESTAMPTZ(6),
    "fetched_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "quotes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stock_lookups" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "symbol" VARCHAR(20) NOT NULL,
    "quote_id" UUID,
    "served_from_cache" BOOLEAN NOT NULL DEFAULT false,
    "error_code" VARCHAR(32),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "stock_lookups_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "sessions_user_id_idx" ON "sessions"("user_id");

-- CreateIndex
CREATE INDEX "sessions_expires_at_idx" ON "sessions"("expires_at");

-- CreateIndex
CREATE INDEX "quotes_symbol_fetched_at_idx" ON "quotes"("symbol", "fetched_at" DESC);

-- CreateIndex
CREATE INDEX "stock_lookups_user_id_created_at_idx" ON "stock_lookups"("user_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "stock_lookups_quote_id_idx" ON "stock_lookups"("quote_id");

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_lookups" ADD CONSTRAINT "stock_lookups_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_lookups" ADD CONSTRAINT "stock_lookups_quote_id_fkey" FOREIGN KEY ("quote_id") REFERENCES "quotes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Invariants Prisma's schema language can't express.

-- Symbols are stored normalized: uppercase, Finnhub-style charset.
ALTER TABLE "quotes" ADD CONSTRAINT "quotes_symbol_normalized"
  CHECK (symbol ~ '^[A-Z0-9.\-]{1,20}$');
ALTER TABLE "stock_lookups" ADD CONSTRAINT "stock_lookups_symbol_normalized"
  CHECK (symbol ~ '^[A-Z0-9.\-]{1,20}$');

-- FOUND quotes carry an open price and a quote time; NOT_FOUND quotes carry no prices.
ALTER TABLE "quotes" ADD CONSTRAINT "quotes_status_shape" CHECK (
  (status = 'FOUND'     AND open_price IS NOT NULL AND quoted_at IS NOT NULL)
  OR
  (status = 'NOT_FOUND' AND open_price IS NULL AND current_price IS NULL
                        AND high_price IS NULL AND low_price IS NULL
                        AND previous_close IS NULL AND quoted_at IS NULL)
);

-- A lookup either resolved to a quote (found or not-found) or errored — never both, never neither.
ALTER TABLE "stock_lookups" ADD CONSTRAINT "stock_lookups_outcome_xor"
  CHECK ((quote_id IS NULL) <> (error_code IS NULL));

