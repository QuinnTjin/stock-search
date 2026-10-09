import { describe, it, expect, vi, beforeEach } from "vitest";

const { findManyMock } = vi.hoisted(() => ({ findManyMock: vi.fn() }));

vi.mock("@/db", () => ({ prisma: { stockLookup: { findMany: findManyMock } } }));

import { getRecentLookups } from "./history";

function decimal(value: number) {
  return { toNumber: () => value };
}

beforeEach(() => {
  findManyMock.mockReset();
});

describe("getRecentLookups", () => {
  it("queries the user's lookups newest-first with the given limit", async () => {
    findManyMock.mockResolvedValue([]);

    await getRecentLookups("user-1", 10);

    expect(findManyMock).toHaveBeenCalledWith({
      where: { userId: "user-1" },
      orderBy: { createdAt: "desc" },
      take: 10,
      include: { quote: true },
    });
  });

  it("defaults the limit to 20", async () => {
    findManyMock.mockResolvedValue([]);

    await getRecentLookups("user-1");

    expect(findManyMock).toHaveBeenCalledWith(expect.objectContaining({ take: 20 }));
  });

  it("maps a FOUND row, converting the Decimal open price to a number", async () => {
    const quotedAt = new Date("2026-10-08T14:30:00.000Z");
    const createdAt = new Date("2026-10-09T09:00:00.000Z");
    findManyMock.mockResolvedValue([
      {
        id: "lookup-1",
        symbol: "AAPL",
        errorCode: null,
        createdAt,
        quote: { status: "FOUND", openPrice: decimal(150.25), quotedAt },
      },
    ]);

    const result = await getRecentLookups("user-1");

    expect(result).toEqual([
      { id: "lookup-1", symbol: "AAPL", outcome: "FOUND", open: 150.25, quotedAt, errorCode: null, createdAt },
    ]);
  });

  it("maps a NOT_FOUND row with a null open price", async () => {
    const createdAt = new Date("2026-10-09T09:00:00.000Z");
    findManyMock.mockResolvedValue([
      {
        id: "lookup-2",
        symbol: "ZZZZZ",
        errorCode: null,
        createdAt,
        quote: { status: "NOT_FOUND", openPrice: null, quotedAt: null },
      },
    ]);

    const result = await getRecentLookups("user-1");

    expect(result).toEqual([
      { id: "lookup-2", symbol: "ZZZZZ", outcome: "NOT_FOUND", open: null, quotedAt: null, errorCode: null, createdAt },
    ]);
  });

  it("derives ERROR outcome from a row with no linked quote", async () => {
    const createdAt = new Date("2026-10-09T09:00:00.000Z");
    findManyMock.mockResolvedValue([
      { id: "lookup-3", symbol: "AAPL", errorCode: "RATE_LIMITED", createdAt, quote: null },
    ]);

    const result = await getRecentLookups("user-1");

    expect(result).toEqual([
      {
        id: "lookup-3",
        symbol: "AAPL",
        outcome: "ERROR",
        open: null,
        quotedAt: null,
        errorCode: "RATE_LIMITED",
        createdAt,
      },
    ]);
  });
});
