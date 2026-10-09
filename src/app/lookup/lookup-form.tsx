"use client";

import { useActionState } from "react";
import { lookupQuote, type LookupState } from "./actions";

const initialState: LookupState = { status: "idle" };

export default function LookupForm() {
  const [state, formAction, isPending] = useActionState(lookupQuote, initialState);

  return (
    <>
      <form action={formAction}>
        <div style={{ marginBottom: "1rem" }}>
          <label htmlFor="symbol">Symbol</label>
          <br />
          <input
            id="symbol"
            name="symbol"
            type="text"
            required
            autoCapitalize="characters"
            autoComplete="off"
          />
        </div>

        <button type="submit" disabled={isPending}>
          {isPending ? "Looking up…" : "Look up"}
        </button>
      </form>

      {state.status === "found" && (
        <p>
          <strong>{state.symbol}</strong> opened at ${state.open.toFixed(2)} on {state.asOf}.
        </p>
      )}

      {state.status === "error" && <p style={{ color: "#ff6b6b" }}>{state.message}</p>}
    </>
  );
}
