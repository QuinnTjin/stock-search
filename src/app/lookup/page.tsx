import type { Metadata } from "next";
import Link from "next/link";
import { requireUser } from "@/lib/current-user";
import { logout } from "@/app/logout/actions";
import { Brand } from "@/components/brand";
import { normalizeSymbol } from "@/lib/symbol";
import LookupForm from "./lookup-form";

export const metadata: Metadata = {
  title: "Lookup · Stock Search",
};

type LookupPageProps = {
  searchParams: Promise<{ symbol?: string }>;
};

// V2 Blocked from lookup: gated server-side. Unauthenticated visitors are redirected to /login.
export default async function LookupPage({ searchParams }: LookupPageProps) {
  const user = await requireUser();
  const { symbol } = await searchParams;
  const initialSymbol = symbol ? normalizeSymbol(symbol) : undefined;

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
            <h1 className="title">Stock lookup</h1>
            <p className="subtitle subtitle--lg">Enter a ticker. Get the open.</p>
          </div>
          <LookupForm initialSymbol={initialSymbol} />
        </div>
      </main>
    </div>
  );
}
