"use client";

import { useState, useTransition } from "react";
import { finishOnboarding, skipOnboarding } from "./actions";
import { Spinner } from "@/components/icons";

export type StarterTile = {
  symbol: string;
  open: number | null;
};

const formatPrice = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

// F5: 8 starter tiles. Tapping toggles selection (client state); the count
// updates live. Finish saves the picks; Skip saves nothing.
export default function OnboardingTiles({ tiles }: { tiles: StarterTile[] }) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [isPending, startTransition] = useTransition();

  function toggle(symbol: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(symbol)) {
        next.delete(symbol);
      } else {
        next.add(symbol);
      }
      return next;
    });
  }

  function handleFinish() {
    startTransition(() => finishOnboarding([...selected]));
  }

  function handleSkip() {
    startTransition(() => skipOnboarding());
  }

  return (
    <>
      <ul className="starter-grid">
        {tiles.map((tile) => {
          const isSelected = selected.has(tile.symbol);
          return (
            <li key={tile.symbol}>
              <button
                type="button"
                className={`card starter-tile ${isSelected ? "starter-tile--selected" : ""}`}
                onClick={() => toggle(tile.symbol)}
                aria-pressed={isSelected}
                disabled={isPending}
              >
                <span className="starter-tile__check" aria-hidden="true">
                  {isSelected ? "✓" : ""}
                </span>
                <span className="starter-tile__symbol">{tile.symbol}</span>
                <span className="starter-tile__price">
                  {tile.open !== null ? formatPrice.format(tile.open) : "—"}
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      <div className="onboarding__footer">
        <span className="onboarding__count" aria-live="polite">
          {selected.size} selected
        </span>
        <div className="onboarding__actions">
          <button
            type="button"
            className="btn btn--ghost"
            onClick={handleSkip}
            disabled={isPending}
          >
            Skip for now
          </button>
          <button
            type="button"
            className="btn btn--primary"
            onClick={handleFinish}
            disabled={isPending}
            aria-busy={isPending}
          >
            {isPending && <Spinner />}
            Finish
          </button>
        </div>
      </div>
    </>
  );
}
