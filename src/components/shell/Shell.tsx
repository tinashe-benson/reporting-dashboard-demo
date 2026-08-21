/** App shell: a collapsible nav rail, a top bar, and the routed page. */
import { useEffect } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router'
import {
  LayoutGrid, Users, Bell, FileText, Cable, Settings as SettingsIcon,
  PanelLeftClose, PanelLeftOpen, Menu, X, Sun, Moon, RadioTower,
} from 'lucide-react'
import { useApp } from '@/context/app'
import { ROLES, allAlerts } from '@/lib/data'
import { Segmented, IconButton } from '@/components/ui/kit'

const NAV = [
  { to: '/', label: 'Portfolio', icon: LayoutGrid, end: true },
  { to: '/accounts', label: 'Accounts', icon: Users },
  { to: '/alerts', label: 'Alerts', icon: Bell, badge: true },
  { to: '/reports', label: 'Reports', icon: FileText },
]
const NAV_2 = [
  { to: '/integrations', label: 'Integrations', icon: Cable },
  { to: '/settings', label: 'Settings', icon: SettingsIcon },
]

const TITLES: Record<string, string> = {
  '/': 'Portfolio', '/accounts': 'Accounts', '/alerts': 'Alerts',
  '/reports': 'Reports', '/integrations': 'Integrations', '/settings': 'Settings',
}

function pageTitle(path: string): string {
  if (path.startsWith('/accounts/')) return 'Account'
  return TITLES[path] ?? 'Reportbeacon'
}

export default function Shell() {
  const { navCollapsed, toggleNav, mobileNavOpen, setMobileNavOpen, theme, toggleTheme, role, setRole } = useApp()
  const location = useLocation()
  const alertCount = allAlerts().length

  // Close the mobile drawer whenever the route changes.
  useEffect(() => { setMobileNavOpen(false) }, [location.pathname, setMobileNavOpen])

  const railWidth = navCollapsed ? 'lg:w-[68px]' : 'lg:w-[236px]'

  return (
    <div className="min-h-screen">
      {/* Mobile drawer backdrop */}
      {mobileNavOpen && (
        <div className="fixed inset-0 z-40 bg-black/40 lg:hidden no-print" onClick={() => setMobileNavOpen(false)} />
      )}

      <div className="flex min-h-screen">
        {/* Rail */}
        <aside
          className={`no-print fixed lg:sticky top-0 z-50 lg:z-auto h-screen flex flex-col bg-[var(--surface)] border-r border-[var(--line)] transition-all duration-200
            ${railWidth} w-[236px]
            ${mobileNavOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
        >
          <Rail collapsed={navCollapsed} alertCount={alertCount} onCloseMobile={() => setMobileNavOpen(false)} />
          <button
            onClick={toggleNav}
            className="hidden lg:flex items-center gap-2.5 mx-2 mb-3 px-3 py-2 rounded-[8px] text-[13px] text-[var(--ink-2)] hover:bg-[var(--surface-2)] hover:text-[var(--ink)] transition-colors"
            title={navCollapsed ? 'Expand navigation' : 'Collapse navigation'}
          >
            {navCollapsed ? <PanelLeftOpen size={18} /> : <><PanelLeftClose size={18} /> Collapse</>}
          </button>
        </aside>

        {/* Main */}
        <div className="flex-1 min-w-0">
          <header className="no-print sticky top-0 z-30 flex items-center gap-3 px-4 lg:px-6 py-3 border-b border-[var(--line)] bg-[color-mix(in_srgb,var(--surface)_80%,transparent)] backdrop-blur">
            <IconButton label="Open navigation" className="lg:hidden" onClick={() => setMobileNavOpen(true)}><Menu size={18} /></IconButton>
            <h1 className="text-[18px] font-bold tracking-[-0.02em]">{pageTitle(location.pathname)}</h1>
            <span className="hidden sm:flex items-center gap-2 text-[12px] text-[var(--ink-2)] ml-1">
              <span className="w-[7px] h-[7px] rounded-full bg-[var(--st-good)]" style={{ boxShadow: '0 0 0 3px color-mix(in srgb, var(--st-good) 20%, transparent)' }} />
              Synced 4 min ago
            </span>
            <div className="flex-1" />
            <Segmented
              value={role}
              onChange={setRole}
              options={ROLES.map((r) => ({ value: r.id, label: r.label }))}
            />
            <IconButton label="Toggle light and dark" onClick={toggleTheme}>
              {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
            </IconButton>
          </header>

          <main className="px-4 lg:px-6 py-5 pb-16 max-w-[1360px]">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  )
}

function Rail({ collapsed, alertCount, onCloseMobile }: { collapsed: boolean; alertCount: number; onCloseMobile: () => void }) {
  return (
    <>
      <div className={`flex items-center gap-2.5 px-4 pt-4 pb-4 ${collapsed ? 'lg:justify-center lg:px-0' : ''}`}>
        <div className="w-[30px] h-[30px] rounded-[8px] bg-[var(--ink)] text-[var(--surface)] grid place-items-center flex-none">
          <RadioTower size={17} />
        </div>
        {!collapsed && (
          <div className="lg:block">
            <div className="font-bold text-[14.5px] tracking-[-0.01em] leading-none">Reportbeacon</div>
            <div className="text-[11px] text-[var(--muted)] mt-0.5">Account console</div>
          </div>
        )}
        <IconButton label="Close navigation" className="lg:hidden ml-auto" onClick={onCloseMobile}><X size={16} /></IconButton>
      </div>

      <nav className="flex-1 overflow-y-auto clip-scroll px-2.5">
        <NavGroup collapsed={collapsed} label="Workspace" items={NAV} alertCount={alertCount} />
        <NavGroup collapsed={collapsed} label="Configure" items={NAV_2} alertCount={alertCount} />
      </nav>
    </>
  )
}

function NavGroup({ collapsed, label, items, alertCount }: {
  collapsed: boolean
  label: string
  items: { to: string; label: string; icon: any; end?: boolean; badge?: boolean }[]
  alertCount: number
}) {
  return (
    <div className="mb-1">
      {!collapsed && <div className="text-[10.5px] font-semibold tracking-[0.06em] uppercase text-[var(--muted)] px-2 pt-3.5 pb-1.5">{label}</div>}
      {collapsed && <div className="h-3.5" />}
      {items.map((it) => {
        const Icon = it.icon
        return (
          <NavLink
            key={it.to}
            to={it.to}
            end={it.end}
            title={collapsed ? it.label : undefined}
            className={({ isActive }) =>
              `flex items-center gap-2.5 rounded-[8px] px-2.5 py-2 my-[1px] text-[13.5px] font-medium border border-transparent transition-colors ${
                collapsed ? 'lg:justify-center lg:px-0' : ''
              } ${
                isActive
                  ? 'bg-[var(--accent-weak)] text-[var(--accent)] font-semibold border-[color-mix(in_srgb,var(--accent)_22%,transparent)]'
                  : 'text-[var(--ink-2)] hover:bg-[var(--surface-2)] hover:text-[var(--ink)]'
              }`
            }
          >
            <Icon size={17} className="flex-none" />
            {!collapsed && <span>{it.label}</span>}
            {!collapsed && it.badge && alertCount > 0 && (
              <span className="ml-auto text-[11px] font-semibold bg-[var(--st-critical)] text-white rounded-full px-[7px] leading-[18px]">{alertCount}</span>
            )}
            {collapsed && it.badge && alertCount > 0 && (
              <span className="absolute right-2 w-[7px] h-[7px] rounded-full bg-[var(--st-critical)]" />
            )}
          </NavLink>
        )
      })}
    </div>
  )
}
