import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/current-user";
import { logout } from "@/app/logout/actions";
import { Brand } from "@/components/brand";

// V3 Landing page: a short explanation of the app so a visitor knows why to sign up.
export default async function Home() {
  const user = await getCurrentUser();

  if (user) {
    // F5: route first-time users through onboarding before anything else.
    if (!user.onboardedAt) {
      redirect("/onboarding");
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
        <main className="app__main hero">
          <div className="hero__inner">
            <div className="data-label data-label--accent">Opening price lookup</div>
            <h1 className="hero__title">Welcome back.</h1>
            <p className="hero__lead">
              Signed in as <strong>{user.email}</strong>.
            </p>
            <div className="hero__actions">
              <Link className="btn btn--primary" href="/lookup">
                Look up a stock
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="site-header">
        <div className="site-header__inner">
          <Brand href="/" />
          <Link className="btn btn--ghost btn--header" href="/login">
            Log in
          </Link>
        </div>
      </header>
      <main className="app__main hero">
        <div className="hero__inner">
          <div className="data-label data-label--accent">Opening price lookup</div>
          <h1 className="hero__title">Look up any stock&rsquo;s latest opening price.</h1>
          <p className="hero__lead">Enter a ticker. Get the open, with the date it applies to.</p>
          <div className="hero__actions">
            <Link className="btn btn--primary" href="/signup">
              Create account
            </Link>
            <Link className="btn btn--secondary" href="/login">
              Log in
            </Link>
          </div>
        </div>
        <div className="preview-card" aria-hidden="true">
          <div className="preview-card__group">
            <span className="data-label">Symbol</span>
            <span className="preview-card__bar preview-card__bar--ticker" />
          </div>
          <div className="preview-card__group">
            <span className="data-label">Opening price</span>
            <span className="preview-card__bar preview-card__bar--price" />
          </div>
          <div className="preview-card__row">
            <span className="data-label">Applies to</span>
            <span className="preview-card__bar preview-card__bar--date" />
          </div>
        </div>
      </main>
    </div>
  );
}
