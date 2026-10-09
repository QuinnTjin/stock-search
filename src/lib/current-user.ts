import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/db";
import { SESSION_COOKIE_NAME, hashSessionToken, isSessionExpired } from "@/lib/session";

export type CurrentUser = { id: string; email: string; onboardedAt: Date | null };

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const token = (await cookies()).get(SESSION_COOKIE_NAME)?.value;
  if (!token) {
    return null;
  }

  const session = await prisma.session.findUnique({
    where: { id: hashSessionToken(token) },
    include: { user: true },
  });

  if (!session || isSessionExpired(session.expiresAt)) {
    return null;
  }

  return { id: session.user.id, email: session.user.email, onboardedAt: session.user.onboardedAt };
}

/** Server-side gate for protected routes/endpoints: returns the user or redirects to /login. */
export async function requireUser(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }
  return user;
}
