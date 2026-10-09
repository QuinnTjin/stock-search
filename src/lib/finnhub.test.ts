import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { fetchQuote } from "./finnhub";

function jsonResponse(body: unknown, ok = true, status = 200) {
  return {
    ok,
    status,
    json: () => Promise.resolve(body),
  } as Response;
}

beforeEach(() => {
  vi.stubGlobal("fetch", vi.fn());
  vi.stubEnv("FINNHUB_API_KEY", "test-key");
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe("fetchQuote", () => {
  it("returns FOUND with open price and quotedAt from a non-zero open", async () => {
    vi.mocked(fetch).mockResolvedValue(
      jsonResponse({ c: 151, h: 152, l: 149, o: 150.25, pc: 148, d: 1, dp: 0.5, t: 1700000000 })
    );

    const result = await fetchQuote("AAPL");

    expect(result).toEqual({ status: "FOUND", open: 150.25, quotedAt: new Date(1700000000 * 1000) });
  });

  it("returns NOT_FOUND when open is zero (unknown symbol)", async () => {
    vi.mocked(fetch).mockResolvedValue(
      jsonResponse({ c: 0, h: 0, l: 0, o: 0, pc: 0, d: 0, dp: 0, t: 0 })
    );

    const result = await fetchQuote("ZZZZZ");

    expect(result).toEqual({ status: "NOT_FOUND" });
  });

  it("returns RATE_LIMITED on a 429 response", async () => {
    vi.mocked(fetch).mockResolvedValue(jsonResponse({}, false, 429));

    const result = await fetchQuote("AAPL");

    expect(result).toEqual({ status: "ERROR", code: "RATE_LIMITED" });
  });

  it("returns UPSTREAM on other non-ok responses", async () => {
    vi.mocked(fetch).mockResolvedValue(jsonResponse({}, false, 500));

    const result = await fetchQuote("AAPL");

    expect(result).toEqual({ status: "ERROR", code: "UPSTREAM" });
  });

  it("returns TIMEOUT when the fetch aborts", async () => {
    const abortError = new Error("The operation was aborted");
    abortError.name = "TimeoutError";
    vi.mocked(fetch).mockRejectedValue(abortError);

    const result = await fetchQuote("AAPL");

    expect(result).toEqual({ status: "ERROR", code: "TIMEOUT" });
  });

  it("returns UPSTREAM when fetch throws an unexpected error", async () => {
    vi.mocked(fetch).mockRejectedValue(new Error("network down"));

    const result = await fetchQuote("AAPL");

    expect(result).toEqual({ status: "ERROR", code: "UPSTREAM" });
  });

  it("returns CONFIG without calling fetch when the API key is unset", async () => {
    vi.stubEnv("FINNHUB_API_KEY", "");

    const result = await fetchQuote("AAPL");

    expect(result).toEqual({ status: "ERROR", code: "CONFIG" });
    expect(fetch).not.toHaveBeenCalled();
  });
});
