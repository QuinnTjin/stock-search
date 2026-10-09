import { describe, it, expect, afterEach, vi } from "vitest";
import {
  SESSION_COOKIE_NAME,
  SESSION_TTL_SECONDS,
  generateSessionToken,
  hashSessionToken,
  sessionCookieOptions,
  isSessionExpired,
} from "./session";

describe("isSessionExpired", () => {
  it("is expired when expiresAt is in the past", () => {
    const now = new Date("2026-01-01T00:00:00Z");
    const expiresAt = new Date("2025-12-31T00:00:00Z");
    expect(isSessionExpired(expiresAt, now)).toBe(true);
  });

  it("is live when expiresAt is in the future", () => {
    const now = new Date("2026-01-01T00:00:00Z");
    const expiresAt = new Date("2026-01-02T00:00:00Z");
    expect(isSessionExpired(expiresAt, now)).toBe(false);
  });

  it("treats exact-now as expired", () => {
    const now = new Date("2026-01-01T00:00:00Z");
    expect(isSessionExpired(now, now)).toBe(true);
  });
});

describe("generateSessionToken", () => {
  it("returns distinct, high-entropy values", () => {
    const a = generateSessionToken();
    const b = generateSessionToken();
    expect(a).not.toBe(b);
    expect(a.length).toBeGreaterThanOrEqual(32);
  });
});

describe("hashSessionToken", () => {
  it("is deterministic and returns 64 hex chars", () => {
    const token = generateSessionToken();
    const hash = hashSessionToken(token);
    expect(hash).toBe(hashSessionToken(token));
    expect(hash).toMatch(/^[0-9a-f]{64}$/);
  });

  it("returns different hashes for different tokens", () => {
    const a = hashSessionToken(generateSessionToken());
    const b = hashSessionToken(generateSessionToken());
    expect(a).not.toBe(b);
  });
});

describe("sessionCookieOptions", () => {
  const originalEnv = process.env.NODE_ENV;

  afterEach(() => {
    vi.stubEnv("NODE_ENV", originalEnv ?? "test");
  });

  it("sets httpOnly, sameSite=lax, path=/, and maxAge from the TTL", () => {
    const options = sessionCookieOptions();
    expect(options.httpOnly).toBe(true);
    expect(options.sameSite).toBe("lax");
    expect(options.path).toBe("/");
    expect(options.maxAge).toBe(SESSION_TTL_SECONDS);
  });

  it("is secure in production", () => {
    vi.stubEnv("NODE_ENV", "production");
    expect(sessionCookieOptions().secure).toBe(true);
  });

  it("is not secure outside production", () => {
    vi.stubEnv("NODE_ENV", "development");
    expect(sessionCookieOptions().secure).toBe(false);
  });
});

describe("SESSION_COOKIE_NAME", () => {
  it("is a non-empty string", () => {
    expect(typeof SESSION_COOKIE_NAME).toBe("string");
    expect(SESSION_COOKIE_NAME.length).toBeGreaterThan(0);
  });
});
