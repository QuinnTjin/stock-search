export function ErrorIcon() {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      aria-hidden="true"
    >
      <circle cx="8" cy="8" r="6.5" />
      <path d="M8 4.5v4M8 11v.01" />
    </svg>
  );
}

export function NoticeIcon() {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      aria-hidden="true"
    >
      <circle cx="8" cy="8" r="6.5" />
      <path d="M8 7.5v4M8 5v.01" />
    </svg>
  );
}

export function Spinner() {
  return (
    <svg
      className="spinner"
      viewBox="0 0 18 18"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="M9 2a7 7 0 1 0 7 7" />
    </svg>
  );
}
