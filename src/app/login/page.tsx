"use client";

import Link from "next/link";
import { useActionState } from "react";
import { login, type LoginState } from "./actions";

const initialState: LoginState = {};

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(login, initialState);

  return (
    <>
      <h1>Log in</h1>
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
            autoComplete="current-password"
          />
        </div>

        {state.error && <p style={{ color: "#ff6b6b" }}>{state.error}</p>}

        <button type="submit" disabled={isPending}>
          {isPending ? "Logging in…" : "Log in"}
        </button>
      </form>
      <p>
        Don&apos;t have an account? <Link href="/signup">Sign up</Link>
      </p>
    </>
  );
}
