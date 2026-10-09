import { describe, it, expect } from "vitest";
import argon2 from "argon2";
import { hashPassword, verifyPassword } from "./password";

describe("hashPassword", () => {
  it("produces an argon2id hash", async () => {
    const hash = await hashPassword("correct-horse-battery-staple");
    expect(hash.startsWith("$argon2id$")).toBe(true);
  });

  it("salts each hash so the same password hashes differently", async () => {
    const [a, b] = await Promise.all([
      hashPassword("correct-horse-battery-staple"),
      hashPassword("correct-horse-battery-staple"),
    ]);
    expect(a).not.toBe(b);
  });

  it("verifies against the original password", async () => {
    const hash = await hashPassword("correct-horse-battery-staple");
    expect(await argon2.verify(hash, "correct-horse-battery-staple")).toBe(true);
    expect(await argon2.verify(hash, "wrong-password")).toBe(false);
  });
});

describe("verifyPassword", () => {
  it("returns true for the correct password", async () => {
    const hash = await hashPassword("correct-horse-battery-staple");
    expect(await verifyPassword(hash, "correct-horse-battery-staple")).toBe(true);
  });

  it("returns false for the wrong password", async () => {
    const hash = await hashPassword("correct-horse-battery-staple");
    expect(await verifyPassword(hash, "wrong-password")).toBe(false);
  });

  it("returns false for a malformed hash instead of throwing", async () => {
    await expect(verifyPassword("not-a-real-hash", "whatever")).resolves.toBe(false);
  });
});
