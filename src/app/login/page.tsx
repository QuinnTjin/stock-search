import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/current-user";
import { Brand } from "@/components/brand";
import LoginForm from "./login-form";

export const metadata: Metadata = {
  title: "Log in · Stock Search",
};

// Guardrail: an already-signed-in user cannot return to the login page to start a
// second login — doing so would overwrite their session. Send them to the lookup page.
export default async function LoginPage() {
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
        <LoginForm />
      </main>
    </div>
  );
}
