import type { Metadata } from "next";
import Link from "next/link";
import { requireUser } from "@/lib/current-user";
import { getRecentLookups, type HistoryEntry } from "@/lib/history";
import { logout } from "@/app/logout/actions";
import { Brand } from "@/components/brand";

export const metadata: Metadata = {
  title: "History · Stock Search",
};

const formatPrice = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

const formatDate = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "long",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

const OUTCOME_LABEL: Record<HistoryEntry["outcome"], string> = {
  FOUND: "Found",
  NOT_FOUND: "Not found",
  ERROR: "Error",
};

// U6 Gated like /lookup: unauthenticated visitors are redirected to /login.
export default async function HistoryPage() {
  const user = await requireUser();
  const entries = await getRecentLookups(user.id);

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
        <div className="history">
          <div className="history__head">
            <h1 className="title">Search history</h1>
            <p className="subtitle subtitle--lg">Your recent lookups. Click one to repeat it.</p>
          </div>

          {entries.length === 0 ? (
            <div className="card status-card">
              <h2 className="status-card__title">No lookups yet</h2>
              <p className="status-card__text">
                Once you look up a symbol, it will show up here.{" "}
                <Link className="link" href="/lookup">
                  Go to lookup
                </Link>
                .
              </p>
            </div>
          ) : (
            <ul className="history__list">
              {entries.map((entry) => (
                <li key={entry.id}>
                  <Link className="card history__item" href={`/lookup?symbol=${entry.symbol}`}>
                    <span className="history__symbol">{entry.symbol}</span>
                    <span className={`history__badge history__badge--${entry.outcome.toLowerCase()}`}>
                      {OUTCOME_LABEL[entry.outcome]}
                    </span>
                    <span className="history__price">
                      {entry.outcome === "FOUND" && entry.open !== null ? formatPrice.format(entry.open) : "—"}
                    </span>
                    <span className="history__date">{formatDate.format(entry.createdAt)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </div>
  );
}
