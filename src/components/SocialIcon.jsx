// Ícones de marcas (filled) para redes sociais no footer.

const paths = {
  facebook: <path d="M13.5 21v-7h2.4l.4-2.8h-2.8V9.4c0-.8.2-1.4 1.4-1.4h1.5V5.5C16.5 5.4 15.6 5.3 14.6 5.3c-2.1 0-3.6 1.3-3.6 3.7v2.2H8.5V14h2.5v7h2.5z" />,
  instagram: (
    <>
      <rect x="4" y="4" width="16" height="16" rx="5" />
      <circle cx="12" cy="12" r="3.5" />
      <circle cx="17" cy="7" r="1" />
    </>
  ),
  twitter: <path d="M22 5.9c-.7.3-1.5.5-2.3.6.8-.5 1.5-1.3 1.8-2.3-.8.5-1.7.8-2.6 1a4 4 0 0 0-6.9 3.7A11.4 11.4 0 0 1 3.8 4.6a4 4 0 0 0 1.2 5.4c-.6 0-1.2-.2-1.8-.5v.1a4 4 0 0 0 3.2 3.9c-.6.2-1.2.2-1.8.1a4 4 0 0 0 3.7 2.8A8 8 0 0 1 2 18.6a11.3 11.3 0 0 0 6.1 1.8c7.4 0 11.4-6.1 11.4-11.4v-.5c.8-.6 1.5-1.3 2-2.1z" />,
  youtube: (
    <>
      <rect x="3" y="6" width="18" height="12" rx="4" />
      <path d="M10 9l5 3-5 3V9z" fill="currentColor" stroke="none" />
    </>
  ),
  tiktok: <path d="M14 3v9.5a3 3 0 1 1-2.4-2.9V7a5.5 5.5 0 1 0 4.9 5.4V8.7A6 6 0 0 0 20 10V7a3.8 3.8 0 0 1-3-3h-3z" />,
}

export default function SocialIcon({ name, className = 'w-4 h-4' }) {
  const isStroke = name === 'instagram' || name === 'youtube'
  const content = paths[name]
  if (!content) return null
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill={isStroke ? 'none' : 'currentColor'}
      stroke={isStroke ? 'currentColor' : 'none'}
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {content}
    </svg>
  )
}
