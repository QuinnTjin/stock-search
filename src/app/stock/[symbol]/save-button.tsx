"use client";

import { useState, useTransition } from "react";
import { toggleFavorite } from "./actions";
import { Spinner } from "@/components/icons";

type SaveButtonProps = {
  symbol: string;
  initialSaved: boolean;
};

// F1/F2: toggles between "Save to dashboard" and "✓ Saved". Optimistic flip,
// reconciled with the server's returned state.
export default function SaveButton({ symbol, initialSaved }: SaveButtonProps) {
  const [saved, setSaved] = useState(initialSaved);
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    const optimistic = !saved;
    setSaved(optimistic);
    startTransition(async () => {
      try {
        const result = await toggleFavorite(symbol);
        setSaved(result.saved);
      } catch {
        setSaved(!optimistic); // revert on failure
      }
    });
  }

  return (
    <button
      type="button"
      className={`btn save-btn ${saved ? "save-btn--saved" : "btn--primary"}`}
      onClick={handleClick}
      disabled={isPending}
      aria-busy={isPending}
      aria-pressed={saved}
    >
      {isPending && <Spinner />}
      {saved ? "✓ Saved" : "Save to dashboard"}
    </button>
  );
}
