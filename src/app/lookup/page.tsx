import { requireUser } from "@/lib/current-user";
import { logout } from "@/app/logout/actions";

// V2 Blocked from lookup: gated server-side. Unauthenticated visitors are redirected to /login.
export default async function LookupPage() {
  const user = await requireUser();
  return (
    <>
      <h1>Stock Lookup</h1>
      <p>
        Signed in as <strong>{user.email}</strong>
      </p>
      <p style={{ color: "var(--muted)" }}>Symbol search is coming soon.</p>
      <form action={logout}>
        <button type="submit">Log out</button>
      </form>
    </>
  );
}
