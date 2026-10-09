import Link from "next/link";
import { getCurrentUser } from "@/lib/current-user";
import { logout } from "@/app/logout/actions";

// V3 Landing page: a short explanation of the app so a visitor knows why to sign up.
export default async function Home() {
  const user = await getCurrentUser();

  if (user) {
    return (
      <>
        <h1>Stock Search</h1>
        <p>
          Signed in as <strong>{user.email}</strong>
        </p>
        <form action={logout}>
          <button type="submit">Log out</button>
        </form>
      </>
    );
  }

  return (
    <>
      <h1>Stock Search</h1>
      <p style={{ color: "var(--muted)" }}>
        Sign in to look up a stock&apos;s opening price. Enter a symbol like{" "}
        <code>AAPL</code> and get its latest open, with the date it applies to.
      </p>
      <p>
        <Link href="/signup">Create an account</Link> &nbsp;·&nbsp;{" "}
        <Link href="/login">Log in</Link>
      </p>
    </>
  );
}
