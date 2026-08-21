/**
 * Reports: assemble an internal, print-ready account report. "Export PDF"
 * runs the browser's print-to-PDF against a clean sheet (app chrome hidden by
 * the print stylesheet). No client-facing send — this is for internal review.
 */
import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router'
import { toast } from 'sonner'
import { Printer, Check } from 'lucide-react'
import { useApp } from '@/context/app'
import { accountsForSeat, ACCOUNTS, getAccount, metricsFor, pacing, RANGES } from '@/lib/data'
import { money, money2, num, compact } from '@/lib/format'
import { Card, Button, Toggle, Segmented } from '@/components/ui/kit'

type SectionKey = 'headline' | 'channels' | 'google' | 'search' | 'summary'
const SECTIONS: { key: SectionKey; label: string; hint: string }[] = [
  { key: 'headline', label: 'Headline results', hint: 'Leads, cost per lead, spend' },
  { key: 'channels', label: 'Channel mix', hint: 'Leads by paid channel' },
  { key: 'google', label: 'Google presence', hint: 'Reviews, rating, map actions' },
  { key: 'search', label: 'Search visibility', hint: 'Keyword movement' },
  { key: 'summary', label: 'Summary', hint: 'Written recap' },
]

const AGENCY = 'Tinashe Benson · Growth'

export default function Reports() {
  const [params] = useSearchParams()
  const { range, setRange, seat } = useApp()
  const scope = seat ? accountsForSeat(seat) : ACCOUNTS
  const paramAcct = params.get('account') || ''
  const initial = scope.some((a) => a.id === paramAcct) ? paramAcct : scope[0].id
  const [accountId, setAccountId] = useState(initial)
  const [sections, setSections] = useState<Record<SectionKey, boolean>>({ headline: true, channels: true, google: true, search: true, summary: true })

  const account = getAccount(accountId)!
  const m = useMemo(() => metricsFor(account, range), [account, range])
  const p = pacing(account)
  const active = SECTIONS.filter((s) => sections[s.key])
  const rangeLabel = RANGES.find((r) => r.id === range)!.label

  return (
    <div className="grid lg:grid-cols-[300px_1fr] gap-6">
      {/* Controls */}
      <div className="flex flex-col gap-4 no-print">
        <Card className="p-4">
          <div className="text-[13px] font-bold mb-3">Report setup</div>

          <label className="eyebrow">Account</label>
          <div className="mt-2 mb-4 flex flex-col gap-1.5">
            {scope.map((a) => (
              <button
                key={a.id}
                onClick={() => setAccountId(a.id)}
                className={`flex items-center gap-2.5 px-2.5 py-2 rounded-[8px] text-left transition-colors border ${
                  a.id === accountId ? 'bg-[var(--accent-weak)] border-[color-mix(in_srgb,var(--accent)_22%,transparent)]' : 'border-transparent hover:bg-[var(--surface-2)]'
                }`}
              >
                <span className="w-6 h-6 rounded-[6px] grid place-items-center mono text-[10px] font-bold text-white flex-none" style={{ background: a.color }}>{a.mark}</span>
                <span className={`text-[13px] font-medium ${a.id === accountId ? 'text-[var(--accent)]' : 'text-[var(--ink)]'}`}>{a.name}</span>
              </button>
            ))}
          </div>

          <label className="eyebrow">Date range</label>
          <div className="mt-2 mb-4">
            <Segmented value={range} onChange={setRange} options={RANGES.map((r) => ({ value: r.id, label: r.label }))} className="w-full" />
          </div>

          <label className="eyebrow">Sections</label>
          <div className="mt-2.5 flex flex-col gap-2.5">
            {SECTIONS.map((s) => (
              <div key={s.key} className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-[13px] font-medium">{s.label}</div>
                  <div className="text-[11px] text-[var(--muted)]">{s.hint}</div>
                </div>
                <Toggle on={sections[s.key]} onChange={(v) => setSections((prev) => ({ ...prev, [s.key]: v }))} label={s.label} />
              </div>
            ))}
          </div>
        </Card>

        <div className="flex gap-2.5">
          <Button variant="primary" className="flex-1 justify-center" disabled={active.length === 0} onClick={() => window.print()}>
            <Printer size={15} /> Export PDF
          </Button>
          <Button className="flex-1 justify-center" onClick={() => toast.success('Marked reviewed', { description: `${account.name} · ${rangeLabel}` })}>
            <Check size={15} /> Mark reviewed
          </Button>
        </div>
      </div>

      {/* Sheet */}
      <Card className="p-7 md:p-9 print-sheet">
        <div className="flex items-start justify-between gap-4 border-b border-[var(--line)] pb-5 mb-5">
          <div>
            <div className="eyebrow" style={{ color: 'var(--accent)' }}>{AGENCY}</div>
            <h2 className="text-[26px] font-bold tracking-[-0.02em] mt-1">Performance report</h2>
            <div className="text-[13px] text-[var(--ink-2)] mt-1">{account.name} · {account.trade} · {rangeLabel}</div>
          </div>
          <div className="w-14 h-14 rounded-[13px] grid place-items-center mono font-bold text-[17px] text-white flex-none" style={{ background: account.color }}>{account.mark}</div>
        </div>

        <div className="flex flex-col gap-6">
          {sections.headline && (
            <Block title="Headline results">
              <div className="grid grid-cols-3 gap-3">
                <Mini label="Leads" value={num(m.leads)} delta={m.leadsDelta} />
                <Mini label="Cost / lead" value={money2(m.cpl)} delta={m.cplDelta} lowerIsBetter />
                <Mini label="Ad spend" value={money(m.spend)} delta={m.spendDelta} lowerIsBetter />
              </div>
            </Block>
          )}

          {sections.channels && (
            <Block title="Where leads came from">
              <ChannelBars account={account} />
            </Block>
          )}

          {sections.google && (
            <Block title="Google presence">
              <div className="grid grid-cols-4 gap-3">
                <Mini label="Rating" value={account.gbp.rating.toFixed(1)} />
                <Mini label="Reviews" value={num(account.gbp.reviews)} />
                <Mini label="Profile views" value={compact(account.gbp.views)} />
                <Mini label="Directions" value={num(account.gbp.directions)} />
              </div>
            </Block>
          )}

          {sections.search && (
            <Block title="Search visibility">
              <div className="grid grid-cols-2 gap-3 mb-3">
                <Mini label="Visibility" value={account.semrush.visibility.toFixed(1) + '%'} delta={account.semrush.visibilityDelta} />
                <Mini label="Keywords tracked" value={num(account.semrush.keywords)} />
              </div>
              <div className="flex flex-col gap-1.5">
                {account.semrush.gaining.slice(0, 3).map((mv) => (
                  <div key={mv.term} className="flex items-center justify-between text-[12.5px] bg-[var(--surface-2)] border border-[var(--line)] rounded-[7px] px-3 py-1.5">
                    <span>{mv.term}</span>
                    <span className="mono font-semibold" style={{ color: 'var(--good)' }}>#{mv.from} → #{mv.to}</span>
                  </div>
                ))}
              </div>
            </Block>
          )}

          {sections.summary && (
            <Block title="Summary">
              <p className="text-[13px] leading-relaxed text-[var(--ink-2)]">
                {account.name} generated {num(m.leads)} leads over the {rangeLabel} window at {money2(m.cpl)} each, with spend at {p.pct}% of the monthly budget.
                {' '}Next month the plan shifts budget toward the lowest cost channels and pushes the climbing keywords onto page one.
              </p>
            </Block>
          )}

          {active.length === 0 && <p className="text-[13px] text-[var(--muted)] py-8 text-center">Turn on a section to build the report.</p>}
        </div>

        <div className="border-t border-[var(--line)] mt-7 pt-4 text-[11px] text-[var(--muted)]">Prepared for internal review · {AGENCY} · Demo data</div>
      </Card>
    </div>
  )
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="eyebrow mb-2.5">{title}</div>
      {children}
    </div>
  )
}

