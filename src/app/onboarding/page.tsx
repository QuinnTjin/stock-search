import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/current-user";
import { Brand } from "@/components/brand";
import { fetchQuote } from "@/lib/finnhub";
import { STARTER_SYMBOLS } from "./starters";
import OnboardingTiles, { type StarterTile } from "./onboarding-tiles";

export const metadata: Metadata = {
  title: "Welcome · Stock Search",
};

// F5: shown once to a new user. If they've already onboarded, skip straight
// to the dashboard.
export default async function OnboardingPage() {
  const user = await requireUser();
  if (user.onboardedAt) {
    redirect("/dashboard");
  }

  const tiles: StarterTile[] = await Promise.all(
    STARTER_SYMBOLS.map(async (symbol) => {
      const quote = await fetchQuote(symbol);
      return { symbol, open: quote.status === "FOUND" ? quote.open : null };
    }),
  );

  return (
    <div className="app">
      <header className="site-header">
        <div className="site-header__inner">
          <Brand href="/onboarding" />
          <span className="account">{user.email}</span>
        </div>
      </header>
      <main className="app__main">
        <div className="onboarding">
          <div className="onboarding__head">
            <div className="data-label data-label--accent">Step 2 · Pick your starters</div>
            <h1 className="title">Build your dashboard.</h1>
            <p className="subtitle subtitle--lg">
              Tap a few stocks to follow. You can change these anytime.
            </p>
          </div>
          <OnboardingTiles tiles={tiles} />
        </div>
      </main>
    </div>
  );
}
