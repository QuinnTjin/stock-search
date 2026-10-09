"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/db";
import { requireUser } from "@/lib/current-user";
import { addFavorites } from "@/lib/favorites";
import { STARTER_SYMBOLS } from "./starters";

const STARTER_SET = new Set<string>(STARTER_SYMBOLS);

/** F5: save the chosen starter stocks, mark onboarding done, go to the dashboard. */
export async function finishOnboarding(symbols: string[]): Promise<void> {
  const user = await requireUser();

  // Only accept the known starter tiles — never arbitrary client input.
  const picked = symbols.filter((symbol) => STARTER_SET.has(symbol));

  await addFavorites(user.id, picked);
  await prisma.user.update({
    where: { id: user.id },
    data: { onboardedAt: new Date() },
  });

  redirect("/dashboard");
}

/** F5: "Skip for now" — save nothing, but still complete onboarding (shown once). */
export async function skipOnboarding(): Promise<void> {
  const user = await requireUser();

  await prisma.user.update({
    where: { id: user.id },
    data: { onboardedAt: new Date() },
  });

  redirect("/dashboard");
}
