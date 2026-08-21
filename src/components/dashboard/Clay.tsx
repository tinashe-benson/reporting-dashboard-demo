/**
 * Claymorphic / neumorphic UI kit for the reporting dashboard.
 *
 * Everything here is a physical-feeling control extruded from or pressed into
 * the one warm putty ground defined in index.css (.clay-root). The styling
 * lives in CSS classes (.clay, .clay-inset, .clay-btn, .clay-radio, …); these
 * components add behaviour, layout, and the data bindings.
 */
import { useRef, type ReactNode, type PointerEvent as RPointerEvent } from 'react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  ResponsiveContainer,
} from 'recharts'
import { deltaTone } from '@/lib/dashboardFormat'

const CHART = {
  amber: '#ec8a3c',
  teal: '#2f9e9a',
  slate: '#5f7cb8',
  coral: '#dd6157',
}
export const CLAY_COLORS = CHART

// --------------------------------------------------------------------------
// Surfaces
// --------------------------------------------------------------------------

export function ClayCard({
  children,
  className = '',
  small = false,
}: {
  children: ReactNode
  className?: string
  small?: boolean
}) {
  return <div className={`${small ? 'clay-sm' : 'clay'} ${className}`}>{children}</div>
}

export function ClayInset({
  children,
  className = '',
  small = false,
}: {
  children: ReactNode
  className?: string
  small?: boolean
}) {
  return <div className={`${small ? 'clay-inset-sm' : 'clay-inset'} ${className}`}>{children}</div>
}

// --------------------------------------------------------------------------
// Buttons
// --------------------------------------------------------------------------

export function ClayButton({
  children,
  onClick,
  active = false,
  amber = false,
  className = '',
  title,
  disabled = false,
}: {
  children: ReactNode
  onClick?: () => void
  active?: boolean
  amber?: boolean
  className?: string
  title?: string
  disabled?: boolean
}) {
  const base = amber ? 'clay-btn-amber' : 'clay-btn'
  return (
    <button
      type="button"
      title={title}
      disabled={disabled}
      onClick={onClick}
      className={`${base} ${active ? 'is-active' : ''} px-4 py-2 text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed ${className}`}
    >
      {children}
    </button>
  )
}

// --------------------------------------------------------------------------
// Segmented control — the tactile "radio buttons"
// --------------------------------------------------------------------------

export interface SegOption<T extends string> {
  value: T
  label: ReactNode
  icon?: ReactNode
}

export function ClaySegmented<T extends string>({
  options,
  value,
  onChange,
  className = '',
}: {
  options: SegOption<T>[]
  value: T
  onChange: (v: T) => void
  className?: string
}) {
  return (
    <div className={`clay-inset-sm p-1.5 inline-flex gap-1 ${className}`} role="radiogroup">
      {options.map((o) => {
        const on = o.value === value
        return (
          <button
            key={o.value}
            role="radio"
            aria-checked={on}
            onClick={() => onChange(o.value)}
            className={`flex items-center gap-1.5 rounded-[11px] px-3 py-1.5 text-sm font-medium transition-all ${
              on
                ? 'clay-btn is-active text-[var(--amber-deep)]'
                : 'text-[var(--ink-soft)] hover:text-[var(--ink)]'
            }`}
          >
            {o.icon}
            {o.label}
          </button>
        )
      })}
    </div>
  )
}

// --------------------------------------------------------------------------
// Vertical radio list — literal clay radios (for the report builder etc.)
// --------------------------------------------------------------------------

export function ClayRadioList<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string; hint?: string }[]
  value: T
  onChange: (v: T) => void
}) {
  return (
    <div className="flex flex-col gap-2" role="radiogroup">
      {options.map((o) => {
        const on = o.value === value
        return (
          <button
            key={o.value}
            role="radio"
            aria-checked={on}
            onClick={() => onChange(o.value)}
            className="flex items-center gap-3 text-left group"
          >
            <span className={`clay-radio ${on ? 'is-on' : ''}`}>
              <span className="clay-radio-dot" />
            </span>
            <span>
              <span className={`block text-sm font-medium ${on ? 'text-[var(--ink)]' : 'text-[var(--ink-soft)]'}`}>
                {o.label}
              </span>
              {o.hint && <span className="block text-xs text-[var(--ink-faint)]">{o.hint}</span>}
            </span>
          </button>
        )
      })}
    </div>
  )
}

// --------------------------------------------------------------------------
// Switch (toggle)
// --------------------------------------------------------------------------

export function ClaySwitch({
  on,
  onChange,
  label,
}: {
  on: boolean
  onChange: (v: boolean) => void
  label?: string
}) {
  return (
    <button type="button" onClick={() => onChange(!on)} className="flex items-center gap-2.5" aria-pressed={on}>
      <span className={`clay-switch ${on ? 'is-on' : ''}`}>
        <span className="clay-knob-dot" />
      </span>
      {label && <span className="text-sm text-[var(--ink-soft)]">{label}</span>}
    </button>
  )
}

// --------------------------------------------------------------------------
// Rotary knob — a real draggable dial (used in the report builder)
// --------------------------------------------------------------------------

