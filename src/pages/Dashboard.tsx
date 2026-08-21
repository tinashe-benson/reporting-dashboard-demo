/**
 * Client Reporting Dashboard — a standalone demo property.
 *
 * One dashboard replaces four platform logins: it blends Local Services Ads,
 * Google Ads, Google Business Profile, Meta Ads and SEMrush for a roster of
 * home-service clients, and lets the agency build and present a branded client
 * report without leaving the page. No backend, no auth — all data is mock
 * (see src/lib/dashboardData.ts).
 *
 * The whole app is this page: it carries its own claymorphic / neumorphic
 * theme scoped to .clay-root (see index.css) and mounts straight into #root.
 */
import { useEffect, useMemo, useState } from 'react'
import { LayoutGrid, Layers, FileText, Lock, Radio } from 'lucide-react'
import { Toaster } from 'sonner'
import { CLIENTS, ROLES, getClient, type RoleId, type Client, type Role } from '@/lib/dashboardData'
import { ClaySegmented, StatusLED, type SegOption } from '@/components/dashboard/Clay'
import Overview from '@/components/dashboard/Overview'
import Platforms from '@/components/dashboard/Platforms'
import ReportBuilder from '@/components/dashboard/ReportBuilder'

type View = 'overview' | 'platforms' | 'report'

function worstStatus(client: Client): 'live' | 'syncing' | 'attention' {
  const vals = Object.values(client.sources)
  if (vals.includes('attention')) return 'attention'
  if (vals.includes('syncing')) return 'syncing'
  return 'live'
}

export default function Dashboard() {
  const [roleId, setRoleId] = useState<RoleId>('admin')
  const role: Role = useMemo(() => ROLES.find((r) => r.id === roleId)!, [roleId])
  const [clientId, setClientId] = useState<string>(CLIENTS[0].id)
  const [view, setView] = useState<View>('overview')

  // When the seat is a client view, lock to its pinned account and keep the
  // report builder out of reach.
  useEffect(() => {
    if (role.singleClientOnly && role.pinnedClientId) {
      setClientId(role.pinnedClientId)
      setView((v) => (v === 'report' ? 'overview' : v))
    }
  }, [role])

  const client = getClient(clientId)

  // Set the tab title and keep this demo out of search, matching how the rest
  // of the site drives its head (see src/components/SEO.tsx) rather than using
  // Helmet, since no HelmetProvider is mounted.
  useEffect(() => {
    const prevTitle = document.title
    document.title = 'Client Reporting Dashboard — Demo'
    const robots = document.createElement('meta')
    robots.name = 'robots'
    robots.content = 'noindex, nofollow'
    document.head.appendChild(robots)
    return () => {
      document.title = prevTitle
      robots.remove()
    }
  }, [])

  const viewOptions: SegOption<View>[] = [
    { value: 'overview', label: 'Overview', icon: <LayoutGrid size={15} /> },
    { value: 'platforms', label: 'Platforms', icon: <Layers size={15} /> },
    ...(role.canBuildReports
      ? [{ value: 'report' as View, label: 'Report & Present', icon: <FileText size={15} /> }]
      : []),
  ]

  const roster = role.singleClientOnly ? CLIENTS.filter((c) => c.id === clientId) : CLIENTS

  return (
    <div className="clay-root">
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside className="hidden lg:flex flex-col w-72 flex-none p-5 gap-5 sticky top-0 h-screen clay-scroll overflow-y-auto">
          <Brand />

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wide text-[var(--ink-faint)]">Client roster</span>
              {!role.singleClientOnly && (
                <span className="font-num text-xs text-[var(--ink-faint)]">{CLIENTS.length}</span>
              )}
            </div>
            <div className="flex flex-col gap-2.5">
              {roster.map((c) => (
                <RosterItem key={c.id} client={c} active={c.id === clientId} onClick={() => setClientId(c.id)} />
              ))}
            </div>
            {role.singleClientOnly && (
              <div className="mt-3 flex items-center gap-2 text-xs text-[var(--ink-faint)]">
                <Lock size={12} /> This seat sees one account only.
              </div>
            )}
          </div>

          <RoleSwitcher roleId={roleId} onChange={setRoleId} />

          <div className="mt-auto text-[11px] text-[var(--ink-faint)] leading-relaxed">
            Demo data. No live integrations — every figure is illustrative.
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1 min-w-0 p-4 md:p-7 clay-scroll">
          {/* Mobile controls */}
          <div className="lg:hidden mb-4 flex flex-col gap-3">
            <Brand />
            <div className="flex gap-2 overflow-x-auto clay-scroll pb-1 -mx-1 px-1">
              {roster.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setClientId(c.id)}
                  className={`clay-btn ${c.id === clientId ? 'is-active' : ''} px-3 py-2 flex items-center gap-2 flex-none`}
                >
                  <StatusLED status={worstStatus(c)} />
                  <span className="text-sm whitespace-nowrap">{c.name}</span>
                </button>
              ))}
            </div>
            <RoleSwitcherCompact roleId={roleId} onChange={setRoleId} />
          </div>

          {/* Header */}
          <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="clay w-14 h-14 rounded-[18px] grid place-items-center flex-none">
                <span className="font-display text-lg font-bold text-[var(--amber-deep)]">{client.mark}</span>
              </div>
              <div>
                <h1 className="font-display text-2xl font-bold text-[var(--ink)] leading-tight">{client.name}</h1>
                <p className="text-sm text-[var(--ink-soft)]">
                  {client.trade} · {client.location} · <span className="text-[var(--ink-faint)]">{client.period}</span>
                </p>
              </div>
            </div>
            <div className="overflow-x-auto clay-scroll -mx-1 px-1">
              <ClaySegmented value={view} onChange={setView} options={viewOptions} />
            </div>
          </header>

          {view === 'overview' && <Overview client={client} role={role} />}
          {view === 'platforms' && <Platforms client={client} />}
          {view === 'report' && <ReportBuilder client={client} role={role} />}
        </main>
      </div>

      <Toaster
        position="bottom-right"
        theme="light"
        toastOptions={{
          style: {
            background: '#ece8e0',
            border: 'none',
            color: '#34333c',
            borderRadius: '14px',
            boxShadow: '-4px -4px 10px #fbf8f1, 6px 6px 14px #c6c0b1',
          },
        }}
      />
    </div>
  )
}

