import { describe, it, expect, vi, beforeEach } from "vitest";

const { cookiesMock } = vi.hoisted(() => ({ cookiesMock: vi.fn() }));
const { findUniqueMock } = vi.hoisted(() => ({ findUniqueMock: vi.fn() }));
const { redirectMock } = vi.hoisted(() => ({
  redirectMock: vi.fn((path: string) => {
    throw new Error(`REDIRECT:${path}`);
  }),
}));

vi.mock("next/headers", () => ({ cookies: cookiesMock }));
vi.mock("@/db", () => ({ prisma: { session: { findUnique: findUniqueMock } } }));
vi.mock("next/navigation", () => ({ redirect: redirectMock }));

import { getCurrentUser, requireUser } from "./current-user";

function cookieJar(token: string | undefined) {
  return { get: () => (token === undefined ? undefined : { value: token }) };
}

const LIVE_SESSION = {
  expiresAt: new Date(Date.now() + 1000 * 60 * 60),
  user: { id: "user-1", email: "alice@example.com", onboardedAt: null },
};

const EXPIRED_SESSION = {
  expiresAt: new Date(Date.now() - 1000 * 60 * 60),
  user: { id: "user-1", email: "alice@example.com", onboardedAt: null },
};

beforeEach(() => {
  cookiesMock.mockReset();
  findUniqueMock.mockReset();
  redirectMock.mockClear();
});

describe("getCurrentUser", () => {
  it("returns null when there is no session cookie", async () => {
    cookiesMock.mockResolvedValue(cookieJar(undefined));

    expect(await getCurrentUser()).toBeNull();
    expect(findUniqueMock).not.toHaveBeenCalled();
  });

  it("returns the user for a valid live session", async () => {
    cookiesMock.mockResolvedValue(cookieJar("raw-token"));
    findUniqueMock.mockResolvedValue(LIVE_SESSION);

    expect(await getCurrentUser()).toEqual({ id: "user-1", email: "alice@example.com", onboardedAt: null });
  });

  it("returns null for an expired session", async () => {
    cookiesMock.mockResolvedValue(cookieJar("raw-token"));
    findUniqueMock.mockResolvedValue(EXPIRED_SESSION);

    expect(await getCurrentUser()).toBeNull();
  });

  it("returns null when the session does not exist", async () => {
    cookiesMock.mockResolvedValue(cookieJar("raw-token"));
    findUniqueMock.mockResolvedValue(null);

    expect(await getCurrentUser()).toBeNull();
  });
});

describe("requireUser", () => {
  it("redirects to /login when there is no session", async () => {
    cookiesMock.mockResolvedValue(cookieJar(undefined));

    await expect(requireUser()).rejects.toThrow("REDIRECT:/login");
    expect(redirectMock).toHaveBeenCalledWith("/login");
  });

  it("redirects to /login when the session is expired", async () => {
    cookiesMock.mockResolvedValue(cookieJar("raw-token"));
    findUniqueMock.mockResolvedValue(EXPIRED_SESSION);

    await expect(requireUser()).rejects.toThrow("REDIRECT:/login");
    expect(redirectMock).toHaveBeenCalledWith("/login");
  });

  it("returns the user and does not redirect for a valid session", async () => {
    cookiesMock.mockResolvedValue(cookieJar("raw-token"));
    findUniqueMock.mockResolvedValue(LIVE_SESSION);

    expect(await requireUser()).toEqual({ id: "user-1", email: "alice@example.com", onboardedAt: null });
    expect(redirectMock).not.toHaveBeenCalled();
  });
});