export function ClayKnob({
  value,
  min,
  max,
  onChange,
  size = 76,
  label,
  display,
}: {
  value: number
  min: number
  max: number
  onChange: (v: number) => void
  size?: number
  label?: string
  display?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const frac = (value - min) / (max - min)
  // Sweep from -135deg to +135deg (270deg total travel).
  const angle = -135 + frac * 270

  function pointFromEvent(e: RPointerEvent<HTMLDivElement>) {
    const el = ref.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const cx = r.left + r.width / 2
    const cy = r.top + r.height / 2
    let deg = (Math.atan2(e.clientY - cy, e.clientX - cx) * 180) / Math.PI + 90
    if (deg > 180) deg -= 360
    deg = Math.max(-135, Math.min(135, deg))
    const f = (deg + 135) / 270
    onChange(Math.round((min + f * (max - min)) * 10) / 10)
  }

  return (
    <div className="flex flex-col items-center gap-2 select-none">
      <div
        ref={ref}
        className="clay-dial cursor-grab active:cursor-grabbing touch-none"
        style={{ width: size, height: size }}
        onPointerDown={(e) => {
          ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
          pointFromEvent(e)
        }}
        onPointerMove={(e) => {
          if (e.buttons === 1) pointFromEvent(e)
        }}
      >
        <div className="clay-dial-well" />
        <div className="clay-dial-pointer" style={{ transform: `translateX(-50%) rotate(${angle}deg)` }} />
        {display && (
          <div className="absolute inset-0 grid place-items-center">
            <span className="font-num text-sm font-semibold text-[var(--ink)]">{display}</span>
          </div>
        )}
      </div>
      {label && <span className="text-xs text-[var(--ink-faint)] uppercase tracking-wide">{label}</span>}
    </div>
  )
}

// --------------------------------------------------------------------------
// Status LED
// --------------------------------------------------------------------------

export function StatusLED({ status }: { status: 'live' | 'syncing' | 'attention' }) {
  return <span className={`led led-${status}`} />
}

// --------------------------------------------------------------------------
// Delta chip
// --------------------------------------------------------------------------

export function Delta({
  value,
  lowerIsBetter = false,
  className = '',
}: {
  value: number
  lowerIsBetter?: boolean
  className?: string
}) {
  const tone = deltaTone(value, lowerIsBetter)
  const color = tone === 'up' ? 'var(--teal)' : tone === 'down' ? 'var(--coral)' : 'var(--ink-faint)'
  // The arrow carries the direction, so the number is unsigned — a down arrow
  // next to a "+6.2%" reads as a contradiction.
  const arrow = value > 0.05 ? '▲' : value < -0.05 ? '▼' : '■'
  const abs = Math.abs(value).toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 })
  return (
    <span className={`font-num text-xs font-semibold inline-flex items-center gap-1 ${className}`} style={{ color }}>
      <span style={{ fontSize: 8 }}>{arrow}</span>
      {abs}%
    </span>
  )
}

// --------------------------------------------------------------------------
// Sparkline (filled area) + mini bars
// --------------------------------------------------------------------------

export function Sparkline({
  data,
  color = CHART.amber,
  height = 44,
}: {
  data: number[]
  color?: string
  height?: number
}) {
  const rows = data.map((v, i) => ({ i, v }))
  const id = `sp-${color.replace('#', '')}`
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={rows} margin={{ top: 3, right: 0, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.35} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area
          type="monotone"
          dataKey="v"
          stroke={color}
          strokeWidth={2.2}
          fill={`url(#${id})`}
          dot={false}
          isAnimationActive={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}

export function MiniBars({
  data,
  color = CHART.slate,
  height = 44,
}: {
  data: number[]
  color?: string
  height?: number
}) {
  const rows = data.map((v, i) => ({ i, v }))
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={rows} margin={{ top: 3, right: 0, bottom: 0, left: 0 }}>
        <Bar dataKey="v" fill={color} radius={[3, 3, 0, 0]} isAnimationActive={false} />
      </BarChart>
    </ResponsiveContainer>
  )
}

// --------------------------------------------------------------------------
// KPI stat tile — a raised clay card with an inset well for its sparkline
// --------------------------------------------------------------------------

export function Stat({
  label,
  value,
  delta,
  lowerIsBetter = false,
  series,
  color = CHART.amber,
  bars = false,
  suffix,
  foot,
}: {
  label: string
  value: string
  delta?: number
  lowerIsBetter?: boolean
  series?: number[]
  color?: string
  bars?: boolean
  suffix?: ReactNode
  foot?: ReactNode
}) {
  return (
    <ClayCard small className="p-4 flex flex-col gap-2.5">
      <div className="flex items-start justify-between gap-2">
        <span className="text-xs font-medium text-[var(--ink-soft)] uppercase tracking-wide leading-tight">
          {label}
        </span>
        {delta !== undefined && <Delta value={delta} lowerIsBetter={lowerIsBetter} />}
      </div>
      <div className="flex items-end gap-1.5">
        <span className="font-num text-[26px] leading-none font-semibold text-[var(--ink)]">{value}</span>
        {suffix && <span className="text-xs text-[var(--ink-faint)] mb-0.5">{suffix}</span>}
      </div>
      {series && (
        <ClayInset small className="px-2 pt-1 pb-0.5 mt-0.5">
          {bars ? <MiniBars data={series} color={color} /> : <Sparkline data={series} color={color} />}
        </ClayInset>
      )}
      {foot && <div className="text-xs text-[var(--ink-faint)]">{foot}</div>}
    </ClayCard>
  )
}

// --------------------------------------------------------------------------
// Section heading
// --------------------------------------------------------------------------

export function SectionTitle({ children, sub }: { children: ReactNode; sub?: string }) {
  return (
    <div className="mb-4">
      <h2 className="font-display text-lg font-semibold text-[var(--ink)]">{children}</h2>
      {sub && <p className="text-sm text-[var(--ink-soft)] mt-0.5">{sub}</p>}
    </div>
  )
}
