import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/current-user";
import { Brand } from "@/components/brand";
import { AuthCard } from "@/components/auth-card";

export const metadata: Metadata = {
  title: "Create account · Stock Search",
};

// Guardrail: an already-signed-in user cannot return to the signup page to create or
// sign into another account — doing so would overwrite their session. Send them to lookup.
export default async function SignupPage() {
  if (await getCurrentUser()) {
    redirect("/lookup");
  }

  return (
    <div className="app">
      <header className="site-header">
        <div className="site-header__inner">
          <Brand href="/" />
        </div>
      </header>
      <main className="app__main auth">
        <AuthCard initialMode="signup" />
      </main>
    </div>
  );
}
