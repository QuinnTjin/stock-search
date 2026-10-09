import { cookies } from "next/headers";
import { prisma } from "@/db";
import { SESSION_COOKIE_NAME, hashSessionToken, isSessionExpired } from "@/lib/session";

export async function getCurrentUser(): Promise<{ id: string; email: string } | null> {
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

  return { id: session.user.id, email: session.user.email };
}
