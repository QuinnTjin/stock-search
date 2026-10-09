"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signup, type SignupState } from "./actions";

const initialState: SignupState = {};

export default function SignupPage() {
  const [state, formAction, isPending] = useActionState(signup, initialState);

  if (state.success) {
    return (
      <>
        <h1>Account created</h1>
        <p>Account created — you can now log in.</p>
        <p>
          <Link href="/login">Log in</Link>
        </p>
      </>
    );
  }

  return (
    <>
      <h1>Create an account</h1>
      <form action={formAction}>
        <div style={{ marginBottom: "1rem" }}>
          <label htmlFor="email">Email</label>
          <br />
          <input id="email" name="email" type="email" required autoComplete="email" />
        </div>

        <div style={{ marginBottom: "1rem" }}>
          <label htmlFor="password">Password</label>
          <br />
          <input
            id="password"
            name="password"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
          />
        </div>

        {state.error && <p style={{ color: "#ff6b6b" }}>{state.error}</p>}

        <button type="submit" disabled={isPending}>
          {isPending ? "Creating account…" : "Create account"}
        </button>
      </form>
      <p>
        Already have an account? <Link href="/login">Log in</Link>
      </p>
    </>
  );
}
