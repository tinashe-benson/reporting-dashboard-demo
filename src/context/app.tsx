/**
 * App-wide UI state: theme, the current seat (role), the active date range,
 * and whether the nav rail is collapsed. All persisted to localStorage so a
 * reload keeps the operator where they were.
 */
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { RoleId, RangeId } from '@/lib/data'

type Theme = 'light' | 'dark'

interface AppState {
  theme: Theme
  toggleTheme: () => void
  role: RoleId
  setRole: (r: RoleId) => void
  range: RangeId
  setRange: (r: RangeId) => void
  navCollapsed: boolean
  toggleNav: () => void
  mobileNavOpen: boolean
  setMobileNavOpen: (v: boolean) => void
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
  try {
    localStorage.setItem(key, JSON.stringify(v))
  } catch {
    /* private mode */
  }
}

function initialTheme(): Theme {
  const stored = readLS<Theme | null>('rb-theme', null)
  if (stored === 'light' || stored === 'dark') return stored
  if (typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)').matches) return 'dark'
  return 'light'
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(initialTheme)
  const [role, setRoleState] = useState<RoleId>(() => readLS<RoleId>('rb-role', 'owner'))
  const [range, setRangeState] = useState<RangeId>(() => readLS<RangeId>('rb-range', '30d'))
  const [navCollapsed, setNavCollapsed] = useState<boolean>(() => readLS<boolean>('rb-nav', false))
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    writeLS('rb-theme', theme)
  }, [theme])

  const setRole = (r: RoleId) => { setRoleState(r); writeLS('rb-role', r) }
  const setRange = (r: RangeId) => { setRangeState(r); writeLS('rb-range', r) }
  const toggleNav = () => setNavCollapsed((c) => { writeLS('rb-nav', !c); return !c })
  const toggleTheme = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))

  return (
    <Ctx.Provider
      value={{ theme, toggleTheme, role, setRole, range, setRange, navCollapsed, toggleNav, mobileNavOpen, setMobileNavOpen }}
    >
      {children}
    </Ctx.Provider>
  )
}

export function useApp(): AppState {
  const v = useContext(Ctx)
  if (!v) throw new Error('useApp outside provider')
  return v
}
