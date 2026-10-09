import { requireUser } from "@/lib/current-user";
import { logout } from "@/app/logout/actions";
import LookupForm from "./lookup-form";

// V2 Blocked from lookup: gated server-side. Unauthenticated visitors are redirected to /login.
export default async function LookupPage() {
  const user = await requireUser();
  return (
    <>
      <h1>Stock Lookup</h1>
      <p>
        Signed in as <strong>{user.email}</strong>
      </p>
      <LookupForm />
      <form action={logout}>
        <button type="submit">Log out</button>
      </form>
    </>
  );
}
