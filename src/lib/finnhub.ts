const FINNHUB_QUOTE_URL = "https://finnhub.io/api/v1/quote";
const REQUEST_TIMEOUT_MS = 5000;

export type FinnhubResult =
  | { status: "FOUND"; open: number; quotedAt: Date }
  | { status: "NOT_FOUND" }
  | { status: "ERROR"; code: "RATE_LIMITED" | "TIMEOUT" | "CONFIG" | "UPSTREAM" };

type FinnhubQuoteResponse = {
  c: number;
  h: number;
  l: number;
  o: number;
  pc: number;
  d: number;
  dp: number;
  t: number;
};

/** Fetch the latest quote for an already-normalized symbol from Finnhub. */
export async function fetchQuote(symbol: string): Promise<FinnhubResult> {
  const apiKey = process.env.FINNHUB_API_KEY;
  if (!apiKey) {
    return { status: "ERROR", code: "CONFIG" };
  }

  const url = `${FINNHUB_QUOTE_URL}?symbol=${encodeURIComponent(symbol)}&token=${apiKey}`;

  let response: Response;
  try {
    response = await fetch(url, { signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS) });
  } catch (err) {
    const name = err instanceof Error ? err.name : undefined;
    if (name === "TimeoutError" || name === "AbortError") {
      return { status: "ERROR", code: "TIMEOUT" };
    }
    return { status: "ERROR", code: "UPSTREAM" };
  }

  if (!response.ok) {
    if (response.status === 429) {
      return { status: "ERROR", code: "RATE_LIMITED" };
    }
    return { status: "ERROR", code: "UPSTREAM" };
  }

  const data = (await response.json()) as FinnhubQuoteResponse;
  if (!data.o) {
    return { status: "NOT_FOUND" };
  }

  return { status: "FOUND", open: data.o, quotedAt: new Date(data.t * 1000) };
}
