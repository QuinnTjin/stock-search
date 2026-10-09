"use server";

import { prisma } from "@/db";
import { QuoteStatus } from "@/generated/prisma/client";
import { requireUser } from "@/lib/current-user";
import { fetchQuote } from "@/lib/finnhub";
import { normalizeSymbol, isValidSymbol } from "@/lib/symbol";

export type LookupState =
  | { status: "idle" }
  | { status: "found"; symbol: string; open: number; asOf: string }
  | { status: "error"; message: string };

const INVALID_SYMBOL_MESSAGE = "Enter a valid symbol like AAPL or BRK.B.";
const RATE_LIMITED_MESSAGE = "Too many requests right now. Please try again in a moment.";
const TIMEOUT_MESSAGE = "The price service timed out. Please try again.";
const UNAVAILABLE_MESSAGE = "Couldn't reach the price service. Please try again.";

export async function lookupQuote(_prev: LookupState, formData: FormData): Promise<LookupState> {
  const user = await requireUser();

  const symbol = normalizeSymbol(String(formData.get("symbol") ?? ""));
  if (!isValidSymbol(symbol)) {
    return { status: "error", message: INVALID_SYMBOL_MESSAGE };
  }

  const result = await fetchQuote(symbol);

  // U6: history is best-effort — a DB hiccup must never take down a working lookup (U3).
  try {
    if (result.status === "FOUND") {
      await prisma.stockLookup.create({
        data: {
          user: { connect: { id: user.id } },
          symbol,
          servedFromCache: false,
          quote: { create: { symbol, status: QuoteStatus.FOUND, openPrice: result.open, quotedAt: result.quotedAt } },
        },
      });
    } else if (result.status === "NOT_FOUND") {
      await prisma.stockLookup.create({
        data: {
          user: { connect: { id: user.id } },
          symbol,
          servedFromCache: false,
          quote: { create: { symbol, status: QuoteStatus.NOT_FOUND } },
        },
      });
    } else {
      await prisma.stockLookup.create({
        data: { userId: user.id, symbol, servedFromCache: false, errorCode: result.code },
      });
    }
  } catch (err) {
    console.error("Failed to write stock lookup history:", err);
  }

  switch (result.status) {
    case "FOUND":
      return {
        status: "found",
        symbol,
        open: result.open,
        asOf: result.quotedAt.toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
      };
    case "NOT_FOUND":
      return { status: "error", message: `No quote found for ${symbol}.` };
    case "ERROR":
      switch (result.code) {
        case "RATE_LIMITED":
          return { status: "error", message: RATE_LIMITED_MESSAGE };
        case "TIMEOUT":
          return { status: "error", message: TIMEOUT_MESSAGE };
        case "CONFIG":
        case "UPSTREAM":
          return { status: "error", message: UNAVAILABLE_MESSAGE };
      }
  }
}
