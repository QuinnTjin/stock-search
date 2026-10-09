"use client";

import { useState } from "react";

type Props = {
  id: string;
  name: string;
  label: string;
  autoComplete: "current-password" | "new-password";
  disabled?: boolean;
  minLength?: number;
  helpId?: string;
  helpText?: string;
};

export function PasswordField({
  id,
  name,
  label,
  autoComplete,
  disabled,
  minLength,
  helpId,
  helpText,
}: Props) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="field">
      <label className="field__label" htmlFor={id}>
        {label}
      </label>
      <div className="password">
        <input
          id={id}
          name={name}
          className="input"
          type={visible ? "text" : "password"}
          autoComplete={autoComplete}
          disabled={disabled}
          minLength={minLength}
          required
          aria-describedby={helpId}
        />
        <button
          type="button"
          className="btn btn--ghost password__toggle"
          aria-controls={id}
          aria-pressed={visible}
          disabled={disabled}
          onClick={() => setVisible((v) => !v)}
        >
          {visible ? "Hide" : "Show"}
        </button>
      </div>
      {helpText && (
        <span id={helpId} className="field__help">
          {helpText}
        </span>
      )}
    </div>
  );
}
