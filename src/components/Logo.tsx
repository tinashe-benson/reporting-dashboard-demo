/**
 * ReportBeacon logo: an R at the centre of a broadcast signal, two arcs
 * radiating from each side. Renders in currentColor, or boxed in the dark
 * brand tile. Used in the app rail, the login, and the landing page.
 */
export function Logo({ size = 30, boxed = true }: { size?: number; boxed?: boolean }) {
  const mark = (
    <svg width={boxed ? size * 0.62 : size} height={boxed ? size * 0.62 : size} viewBox="0 0 40 40" fill="none" aria-hidden="true">
      {/* left arcs */}
      <path d="M12.93 12.93 A10 10 0 0 0 12.93 27.07" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" opacity="0.9" />
      <path d="M9.75 9.75 A14.5 14.5 0 0 0 9.75 30.25" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" opacity="0.45" />
      {/* right arcs */}
      <path d="M27.07 12.93 A10 10 0 0 1 27.07 27.07" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" opacity="0.9" />
      <path d="M30.25 9.75 A14.5 14.5 0 0 1 30.25 30.25" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" opacity="0.45" />
      {/* R */}
      <text x="20" y="26.4" textAnchor="middle" fontFamily="'Inter',system-ui,sans-serif" fontWeight="700" fontSize="18" fill="currentColor">R</text>
    </svg>
  )
  if (!boxed) return mark
  return (
    <span
      className="grid place-items-center rounded-[8px] bg-[var(--ink)] text-[var(--surface)] flex-none"
      style={{ width: size, height: size }}
    >
      {mark}
    </span>
  )
}

/** The wordmark, with the two capitals the brand uses. */
export function Wordmark({ className = '' }: { className?: string }) {
  return <span className={className}>ReportBeacon</span>
}
