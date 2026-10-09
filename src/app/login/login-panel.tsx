"use client";

import { useActionState } from "react";
import { login, type LoginState } from "./actions";
import { PasswordField } from "@/components/password-field";
import { ErrorIcon, Spinner } from "@/components/icons";

const initialState: LoginState = {};

export default function LoginPanel() {
  const [state, formAction, isPending] = useActionState(login, initialState);

  return (
    <form
      className="auth-panel"
      action={formAction}
      noValidate
      role="tabpanel"
      id="panel-login"
      aria-labelledby="tab-login"
    >
      <div className="auth-card__head">
        <h1 className="title">Welcome back</h1>
        <p className="subtitle">Log in to look up prices.</p>
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
          autoComplete="current-password"
          disabled={isPending}
        />
      </div>

      <button className="btn btn--primary btn--block" type="submit" disabled={isPending} aria-busy={isPending}>
        {isPending && <Spinner />}
        {isPending ? "Logging in…" : "Log in"}
      </button>
    </form>
  );
}
