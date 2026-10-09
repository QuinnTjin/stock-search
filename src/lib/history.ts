import { prisma } from "@/db";

export type HistoryOutcome = "FOUND" | "NOT_FOUND" | "ERROR";

export type HistoryEntry = {
  id: string;
  symbol: string;
  outcome: HistoryOutcome;
  open: number | null;
  quotedAt: Date | null;
  errorCode: string | null;
  createdAt: Date;
};

/** A user's recent lookups, newest first, for the /history page. */
export async function getRecentLookups(userId: string, limit = 20): Promise<HistoryEntry[]> {
  const rows = await prisma.stockLookup.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: limit,
    include: { quote: true },
  });

  return rows.map((row) => ({
    id: row.id,
    symbol: row.symbol,
    outcome: row.quote ? row.quote.status : "ERROR",
    open: row.quote?.openPrice?.toNumber() ?? null,
    quotedAt: row.quote?.quotedAt ?? null,
    errorCode: row.errorCode,
    createdAt: row.createdAt,
  }));
}
