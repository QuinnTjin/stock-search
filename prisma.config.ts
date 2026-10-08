import "dotenv/config";
import { defineConfig, env } from "prisma/config";

// Prisma 7: Migrate reads its connection here. Use Neon's *direct* (non-pooled)
// URL for migrations; the app uses the pooled URL via @prisma/adapter-neon:
//   new PrismaClient({ adapter: new PrismaNeon({ connectionString: process.env.DATABASE_URL }) })
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: { path: "prisma/migrations" },
  datasource: { url: env("DIRECT_URL") },
});
