import { describe, it, expect, vi, beforeEach } from "vitest";

const { requireUserMock } = vi.hoisted(() => ({ requireUserMock: vi.fn() }));
const { isFavoritedMock } = vi.hoisted(() => ({ isFavoritedMock: vi.fn() }));
const { addFavoriteMock } = vi.hoisted(() => ({ addFavoriteMock: vi.fn() }));
const { removeFavoriteMock } = vi.hoisted(() => ({ removeFavoriteMock: vi.fn() }));
const { revalidatePathMock } = vi.hoisted(() => ({ revalidatePathMock: vi.fn() }));

vi.mock("@/lib/current-user", () => ({ requireUser: requireUserMock }));
vi.mock("@/lib/favorites", () => ({
  isFavorited: isFavoritedMock,
  addFavorite: addFavoriteMock,
  removeFavorite: removeFavoriteMock,
}));
vi.mock("next/cache", () => ({ revalidatePath: revalidatePathMock }));

import { toggleFavorite } from "./actions";

beforeEach(() => {
  requireUserMock.mockReset().mockResolvedValue({ id: "user-1", email: "a@b.com" });
  isFavoritedMock.mockReset();
  addFavoriteMock.mockReset().mockResolvedValue(undefined);
  removeFavoriteMock.mockReset().mockResolvedValue(undefined);
  revalidatePathMock.mockReset();
});

describe("toggleFavorite", () => {
  it("adds the favorite when not already saved and returns saved: true", async () => {
    isFavoritedMock.mockResolvedValue(false);

    const result = await toggleFavorite("AAPL");

    expect(result).toEqual({ saved: true });
    expect(addFavoriteMock).toHaveBeenCalledWith("user-1", "AAPL");
    expect(removeFavoriteMock).not.toHaveBeenCalled();
  });

  it("removes the favorite when already saved and returns saved: false", async () => {
    isFavoritedMock.mockResolvedValue(true);

    const result = await toggleFavorite("AAPL");

    expect(result).toEqual({ saved: false });
    expect(removeFavoriteMock).toHaveBeenCalledWith("user-1", "AAPL");
    expect(addFavoriteMock).not.toHaveBeenCalled();
  });

  it("normalizes the symbol before checking and saving", async () => {
    isFavoritedMock.mockResolvedValue(false);

    await toggleFavorite(" brk.b ");

    expect(isFavoritedMock).toHaveBeenCalledWith("user-1", "BRK.B");
    expect(addFavoriteMock).toHaveBeenCalledWith("user-1", "BRK.B");
  });

  it("rejects an invalid symbol without touching favorites", async () => {
    await expect(toggleFavorite("!!!")).rejects.toThrow();

    expect(isFavoritedMock).not.toHaveBeenCalled();
    expect(addFavoriteMock).not.toHaveBeenCalled();
    expect(removeFavoriteMock).not.toHaveBeenCalled();
  });

  it("enforces the auth gate via requireUser", async () => {
    isFavoritedMock.mockResolvedValue(false);

    await toggleFavorite("AAPL");

    expect(requireUserMock).toHaveBeenCalled();
  });

  it("revalidates the dashboard after a change", async () => {
    isFavoritedMock.mockResolvedValue(false);

    await toggleFavorite("AAPL");

    expect(revalidatePathMock).toHaveBeenCalledWith("/dashboard");
  });
});
