import type { Metadata } from "next";
import Link from "next/link";
import { requireUser } from "@/lib/current-user";
import { logout } from "@/app/logout/actions";
import { Brand } from "@/components/brand";
import { listFavorites } from "@/lib/favorites";
import { fetchQuote } from "@/lib/finnhub";

export const metadata: Metadata = {
  title: "Dashboard · Stock Search",
};

const formatPrice = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

// F1/F5: the signed-in user's saved stocks, each with its latest opening price.
// Quotes are fetched fresh per load (TTL cache reuse is a future optimization).
export default async function DashboardPage() {
  const user = await requireUser();
  const favorites = await listFavorites(user.id);

  const tiles = await Promise.all(
    favorites.map(async (fav) => {
      const quote = await fetchQuote(fav.symbol);
      return { symbol: fav.symbol, open: quote.status === "FOUND" ? quote.open : null };
    }),
  );

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
        <div className="dashboard">
          <div className="dashboard__head">
            <h1 className="title">Your dashboard</h1>
            <p className="subtitle subtitle--lg">The stocks you&rsquo;ve saved. Click one for details.</p>
          </div>

          {tiles.length === 0 ? (
            <div className="card status-card">
              <h2 className="status-card__title">No saved stocks yet</h2>
              <p className="status-card__text">
                Look up a stock and tap &ldquo;Save to dashboard&rdquo; to pin it here.{" "}
                <Link className="link" href="/lookup">
                  Go to lookup
                </Link>
                .
              </p>
            </div>
          ) : (
            <ul className="dashboard__grid">
              {tiles.map((tile) => (
                <li key={tile.symbol}>
                  <Link className="card dashboard__tile" href={`/stock/${tile.symbol}`}>
                    <span className="dashboard__symbol">{tile.symbol}</span>
                    <span className="dashboard__price">
                      {tile.open !== null ? formatPrice.format(tile.open) : "—"}
                    </span>
                    <span className="data-label">Opening price</span>
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
