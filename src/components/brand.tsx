import Link from "next/link";

export function Brand({ href }: { href: string }) {
  return (
    <Link className="brand" href={href}>
      <span className="brand__mark">
        <svg
          viewBox="0 0 18 18"
          fill="none"
          stroke="#fff"
          strokeWidth={2.2}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M2 13l4-5 3 3 7-8" />
        </svg>
      </span>
      Stock Search
    </Link>
  );
}
