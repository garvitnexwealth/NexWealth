import type { ReactNode } from "react";

export function Icon({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex h-10 w-10 items-center justify-center rounded-xl bg-ink-850 ${className ?? ""}`}
    >
      {children}
    </span>
  );
}

export function HomeIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 10.5L12 3l9 7.5" />
      <path d="M5 10v10h14V10" />
    </svg>
  );
}

export function PortfolioIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 7h16" />
      <path d="M4 12h16" />
      <path d="M4 17h16" />
    </svg>
  );
}

export function TransactionsIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 7h12" />
      <path d="M3 17h12" />
      <path d="M17 7l4 4-4 4" />
    </svg>
  );
}

export function LiabilityIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 7h16" />
      <path d="M6 11h12" />
      <path d="M8 15h8" />
    </svg>
  );
}

export function AnalyticsIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 20V4" />
      <path d="M8 20V10" />
      <path d="M12 20V6" />
      <path d="M16 20V14" />
      <path d="M20 20V8" />
    </svg>
  );
}

export function GoalsIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="8" />
      <path d="M12 8v4l3 2" />
    </svg>
  );
}

export function SettingsIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-1.4 2.4-1.5-.5a1.7 1.7 0 0 0-1.7.4l-.1.1-2.6-1.5v-1.6a1.7 1.7 0 0 0-1.1-1.6l-.1-.1-2.6 1.5.1.2a1.7 1.7 0 0 0-1.7-.4l-1.5.5-1.4-2.4.1-.1a1.7 1.7 0 0 0 .3-1.9l-.1-.1-1.4-2.4 1.5-.5a1.7 1.7 0 0 0 1.1-1.6V6l2.6-1.5.1.1a1.7 1.7 0 0 0 1.7.4l1.5-.5 1.4 2.4-.1.1a1.7 1.7 0 0 0-.3 1.9l.1.1 1.4 2.4-1.5.5a1.7 1.7 0 0 0-1.1 1.6v1.6l2.6 1.5.1-.1a1.7 1.7 0 0 0 1.7-.4l1.5.5 1.4-2.4-.1-.1a1.7 1.7 0 0 0-.3-1.9z" />
    </svg>
  );
}

export function BellIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 8a6 6 0 1 0-12 0c0 7-3 6-3 6h18s-3 1-3-6" />
      <path d="M13.7 21a2 2 0 0 1-3.4 0" />
    </svg>
  );
}

export function SearchIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4.3-4.3" />
    </svg>
  );
}
