/** Sortable accounts table. Rows drill into the account detail. */
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router'
import { ChevronRight, ArrowUpDown } from 'lucide-react'
import { ACCOUNTS, metricsFor, pacing, health, type Account, type RangeId, type Health } from '@/lib/data'
import { money2, moneyK, num } from '@/lib/format'
import { Card, HealthBadge, Delta, PacingBar, SourceDots, Sparkline } from '@/components/ui/kit'

type SortKey = 'name' | 'health' | 'leads' | 'cpl' | 'pacing' | 'rating'
const HEALTH_RANK: Record<Health, number> = { risk: 0, watch: 1, good: 2 }

export default function AccountsTable({ range, accounts = ACCOUNTS, showSources = true }: { range: RangeId; accounts?: Account[]; showSources?: boolean }) {
  const navigate = useNavigate()
  const [sort, setSort] = useState<SortKey>('health')
  const [dir, setDir] = useState<1 | -1>(1)

  const rows = useMemo(() => {
    const data = accounts.map((a) => ({ a, m: metricsFor(a, range), p: pacing(a), h: health(a) }))
    const val = (r: (typeof data)[number]) => {
      switch (sort) {
        case 'name': return r.a.name.toLowerCase()
        case 'health': return HEALTH_RANK[r.h]
        case 'leads': return r.m.leads
        case 'cpl': return r.m.cpl
        case 'pacing': return r.p.pct
        case 'rating': return r.a.gbp.rating
      }
    }
    return [...data].sort((x, y) => {
      const vx = val(x), vy = val(y)
      if (vx < vy) return -1 * dir
      if (vx > vy) return 1 * dir
      return 0
    })
  }, [accounts, range, sort, dir])

  const clickSort = (k: SortKey) => {
    if (k === sort) setDir((d) => (d === 1 ? -1 : 1))
    else { setSort(k); setDir(k === 'name' ? 1 : k === 'health' ? 1 : -1) }
  }

  const Th = ({ k, children, align = 'left' }: { k: SortKey; children: React.ReactNode; align?: 'left' | 'right' }) => (
    <th className={`px-3.5 py-2.5 ${align === 'right' ? 'text-right' : 'text-left'}`}>
      <button onClick={() => clickSort(k)} className={`inline-flex items-center gap-1 text-[10.5px] font-semibold tracking-[0.05em] uppercase transition-colors ${sort === k ? 'text-[var(--accent)]' : 'text-[var(--muted)] hover:text-[var(--ink-2)]'}`}>
        {children}<ArrowUpDown size={11} className={sort === k ? 'opacity-100' : 'opacity-40'} />
      </button>
    </th>
  )

  return (
    <Card className="overflow-x-auto clip-scroll">
      <table className="w-full border-collapse min-w-[860px]">
        <thead>
          <tr className="border-b border-[var(--line)]">
            <Th k="name">Account</Th>
            <Th k="health">Health</Th>
            <Th k="leads" align="right">Leads</Th>
            <Th k="cpl" align="right">Cost / lead</Th>
            <Th k="pacing">Spend pacing</Th>
            <th className="px-3.5 py-2.5 text-left text-[10.5px] font-semibold tracking-[0.05em] uppercase text-[var(--muted)]">Trend</th>
            <Th k="rating" align="right">Rating</Th>
            {showSources && <th className="px-3.5 py-2.5 text-left text-[10.5px] font-semibold tracking-[0.05em] uppercase text-[var(--muted)]">Sources</th>}
            <th className="w-8"></th>
          </tr>
        </thead>
        <tbody>
          {rows.map(({ a, m, p, h }) => (
            <tr
              key={a.id}
              onClick={() => navigate(`/accounts/${a.id}`)}
              className="border-b border-[var(--line)] last:border-0 hover:bg-[var(--surface-2)] cursor-pointer transition-colors"
            >
              <td className="px-3.5 py-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-[8px] grid place-items-center flex-none mono font-bold text-[12px] text-white" style={{ background: a.color }}>{a.mark}</div>
                  <div>
                    <div className="font-semibold text-[13.5px] tracking-[-0.01em]">{a.name}</div>
                    <div className="text-[11.5px] text-[var(--muted)]">{a.trade} · {a.location}</div>
                  </div>
                </div>
              </td>
              <td className="px-3.5 py-3"><HealthBadge health={h} /></td>
              <td className="px-3.5 py-3 text-right"><div className="mono text-[13.5px] font-semibold">{num(m.leads)}</div><Delta value={m.leadsDelta} /></td>
              <td className="px-3.5 py-3 text-right"><div className="mono text-[13.5px] font-semibold">{money2(m.cpl)}</div><Delta value={m.cplDelta} lowerIsBetter /></td>
              <td className="px-3.5 py-3"><PacingBar pct={p.pct} spendLabel={moneyK(p.mtd)} /></td>
              <td className="px-3.5 py-3"><Sparkline data={a.leadsDaily.slice(-30).filter((_, i) => i % 3 === 0)} color={a.color} /></td>
              <td className="px-3.5 py-3 text-right"><span className="mono text-[13.5px] font-semibold">{a.gbp.rating.toFixed(1)}</span></td>
              {showSources && <td className="px-3.5 py-3"><SourceDots sources={a.sources} /></td>}
              <td className="px-2 py-3 text-right"><ChevronRight size={16} className="text-[var(--muted)]" /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  )
}
