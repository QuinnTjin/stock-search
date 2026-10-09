"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/current-user";
import { normalizeSymbol, isValidSymbol } from "@/lib/symbol";
import { isFavorited, addFavorite, removeFavorite } from "@/lib/favorites";

/**
 * Save or unsave a stock for the current user (F1/F2). Idempotent per the
 * (userId, symbol) unique key. Returns the resulting saved state.
 */
export async function toggleFavorite(rawSymbol: string): Promise<{ saved: boolean }> {
  const user = await requireUser();

  const symbol = normalizeSymbol(rawSymbol);
  if (!isValidSymbol(symbol)) {
    throw new Error(`Invalid symbol: ${rawSymbol}`);
  }

  const alreadySaved = await isFavorited(user.id, symbol);
  if (alreadySaved) {
    await removeFavorite(user.id, symbol);
  } else {
    await addFavorite(user.id, symbol);
  }

  revalidatePath("/dashboard");
  return { saved: !alreadySaved };
}
