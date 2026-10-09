import { prisma } from "@/db";

/** Does this user already have the symbol saved? (F4) */
export async function isFavorited(userId: string, symbol: string): Promise<boolean> {
  const row = await prisma.favorite.findUnique({
    where: { userId_symbol: { userId, symbol } },
  });
  return row !== null;
}

/** A user's saved stocks, newest first, for the /dashboard page. */
export async function listFavorites(userId: string): Promise<{ symbol: string; createdAt: Date }[]> {
  return prisma.favorite.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    select: { symbol: true, createdAt: true },
  });
}

/** The set of symbols a user has saved — for bulk membership checks. */
export async function getFavoriteSymbols(userId: string): Promise<Set<string>> {
  const rows = await prisma.favorite.findMany({
    where: { userId },
    select: { symbol: true },
  });
  return new Set(rows.map((row) => row.symbol));
}

/** Save a symbol. Idempotent via the (userId, symbol) unique key (F3). */
export async function addFavorite(userId: string, symbol: string): Promise<void> {
  await prisma.favorite.upsert({
    where: { userId_symbol: { userId, symbol } },
    create: { userId, symbol },
    update: {},
  });
}

/** Unsave a symbol. No-op if it wasn't saved. */
export async function removeFavorite(userId: string, symbol: string): Promise<void> {
  await prisma.favorite.deleteMany({ where: { userId, symbol } });
}

/** Bulk-save symbols (onboarding Finish), skipping any already saved (F3). */
export async function addFavorites(userId: string, symbols: string[]): Promise<void> {
  if (symbols.length === 0) {
    return;
  }
  await prisma.favorite.createMany({
    data: symbols.map((symbol) => ({ userId, symbol })),
    skipDuplicates: true,
  });
}
