/**
 * Normalize a user-entered stock symbol before lookup or storage.
 * Finnhub returns empty data for lowercase symbols, so we trim and uppercase.
 * Allows dotted tickers like BRK.B.
 */
export function normalizeSymbol(input: string): string {
  return input.trim().toUpperCase();
}

/** A syntactically plausible symbol: 1-10 chars, letters/digits with optional dots. */
export function isValidSymbol(symbol: string): boolean {
  return /^[A-Z0-9]{1,8}(\.[A-Z0-9]{1,4})?$/.test(symbol);
}
