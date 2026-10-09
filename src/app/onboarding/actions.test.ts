import { describe, it, expect, vi, beforeEach } from "vitest";

const { requireUserMock } = vi.hoisted(() => ({ requireUserMock: vi.fn() }));
const { addFavoritesMock } = vi.hoisted(() => ({ addFavoritesMock: vi.fn() }));
const { userUpdateMock } = vi.hoisted(() => ({ userUpdateMock: vi.fn() }));
const { redirectMock } = vi.hoisted(() => ({ redirectMock: vi.fn() }));

vi.mock("@/lib/current-user", () => ({ requireUser: requireUserMock }));
vi.mock("@/lib/favorites", () => ({ addFavorites: addFavoritesMock }));
vi.mock("@/db", () => ({ prisma: { user: { update: userUpdateMock } } }));
vi.mock("next/navigation", () => ({ redirect: redirectMock }));

import { finishOnboarding, skipOnboarding } from "./actions";

beforeEach(() => {
  requireUserMock.mockReset().mockResolvedValue({ id: "user-1", email: "a@b.com" });
  addFavoritesMock.mockReset().mockResolvedValue(undefined);
  userUpdateMock.mockReset().mockResolvedValue({});
  redirectMock.mockReset();
});

describe("finishOnboarding", () => {
  it("saves the picked starter symbols", async () => {
    await finishOnboarding(["AAPL", "MSFT"]);

    expect(addFavoritesMock).toHaveBeenCalledWith("user-1", ["AAPL", "MSFT"]);
  });

  it("ignores symbols that are not starter tiles", async () => {
    await finishOnboarding(["AAPL", "HACK", "ZZZZ"]);

    expect(addFavoritesMock).toHaveBeenCalledWith("user-1", ["AAPL"]);
  });

  it("marks the user onboarded and redirects to the dashboard", async () => {
    await finishOnboarding(["AAPL"]);

    expect(userUpdateMock).toHaveBeenCalledWith({
      where: { id: "user-1" },
      data: { onboardedAt: expect.any(Date) },
    });
    expect(redirectMock).toHaveBeenCalledWith("/dashboard");
  });

  it("completes even when nothing was picked", async () => {
    await finishOnboarding([]);

    expect(addFavoritesMock).toHaveBeenCalledWith("user-1", []);
    expect(userUpdateMock).toHaveBeenCalled();
    expect(redirectMock).toHaveBeenCalledWith("/dashboard");
  });
});

describe("skipOnboarding", () => {
  it("saves nothing but marks the user onboarded and redirects", async () => {
    await skipOnboarding();

    expect(addFavoritesMock).not.toHaveBeenCalled();
    expect(userUpdateMock).toHaveBeenCalledWith({
      where: { id: "user-1" },
      data: { onboardedAt: expect.any(Date) },
    });
    expect(redirectMock).toHaveBeenCalledWith("/dashboard");
  });
});
