import { describe, it, expect } from "vitest";
import { normalizeEmail, isValidEmail, validatePassword } from "./auth";

describe("normalizeEmail", () => {
  it("trims whitespace and lowercases", () => {
    expect(normalizeEmail("  Alice@Example.com ")).toBe("alice@example.com");
  });
});

describe("isValidEmail", () => {
  it("accepts a plausible email", () => {
    expect(isValidEmail("alice@example.com")).toBe(true);
  });

  it("rejects missing @, missing domain, and whitespace", () => {
    expect(isValidEmail("alice.example.com")).toBe(false);
    expect(isValidEmail("alice@example")).toBe(false);
    expect(isValidEmail("alice @example.com")).toBe(false);
    expect(isValidEmail("")).toBe(false);
  });
});

describe("validatePassword", () => {
  it("accepts passwords of 8 or more characters", () => {
    expect(validatePassword("password")).toBe(true);
    expect(validatePassword("12345678")).toBe(true);
  });

  it("rejects passwords under 8 characters", () => {
    expect(validatePassword("short")).toBe(false);
    expect(validatePassword("")).toBe(false);
  });
});
