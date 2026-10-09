import type { Metadata } from "next";
import Link from "next/link";
import { requireUser } from "@/lib/current-user";
import { logout } from "@/app/logout/actions";
import { Brand } from "@/components/brand";
import { ErrorIcon } from "@/components/icons";
import { normalizeSymbol, isValidSymbol } from "@/lib/symbol";
import { fetchQuote, type FinnhubResult } from "@/lib/finnhub";
import { isFavorited } from "@/lib/favorites";
import SaveButton from "./save-button";

type StockPageProps = {
  params: Promise<{ symbol: string }>;
};

const RATE_LIMITED_MESSAGE = "Too many requests right now. Please try again in a moment.";
const TIMEOUT_MESSAGE = "The price service timed out. Please try again.";
const UNAVAILABLE_MESSAGE = "Couldn't reach the price service. Please try again.";
const INVALID_MESSAGE = "That doesn't look like a valid symbol.";

const formatPrice = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
const formatDate = new Intl.DateTimeFormat("en-US", { year: "numeric", month: "long", day: "numeric" });

export async function generateMetadata({ params }: StockPageProps): Promise<Metadata> {
  const { symbol } = await params;
  return { title: `${normalizeSymbol(decodeURIComponent(symbol))} · Stock Search` };
}

function errorMessage(code: "RATE_LIMITED" | "TIMEOUT" | "CONFIG" | "UPSTREAM"): string {
  switch (code) {
    case "RATE_LIMITED":
      return RATE_LIMITED_MESSAGE;
    case "TIMEOUT":
      return TIMEOUT_MESSAGE;
    default:
      return UNAVAILABLE_MESSAGE;
  }
}

// F1–F4: a stock's detail page. Shows the opening price and a Save-to-dashboard
// toggle reflecting whether it's already saved.
export default async function StockPage({ params }: StockPageProps) {
  const user = await requireUser();
  const symbol = normalizeSymbol(decodeURIComponent((await params).symbol));
  const valid = isValidSymbol(symbol);

  let result: FinnhubResult | null = null;
  let saved = false;
  if (valid) {
    [result, saved] = await Promise.all([fetchQuote(symbol), isFavorited(user.id, symbol)]);
  }

  return (
    <div className="app">
      <header className="site-header">
        <div className="site-header__inner">
          <Brand href="/lookup" />
          <div className="site-header__actions">
            <Link className="link" href="/dashboard">
              Dashboard
            </Link>
            <Link className="link" href="/history">
              History
            </Link>
            <span className="account">{user.email}</span>
            <form action={logout}>
              <button className="btn btn--ghost btn--header" type="submit">
                Log out
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="app__main">
        <div className="lookup">
          <div className="lookup__head">
            <h1 className="title">{valid ? symbol : "Stock details"}</h1>
            <Link className="link" href="/lookup">
              ← Back to lookup
            </Link>
          </div>

          {!valid ? (
            <div role="alert" className="message message--error">
              <ErrorIcon />
              <span>{INVALID_MESSAGE}</span>
            </div>
          ) : result!.status === "FOUND" ? (
            <article className="card result-card" aria-label={`Opening price for ${symbol}`}>
              <div className="result-card__ticker">{symbol}</div>
              <div className="result-card__group">
                <span className="data-label">Opening price</span>
                <span className="result-card__price">{formatPrice.format(result!.open)}</span>
              </div>
              <div className="result-card__row">
                <span className="data-label">Applies to</span>
                <span className="result-card__date">{formatDate.format(result!.quotedAt)}</span>
              </div>
              <div className="result-card__source">Source: Finnhub</div>
            </article>
          ) : result!.status === "NOT_FOUND" ? (
            <div role="alert" className="message message--error">
              <ErrorIcon />
              <span>No quote found for {symbol}.</span>
            </div>
          ) : (
            <div role="alert" className="message message--error">
              <ErrorIcon />
              <span>{errorMessage(result!.code)}</span>
            </div>
          )}

          {valid && (
            <div className="detail-actions">
              <SaveButton symbol={symbol} initialSaved={saved} />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
