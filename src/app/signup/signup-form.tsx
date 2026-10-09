"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signup, type SignupState } from "./actions";
import { PasswordField } from "@/components/password-field";
import { ErrorIcon, Spinner } from "@/components/icons";

const initialState: SignupState = {};

export default function SignupForm() {
  const [state, formAction, isPending] = useActionState(signup, initialState);

  if (state.success) {
    return (
      <div className="card auth-card">
        <div className="auth-card__head">
          <h1 className="title">Account created</h1>
          <p className="subtitle">You can now log in.</p>
        </div>
        <Link className="btn btn--primary btn--block" href="/login">
          Log in
        </Link>
      </div>
    );
  }

  return (
    <form className="card auth-card" action={formAction} noValidate>
      <div className="auth-card__head">
        <h1 className="title">Create your account</h1>
        <p className="subtitle">It takes a few seconds.</p>
      </div>

      {state.error && (
        <div role="alert" className="message message--error">
          <ErrorIcon />
          <span>{state.error}</span>
        </div>
      )}

      <div className="auth-card__fields">
        <div className="field">
          <label className="field__label" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            name="email"
            className="input"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            autoFocus
            disabled={isPending}
            required
          />
        </div>
        <PasswordField
          id="pw"
          name="password"
          label="Password"
          autoComplete="new-password"
          minLength={8}
          disabled={isPending}
          helpId="pwhelp"
          helpText="At least 8 characters."
        />
      </div>

      <button className="btn btn--primary btn--block" type="submit" disabled={isPending} aria-busy={isPending}>
        {isPending && <Spinner />}
        {isPending ? "Creating account…" : "Create account"}
      </button>
      <div className="auth-card__foot">
        Already have an account? <Link className="link" href="/login">Log in</Link>
      </div>
    </form>
  );
}
