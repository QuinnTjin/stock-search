import { config as loadEnv } from "dotenv";
import { assertTestDatabase } from "./src/test/db-guard";

// Prefer .env.test for the suite, but do NOT override an already-set DATABASE_URL:
// that way a stray shell value (e.g. a prod URL) survives and is caught by the
// guard below instead of being silently masked.
loadEnv({ path: ".env.test" });

// Hard stop before any test touches the database if it isn't the test branch.
assertTestDatabase(process.env.DATABASE_URL);
