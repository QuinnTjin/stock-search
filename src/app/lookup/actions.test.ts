import { describe, it, expect, vi, beforeEach } from "vitest";

const { requireUserMock } = vi.hoisted(() => ({ requireUserMock: vi.fn() }));
const { fetchQuoteMock } = vi.hoisted(() => ({ fetchQuoteMock: vi.fn() }));
const { stockLookupCreateMock } = vi.hoisted(() => ({ stockLookupCreateMock: vi.fn() }));

vi.mock("@/lib/current-user", () => ({ requireUser: requireUserMock }));
vi.mock("@/lib/finnhub", () => ({ fetchQuote: fetchQuoteMock }));
vi.mock("@/db", () => ({ prisma: { stockLookup: { create: stockLookupCreateMock } } }));

import { lookupQuote, type LookupState } from "./actions";

const INITIAL_STATE: LookupState = { status: "idle" };

function formDataWithSymbol(symbol: string): FormData {
  const formData = new FormData();
  formData.set("symbol", symbol);
  return formData;
}

beforeEach(() => {
  requireUserMock.mockReset().mockResolvedValue({ id: "user-1", email: "alice@example.com" });
  fetchQuoteMock.mockReset();
  stockLookupCreateMock.mockReset().mockResolvedValue({});
});

describe("lookupQuote", () => {
  it("short-circuits on an invalid symbol without calling fetchQuote", async () => {
    const result = await lookupQuote(INITIAL_STATE, formDataWithSymbol("!!!"));

    expect(result).toEqual({ status: "error", message: "Enter a valid symbol like AAPL or BRK.B." });
    expect(fetchQuoteMock).not.toHaveBeenCalled();
  });

  it("writes no history for an invalid symbol", async () => {
    await lookupQuote(INITIAL_STATE, formDataWithSymbol("!!!"));

    expect(stockLookupCreateMock).not.toHaveBeenCalled();
  });

  it("normalizes the symbol before calling fetchQuote", async () => {
    fetchQuoteMock.mockResolvedValue({ status: "NOT_FOUND" });

    await lookupQuote(INITIAL_STATE, formDataWithSymbol(" brk.b "));

    expect(fetchQuoteMock).toHaveBeenCalledWith("BRK.B");
  });

  it("maps FOUND to a found state with symbol, open price, and a formatted date", async () => {
    fetchQuoteMock.mockResolvedValue({
      status: "FOUND",
      open: 150.25,
      quotedAt: new Date("2026-10-08T14:30:00.000Z"),
    });

    const result = await lookupQuote(INITIAL_STATE, formDataWithSymbol("aapl"));

    expect(result).toEqual({
      status: "found",
      symbol: "AAPL",
      open: 150.25,
      asOf: new Date("2026-10-08T14:30:00.000Z").toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
    });
  });

  it("writes a FOUND history row with a nested quote and servedFromCache false", async () => {
    const quotedAt = new Date("2026-10-08T14:30:00.000Z");
    fetchQuoteMock.mockResolvedValue({ status: "FOUND", open: 150.25, quotedAt });

    await lookupQuote(INITIAL_STATE, formDataWithSymbol("aapl"));

    expect(stockLookupCreateMock).toHaveBeenCalledWith({
      data: {
        user: { connect: { id: "user-1" } },
        symbol: "AAPL",
        servedFromCache: false,
        quote: {
          create: { symbol: "AAPL", status: "FOUND", openPrice: 150.25, quotedAt },
        },
      },
    });
  });

  it("maps NOT_FOUND to a 'no quote found' error message", async () => {
    fetchQuoteMock.mockResolvedValue({ status: "NOT_FOUND" });

    const result = await lookupQuote(INITIAL_STATE, formDataWithSymbol("ZZZZZ"));

    expect(result).toEqual({ status: "error", message: "No quote found for ZZZZZ." });
  });

  it("writes a NOT_FOUND history row with a nested quote and no prices", async () => {
    fetchQuoteMock.mockResolvedValue({ status: "NOT_FOUND" });

    await lookupQuote(INITIAL_STATE, formDataWithSymbol("ZZZZZ"));

    expect(stockLookupCreateMock).toHaveBeenCalledWith({
      data: {
        user: { connect: { id: "user-1" } },
        symbol: "ZZZZZ",
        servedFromCache: false,
        quote: { create: { symbol: "ZZZZZ", status: "NOT_FOUND" } },
      },
    });
  });

  it("maps RATE_LIMITED to a 'try again in a moment' message", async () => {
    fetchQuoteMock.mockResolvedValue({ status: "ERROR", code: "RATE_LIMITED" });

    const result = await lookupQuote(INITIAL_STATE, formDataWithSymbol("AAPL"));

    expect(result).toEqual({
      status: "error",
      message: "Too many requests right now. Please try again in a moment.",
    });
  });

  it("maps TIMEOUT to a timed-out message", async () => {
    fetchQuoteMock.mockResolvedValue({ status: "ERROR", code: "TIMEOUT" });

    const result = await lookupQuote(INITIAL_STATE, formDataWithSymbol("AAPL"));

    expect(result).toEqual({
      status: "error",
      message: "The price service timed out. Please try again.",
    });
  });

  it("maps CONFIG to a generic unavailable message", async () => {
    fetchQuoteMock.mockResolvedValue({ status: "ERROR", code: "CONFIG" });

    const result = await lookupQuote(INITIAL_STATE, formDataWithSymbol("AAPL"));

    expect(result).toEqual({
      status: "error",
      message: "Couldn't reach the price service. Please try again.",
    });
  });

  it("maps UPSTREAM to a generic unavailable message", async () => {
    fetchQuoteMock.mockResolvedValue({ status: "ERROR", code: "UPSTREAM" });

    const result = await lookupQuote(INITIAL_STATE, formDataWithSymbol("AAPL"));

    expect(result).toEqual({
      status: "error",
      message: "Couldn't reach the price service. Please try again.",
    });
  });

  it.each(["RATE_LIMITED", "TIMEOUT", "CONFIG", "UPSTREAM"] as const)(
    "writes an ERROR history row with errorCode %s and no quote",
    async (code) => {
      fetchQuoteMock.mockResolvedValue({ status: "ERROR", code });

      await lookupQuote(INITIAL_STATE, formDataWithSymbol("AAPL"));

      expect(stockLookupCreateMock).toHaveBeenCalledWith({
        data: {
          userId: "user-1",
          symbol: "AAPL",
          servedFromCache: false,
          errorCode: code,
        },
      });
    },
  );

  it("calls requireUser to enforce the endpoint-level auth gate", async () => {
    fetchQuoteMock.mockResolvedValue({ status: "NOT_FOUND" });

    await lookupQuote(INITIAL_STATE, formDataWithSymbol("AAPL"));

    expect(requireUserMock).toHaveBeenCalled();
  });

  it("still returns the found state when the history write fails", async () => {
    fetchQuoteMock.mockResolvedValue({
      status: "FOUND",
      open: 150.25,
      quotedAt: new Date("2026-10-08T14:30:00.000Z"),
    });
    stockLookupCreateMock.mockRejectedValue(new Error("db unavailable"));

    const result = await lookupQuote(INITIAL_STATE, formDataWithSymbol("AAPL"));

    expect(result.status).toBe("found");
  });

  it("still returns the error state when the history write fails", async () => {
    fetchQuoteMock.mockResolvedValue({ status: "NOT_FOUND" });
    stockLookupCreateMock.mockRejectedValue(new Error("db unavailable"));

    const result = await lookupQuote(INITIAL_STATE, formDataWithSymbol("ZZZZZ"));

    expect(result).toEqual({ status: "error", message: "No quote found for ZZZZZ." });
  });
});
