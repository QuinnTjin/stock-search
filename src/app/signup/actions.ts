"use server";

import { prisma } from "@/db";
import { Prisma } from "@/generated/prisma/client";
import { normalizeEmail, isValidEmail, validatePassword } from "@/lib/auth";
import { hashPassword } from "@/lib/password";

export type SignupState = {
  error?: string;
  success?: boolean;
};

export async function signup(
  _prevState: SignupState,
  formData: FormData
): Promise<SignupState> {
  const email = normalizeEmail(String(formData.get("email") ?? ""));
  const password = String(formData.get("password") ?? "");

  if (!isValidEmail(email)) {
    return { error: "Enter a valid email address." };
  }
  if (!validatePassword(password)) {
    return { error: "Password must be at least 8 characters." };
  }

  const passwordHash = await hashPassword(password);

  try {
    await prisma.user.create({ data: { email, passwordHash } });
  } catch (err) {
    // The citext unique index is the real guard; this just gives a friendly message.
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      return { error: "An account with that email already exists." };
    }
    throw err;
  }

  return { success: true };
}
