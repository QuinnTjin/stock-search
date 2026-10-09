"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import LoginPanel from "@/app/login/login-panel";
import SignupPanel from "@/app/signup/signup-panel";

export type AuthMode = "login" | "signup";

export function AuthCard({ initialMode }: { initialMode: AuthMode }) {
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const router = useRouter();

  function selectTab(next: AuthMode) {
    if (next === mode) return;
    setMode(next);
    router.replace(next === "login" ? "/login" : "/signup", { scroll: false });
  }

  return (
    <div className="card auth-card">
      <div className="auth-tabs" role="tablist" aria-label="Log in or sign up">
        <button
          type="button"
          role="tab"
          id="tab-login"
          aria-selected={mode === "login"}
          aria-controls="panel-login"
          className={`auth-tabs__tab${mode === "login" ? " auth-tabs__tab--active" : ""}`}
          onClick={() => selectTab("login")}
        >
          Log in
        </button>
        <button
          type="button"
          role="tab"
          id="tab-signup"
          aria-selected={mode === "signup"}
          aria-controls="panel-signup"
          className={`auth-tabs__tab${mode === "signup" ? " auth-tabs__tab--active" : ""}`}
          onClick={() => selectTab("signup")}
        >
          Sign up
        </button>
      </div>
      {mode === "login" ? <LoginPanel /> : <SignupPanel onCreated={() => selectTab("login")} />}
    </div>
  );
}