function Mini({ label, value, delta, lowerIsBetter }: { label: string; value: string; delta?: number; lowerIsBetter?: boolean }) {
  const good = delta === undefined ? true : lowerIsBetter ? delta < 0 : delta > 0
  return (
    <div className="bg-[var(--surface-2)] border border-[var(--line)] rounded-[9px] p-3">
      <div className="text-[10.5px] text-[var(--muted)] uppercase tracking-wide">{label}</div>
      <div className="mono text-[19px] font-semibold mt-0.5">{value}</div>
      {delta !== undefined && (
        <div className="mono text-[11px] font-semibold mt-0.5" style={{ color: good ? 'var(--good)' : 'var(--bad)' }}>{delta > 0 ? '▲' : '▼'} {Math.abs(delta).toFixed(1)}%</div>
      )}
    </div>
  )
}

function ChannelBars({ account }: { account: ReturnType<typeof getAccount> }) {
  if (!account) return null
  const rows = [
    { name: 'Local Services Ads', v: account.lsa.leads, c: 'var(--s-blue)' },
    { name: 'Google Ads', v: account.googleAds.conversions, c: 'var(--s-orange)' },
    { name: 'Meta Ads', v: account.meta.results, c: 'var(--s-aqua)' },
  ]
  const max = Math.max(...rows.map((r) => r.v))
  return (
    <div className="flex flex-col gap-2">
      {rows.map((r) => (
        <div key={r.name} className="flex items-center gap-3">
          <span className="text-[12px] text-[var(--ink-2)] w-32 flex-none">{r.name}</span>
          <div className="flex-1 h-5 bg-[var(--surface-2)] rounded-full overflow-hidden">
            <div className="h-full rounded-full flex items-center justify-end pr-2" style={{ width: `${(r.v / max) * 100}%`, background: r.c }}>
              <span className="mono text-[10px] font-semibold text-white">{r.v}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
