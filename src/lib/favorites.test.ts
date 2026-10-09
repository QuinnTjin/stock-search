import { describe, it, expect, vi, beforeEach } from "vitest";

const { findUniqueMock } = vi.hoisted(() => ({ findUniqueMock: vi.fn() }));
const { findManyMock } = vi.hoisted(() => ({ findManyMock: vi.fn() }));
const { upsertMock } = vi.hoisted(() => ({ upsertMock: vi.fn() }));
const { deleteManyMock } = vi.hoisted(() => ({ deleteManyMock: vi.fn() }));
const { createManyMock } = vi.hoisted(() => ({ createManyMock: vi.fn() }));

vi.mock("@/db", () => ({
  prisma: {
    favorite: {
      findUnique: findUniqueMock,
      findMany: findManyMock,
      upsert: upsertMock,
      deleteMany: deleteManyMock,
      createMany: createManyMock,
    },
  },
}));

import { isFavorited, listFavorites, getFavoriteSymbols, addFavorite, removeFavorite, addFavorites } from "./favorites";

beforeEach(() => {
  findUniqueMock.mockReset();
  findManyMock.mockReset();
  upsertMock.mockReset().mockResolvedValue({});
  deleteManyMock.mockReset().mockResolvedValue({ count: 1 });
  createManyMock.mockReset().mockResolvedValue({ count: 0 });
});

describe("isFavorited", () => {
  it("returns true when a row exists for the user+symbol", async () => {
    findUniqueMock.mockResolvedValue({ id: "fav-1" });

    await expect(isFavorited("user-1", "AAPL")).resolves.toBe(true);
    expect(findUniqueMock).toHaveBeenCalledWith({
      where: { userId_symbol: { userId: "user-1", symbol: "AAPL" } },
    });
  });

  it("returns false when no row exists", async () => {
    findUniqueMock.mockResolvedValue(null);

    await expect(isFavorited("user-1", "AAPL")).resolves.toBe(false);
  });
});

describe("listFavorites", () => {
  it("returns the user's favorites newest first", async () => {
    const createdAt = new Date("2026-10-09T00:00:00.000Z");
    findManyMock.mockResolvedValue([{ symbol: "AAPL", createdAt }]);

    const result = await listFavorites("user-1");

    expect(result).toEqual([{ symbol: "AAPL", createdAt }]);
    expect(findManyMock).toHaveBeenCalledWith({
      where: { userId: "user-1" },
      orderBy: { createdAt: "desc" },
      select: { symbol: true, createdAt: true },
    });
  });
});

describe("getFavoriteSymbols", () => {
  it("returns a Set of the user's favorited symbols", async () => {
    findManyMock.mockResolvedValue([{ symbol: "AAPL" }, { symbol: "MSFT" }]);

    const result = await getFavoriteSymbols("user-1");

    expect(result).toEqual(new Set(["AAPL", "MSFT"]));
    expect(findManyMock).toHaveBeenCalledWith({
      where: { userId: "user-1" },
      select: { symbol: true },
    });
  });
});

describe("addFavorite", () => {
  it("upserts on the composite key so a repeat save is a no-op (F3)", async () => {
    await addFavorite("user-1", "AAPL");

    expect(upsertMock).toHaveBeenCalledWith({
      where: { userId_symbol: { userId: "user-1", symbol: "AAPL" } },
      create: { userId: "user-1", symbol: "AAPL" },
      update: {},
    });
  });
});

describe("removeFavorite", () => {
  it("deletes the user's row for the symbol", async () => {
    await removeFavorite("user-1", "AAPL");

    expect(deleteManyMock).toHaveBeenCalledWith({
      where: { userId: "user-1", symbol: "AAPL" },
    });
  });
});

describe("addFavorites", () => {
  it("bulk-creates, skipping duplicates (F3)", async () => {
    await addFavorites("user-1", ["AAPL", "MSFT"]);

    expect(createManyMock).toHaveBeenCalledWith({
      data: [
        { userId: "user-1", symbol: "AAPL" },
        { userId: "user-1", symbol: "MSFT" },
      ],
      skipDuplicates: true,
    });
  });

  it("does nothing when given no symbols", async () => {
    await addFavorites("user-1", []);

    expect(createManyMock).not.toHaveBeenCalled();
  });
});