function Brand() {
  return (
    <div className="flex items-center gap-2.5">
      <div className="clay w-11 h-11 rounded-[15px] grid place-items-center flex-none">
        <Radio size={18} style={{ color: 'var(--amber-deep)' }} />
      </div>
      <div>
        <div className="font-display text-base font-bold text-[var(--ink)] leading-none">Dispatch</div>
        <div className="text-[11px] text-[var(--ink-faint)] mt-0.5">Client reporting</div>
      </div>
    </div>
  )
}

function RosterItem({ client, active, onClick }: { client: Client; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} className={`clay-btn ${active ? 'is-active' : ''} w-full px-3 py-2.5 flex items-center gap-3 text-left`}>
      <div className="clay-inset-sm w-9 h-9 rounded-[11px] grid place-items-center flex-none">
        <span className="font-display text-xs font-bold text-[var(--ink-soft)]">{client.mark}</span>
      </div>
      <div className="min-w-0 flex-1">
        <div className={`text-sm font-medium truncate ${active ? 'text-[var(--amber-deep)]' : 'text-[var(--ink)]'}`}>
          {client.name}
        </div>
        <div className="text-xs text-[var(--ink-faint)]">{client.trade}</div>
      </div>
      <StatusLED status={worstStatus(client)} />
    </button>
  )
}

function RoleSwitcher({ roleId, onChange }: { roleId: RoleId; onChange: (r: RoleId) => void }) {
  const role = ROLES.find((r) => r.id === roleId)!
  return (
    <div className="clay p-3.5">
      <div className="text-xs font-semibold uppercase tracking-wide text-[var(--ink-faint)] mb-2.5">Viewing as</div>
      <div className="flex flex-col gap-1.5">
        {ROLES.map((r) => {
          const on = r.id === roleId
          return (
            <button
              key={r.id}
              onClick={() => onChange(r.id)}
              className={`flex items-start gap-2.5 text-left rounded-[11px] px-2.5 py-2 transition-all ${
                on ? 'clay-inset-sm' : 'hover:bg-[var(--ground-2)]'
              }`}
            >
              <span className={`clay-radio mt-0.5 ${on ? 'is-on' : ''}`} style={{ width: 18, height: 18 }}>
                <span className="clay-radio-dot" style={{ width: 8, height: 8 }} />
              </span>
              <span>
                <span className={`block text-sm font-medium ${on ? 'text-[var(--amber-deep)]' : 'text-[var(--ink)]'}`}>{r.label}</span>
                <span className="block text-[11px] text-[var(--ink-faint)] leading-tight">{r.scope}</span>
              </span>
            </button>
          )
        })}
      </div>
      <div className="mt-2.5 pt-2.5 border-t border-[var(--line)] text-[11px] text-[var(--ink-faint)]">
        Role-based access is live: this changes what data and tools appear.
      </div>
      <span className="sr-only">{role.scope}</span>
    </div>
  )
}

function RoleSwitcherCompact({ roleId, onChange }: { roleId: RoleId; onChange: (r: RoleId) => void }) {
  return (
    <ClaySegmented
      value={roleId}
      onChange={onChange}
      className="w-full"
      options={ROLES.map((r) => ({ value: r.id, label: <span className="text-xs">{r.label}</span> }))}
    />
  )
}
