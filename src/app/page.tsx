import Link from "next/link";

// V3 Landing page: a short explanation of the app so a visitor knows why to sign up.
export default function Home() {
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
