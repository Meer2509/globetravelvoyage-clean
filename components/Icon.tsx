import type { IconName } from "@/lib/data";

const paths: Record<IconName, React.ReactNode> = {
  visa: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3 10h18" />
      <path d="M7 15h4" />
    </>
  ),
  flight: <path d="M10.5 19.5 9 22l-1.5-.5.5-3.5-4-2.3.4-1.6 3.9 1 3-3.6L3 7.5 4 6l6 1.7 3.2-3.2c.7-.7 1.9-.8 2.5-.2.6.6.5 1.8-.2 2.5L12.3 10l1.7 6 .4 3.2-1.4 1-2.5-3.9-3.3 3z" />,
  hotel: (
    <>
      <path d="M3 21V8l9-5 9 5v13" />
      <path d="M3 21h18" />
      <path d="M9 21v-6h6v6" />
    </>
  ),
  car: (
    <>
      <path d="M5 16l1.5-5h11L19 16" />
      <path d="M3 16h18v3h-2v-1H5v1H3z" />
      <circle cx="7.5" cy="18" r="1" />
      <circle cx="16.5" cy="18" r="1" />
    </>
  ),
  cruise: (
    <>
      <path d="M3 18s2 1 4.5 1 3.5-1 4.5-1 2 1 4.5 1 4.5-1 4.5-1" />
      <path d="M5 14l1-3h12l-2 3" />
      <path d="M12 4v4" />
      <path d="M9 8h6" />
    </>
  ),
  tour: (
    <>
      <circle cx="12" cy="10" r="3" />
      <path d="M12 2a8 8 0 0 0-8 8c0 5 8 12 8 12s8-7 8-12a8 8 0 0 0-8-8z" />
    </>
  ),
  ticket: (
    <>
      <path d="M3 8a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2 2 2 0 0 0 0 4 2 2 0 0 1-2 2H5a2 2 0 0 1-2-2 2 2 0 0 0 0-4z" />
      <path d="M14 6v12" />
    </>
  ),
  planner: (
    <>
      <rect x="4" y="5" width="16" height="16" rx="2" />
      <path d="M16 3v4M8 3v4M4 11h16" />
    </>
  ),
  property: (
    <>
      <path d="M3 11l9-7 9 7" />
      <path d="M5 10v10h14V10" />
      <path d="M10 20v-6h4v6" />
    </>
  ),
  agency: (
    <>
      <rect x="3" y="7" width="18" height="13" rx="2" />
      <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </>
  ),
  agent: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21a8 8 0 0 1 16 0" />
    </>
  ),
  guide: (
    <>
      <path d="M4 4v16" />
      <path d="M4 5h11l-1 3 1 3H4" />
    </>
  ),
  referral: (
    <>
      <circle cx="6" cy="12" r="2.5" />
      <circle cx="18" cy="6" r="2.5" />
      <circle cx="18" cy="18" r="2.5" />
      <path d="M8.2 10.8l7.6-3.6M8.2 13.2l7.6 3.6" />
    </>
  ),
  shield: <path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z" />,
  globe: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c2.5 2.5 2.5 15 0 18M12 3c-2.5 2.5-2.5 15 0 18" />
    </>
  ),
  sparkles: (
    <>
      <path d="M12 3l1.8 4.2L18 9l-4.2 1.8L12 15l-1.8-4.2L6 9l4.2-1.8z" />
      <path d="M18 14l.9 2.1L21 17l-2.1.9L18 20l-.9-2.1L15 17l2.1-.9z" />
    </>
  ),
  check: <path d="M5 12l4 4L19 6" />,
  star: <path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z" />,
  users: (
    <>
      <circle cx="9" cy="8" r="3.5" />
      <path d="M2 21a7 7 0 0 1 14 0" />
      <path d="M16 5a3.5 3.5 0 0 1 0 7M22 21a7 7 0 0 0-5-6.7" />
    </>
  ),
  doc: (
    <>
      <path d="M6 2h8l4 4v16H6z" />
      <path d="M14 2v4h4M9 13h6M9 17h6M9 9h2" />
    </>
  ),
};

export function Icon({
  name,
  className = "h-6 w-6",
}: {
  name: IconName;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
}
