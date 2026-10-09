"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/db";
import { SESSION_COOKIE_NAME, hashSessionToken } from "@/lib/session";

export async function logout(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (token) {
    await prisma.session.deleteMany({ where: { id: hashSessionToken(token) } });
  }

  cookieStore.delete({ name: SESSION_COOKIE_NAME, path: "/" });

  redirect("/");
}
