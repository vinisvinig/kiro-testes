// Conjunto enxuto de ícones SVG inline (stroke) usados na UI.
// Evita dependência externa e mantém consistência visual.

const paths = {
  search: <path d="M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16zm10 2-4.35-4.35" />,
  chevronLeft: <path d="M15 18l-6-6 6-6" />,
  chevronRight: <path d="M9 18l6-6-6-6" />,
  user: <path d="M20 21a8 8 0 1 0-16 0M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" />,
  location: (
    <>
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z" />
      <circle cx="12" cy="10" r="3" />
    </>
  ),
  calendar: (
    <>
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </>
  ),
  heart: <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 1 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z" />,
  music: (
    <>
      <path d="M9 18V5l12-2v13" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="18" cy="16" r="3" />
    </>
  ),
  masks: (
    <>
      <path d="M4 6c0 5 2 8 5 8s5-3 5-8" />
      <path d="M10 10c0 5 2 8 5 8s5-3 5-8" />
    </>
  ),
  star: <path d="M12 2l3 6.5 7 .9-5 4.8 1.3 7L12 17.8 5.7 21.2 7 14.2 2 9.4l7-.9L12 2z" />,
  party: <path d="M2 22l6-14 8 8-14 6zM14 8l1.5-1.5M17 5l1-3M19 8l3-1M18 12l3 1" />,
  mic: (
    <>
      <rect x="9" y="2" width="6" height="12" rx="3" />
      <path d="M5 10a7 7 0 0 0 14 0M12 17v5M8 22h8" />
    </>
  ),
  game: (
    <>
      <path d="M6 12h4M8 10v4" />
      <circle cx="16" cy="11" r="1" />
      <circle cx="18" cy="13" r="1" />
      <rect x="2" y="6" width="20" height="12" rx="4" />
    </>
  ),
  menu: <path d="M3 12h18M3 6h18M3 18h18" />,
  mail: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3 7l9 6 9-6" />
    </>
  ),
}

export default function Icon({ name, className = 'w-5 h-5', strokeWidth = 2, ...props }) {
  const content = paths[name]
  if (!content) return null
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      {content}
    </svg>
  )
}
