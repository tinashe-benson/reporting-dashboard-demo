/**
 * App-wide UI state: theme, the signed-in seat (mock auth), the active date
 * range, nav collapse, and the OpenRouter AI config. Persisted to
 * localStorage so a reload keeps the operator where they were.
 */
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { getSeat, type RangeId, type RoleId, type Seat } from '@/lib/data'

type Theme = 'light' | 'dark'
export interface AIConfigState { key: string; model: string }

interface AppState {
  theme: Theme
  toggleTheme: () => void
  setTheme: (t: Theme) => void

  seatId: string | null
  seat: Seat | null
  role: RoleId
  login: (id: string) => void
  signOut: () => void

  range: RangeId
  setRange: (r: RangeId) => void

  navCollapsed: boolean
  toggleNav: () => void
  mobileNavOpen: boolean
  setMobileNavOpen: (v: boolean) => void

  ai: AIConfigState
  setAi: (patch: Partial<AIConfigState>) => void
}

const Ctx = createContext<AppState | null>(null)

function readLS<T>(key: string, fallback: T): T {
  try {
    const v = localStorage.getItem(key)
    return v === null ? fallback : (JSON.parse(v) as T)
  } catch {
    return fallback
  }
}
function writeLS(key: string, v: unknown) {
  try { localStorage.setItem(key, JSON.stringify(v)) } catch { /* private mode */ }
}

function initialTheme(): Theme {
  const stored = readLS<Theme | null>('rb-theme', null)
  if (stored === 'light' || stored === 'dark') return stored
  if (typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)').matches) return 'dark'
  return 'light'
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(initialTheme)
  const [seatId, setSeatId] = useState<string | null>(() => readLS<string | null>('rb-seat', null))
  const [range, setRangeState] = useState<RangeId>(() => readLS<RangeId>('rb-range', '30d'))
  const [navCollapsed, setNavCollapsed] = useState<boolean>(() => readLS<boolean>('rb-nav', false))
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [ai, setAiState] = useState<AIConfigState>(() => readLS<AIConfigState>('rb-ai', { key: '', model: 'anthropic/claude-3.5-sonnet' }))

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    writeLS('rb-theme', theme)
  }, [theme])

  const seat = useMemo(() => (seatId ? getSeat(seatId) ?? null : null), [seatId])
  const role: RoleId = seat?.role ?? 'manager'

  const value: AppState = {
    theme,
    toggleTheme: () => setThemeState((t) => (t === 'dark' ? 'light' : 'dark')),
    setTheme: setThemeState,
    seatId, seat, role,
    login: (id) => { setSeatId(id); writeLS('rb-seat', id) },
    signOut: () => { setSeatId(null); writeLS('rb-seat', null) },
    range,
    setRange: (r) => { setRangeState(r); writeLS('rb-range', r) },
    navCollapsed,
    toggleNav: () => setNavCollapsed((c) => { writeLS('rb-nav', !c); return !c }),
    mobileNavOpen, setMobileNavOpen,
    ai,
    setAi: (patch) => setAiState((prev) => { const next = { ...prev, ...patch }; writeLS('rb-ai', next); return next }),
  }

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useApp(): AppState {
  const v = useContext(Ctx)
  if (!v) throw new Error('useApp outside provider')
  return v
}
