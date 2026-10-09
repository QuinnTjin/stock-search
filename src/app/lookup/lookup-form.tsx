"use client";

import { useState } from "react";
import { useActionState } from "react";
import { lookupQuote, type LookupState } from "./actions";
import { normalizeSymbol, isValidSymbol } from "@/lib/symbol";
import { ErrorIcon, Spinner } from "@/components/icons";

const initialState: LookupState = { status: "idle" };
const SYMBOL_HELP = "Enter a symbol like AAPL or BRK.B.";

const formatPrice = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

type LookupFormProps = {
  initialSymbol?: string;
};

export default function LookupForm({ initialSymbol }: LookupFormProps) {
  const [state, formAction, isPending] = useActionState(lookupQuote, initialState);
  const [clientInvalid, setClientInvalid] = useState(false);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    const input = event.currentTarget.elements.namedItem("symbol") as HTMLInputElement;
    const normalized = normalizeSymbol(input.value);

    if (!isValidSymbol(normalized)) {
      event.preventDefault();
      setClientInvalid(true);
      return;
    }

    setClientInvalid(false);
  }

  return (
    <>
      <form className="search" action={formAction} noValidate onSubmit={handleSubmit}>
        <label className="field__label" htmlFor="sym">
          Symbol
        </label>
        <div className="search__row">
          <input
            id="sym"
            name="symbol"
            className="input input--ticker"
            type="text"
            defaultValue={initialSymbol}
            autoCapitalize="characters"
            autoComplete="off"
            spellCheck={false}
            aria-describedby="symmsg"
            aria-invalid={clientInvalid ? "true" : undefined}
            disabled={isPending}
            onChange={() => setClientInvalid(false)}
          />
          <button className="btn btn--primary btn--search" type="submit" disabled={isPending} aria-busy={isPending}>
            {isPending && <Spinner />}
            {isPending ? "Looking up…" : "Look up"}
          </button>
        </div>
        {clientInvalid ? (
          <span id="symmsg" className="field__error" role="alert">
            <ErrorIcon />
            {SYMBOL_HELP}
          </span>
        ) : (
          <span id="symmsg" className="field__help">
            {SYMBOL_HELP}
          </span>
        )}
      </form>

      <div className="lookup__result" aria-live="polite">
        {isPending ? (
          <div className="card skeleton-card" role="status" aria-label="Looking up the price">
            <div className="skeleton" style={{ width: 84, height: 32 }} />
            <div className="result-card__group">
              <div className="skeleton" style={{ width: 104, height: 16 }} />
              <div className="skeleton" style={{ width: 240, height: 56 }} />
            </div>
            <div className="skeleton-card__row">
              <div className="skeleton" style={{ width: 90, height: 20 }} />
              <div className="skeleton" style={{ width: 140, height: 20 }} />
            </div>
            <div className="skeleton" style={{ width: 110, height: 18 }} />
          </div>
        ) : state.status === "found" ? (
          <article className="card result-card" aria-label={`Opening price for ${state.symbol}`}>
            <div className="result-card__ticker">{state.symbol}</div>
            <div className="result-card__group">
              <span className="data-label">Opening price</span>
              <span className="result-card__price">{formatPrice.format(state.open)}</span>
            </div>
            <div className="result-card__row">
              <span className="data-label">Applies to</span>
              <span className="result-card__date">{state.asOf}</span>
            </div>
            <div className="result-card__source">Source: Finnhub</div>
          </article>
        ) : state.status === "error" ? (
          <div role="alert" className="message message--error">
            <ErrorIcon />
            <span>{state.message}</span>
          </div>
        ) : null}
      </div>
    </>
  );
}
