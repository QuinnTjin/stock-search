import { describe, it, expect } from "vitest";
import { normalizeSymbol, isValidSymbol } from "./symbol";

describe("normalizeSymbol", () => {
  it("trims whitespace and uppercases", () => {
    expect(normalizeSymbol("  aapl ")).toBe("AAPL");
  });

  it("preserves dotted tickers", () => {
    expect(normalizeSymbol("brk.b")).toBe("BRK.B");
  });
});

describe("isValidSymbol", () => {
  it("accepts normal and dotted symbols", () => {
    expect(isValidSymbol("AAPL")).toBe(true);
    expect(isValidSymbol("BRK.B")).toBe(true);
  });

  it("rejects empty and malformed input", () => {
    expect(isValidSymbol("")).toBe(false);
    expect(isValidSymbol("A PL")).toBe(false);
    expect(isValidSymbol("'; DROP TABLE")).toBe(false);
  });
});
