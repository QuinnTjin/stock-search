"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/db";
import { normalizeEmail, isValidEmail } from "@/lib/auth";
import { verifyPassword } from "@/lib/password";
import {
  SESSION_COOKIE_NAME,
  SESSION_TTL_SECONDS,
  generateSessionToken,
  hashSessionToken,
  sessionCookieOptions,
} from "@/lib/session";

export type LoginState = {
  error?: string;
};

const GENERIC_ERROR = "Email or password is incorrect.";

export async function login(_prevState: LoginState, formData: FormData): Promise<LoginState> {
  const email = normalizeEmail(String(formData.get("email") ?? ""));
  const password = String(formData.get("password") ?? "");

  if (!isValidEmail(email) || !password) {
    return { error: GENERIC_ERROR };
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return { error: GENERIC_ERROR };
  }

  if (!(await verifyPassword(user.passwordHash, password))) {
    return { error: GENERIC_ERROR };
  }

  const token = generateSessionToken();
  const userAgent = (await headers()).get("user-agent")?.slice(0, 512);

  await prisma.session.create({
    data: {
      id: hashSessionToken(token),
      userId: user.id,
      expiresAt: new Date(Date.now() + SESSION_TTL_SECONDS * 1000),
      userAgent,
    },
  });

  (await cookies()).set(SESSION_COOKIE_NAME, token, sessionCookieOptions());

  redirect("/");
}
