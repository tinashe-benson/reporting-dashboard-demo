/**
 * Report builder — pick a date range and the sections to include, watch the
 * branded report assemble live, then either "send" it (a demo toast) or step
 * into fullscreen Presentation mode in front of the client.
 */
import { useState } from 'react'
import { toast } from 'sonner'
import { Presentation as PresentIcon, Send, FileDown, Target } from 'lucide-react'
import type { Client, Role } from '@/lib/dashboardData'
import { DATE_RANGES, type DateRange } from '@/lib/dashboardData'
import { money, money2, num } from '@/lib/dashboardFormat'
import {
  ClayCard,
  ClayInset,
  ClayButton,
  ClayRadioList,
  ClaySwitch,
  ClayKnob,
  SectionTitle,
  CLAY_COLORS,
} from './Clay'
import Presentation, { SECTION_LABELS, type SectionKey } from './Presentation'

const AGENCY = 'Tinashe Benson · Growth'

export default function ReportBuilder({ client, role }: { client: Client; role: Role }) {
  const [range, setRange] = useState<DateRange>('This month')
  const [sections, setSections] = useState<Record<SectionKey, boolean>>({
    headline: true,
    channels: true,
    google: true,
    search: true,
    summary: true,
  })
  const [goal, setGoal] = useState(Math.round(client.blendedLeads * 1.15))
  const [presenting, setPresenting] = useState(false)

  const active = SECTION_LABELS.filter((s) => sections[s.key]).map((s) => s.key)
  const goalPct = Math.min(100, Math.round((client.blendedLeads / goal) * 100))

  if (!role.canBuildReports) {
    return (
      <ClayCard className="p-10 text-center max-w-lg mx-auto mt-6">
        <div className="clay-inset w-14 h-14 rounded-full grid place-items-center mx-auto mb-4">
          <FileDown size={22} className="text-[var(--ink-soft)]" />
        </div>
        <h2 className="font-display text-lg font-semibold text-[var(--ink)] mb-1">Reports are agency-managed</h2>
        <p className="text-sm text-[var(--ink-soft)]">
          The client view is read-only. Your account manager builds and sends the monthly report from here — switch to
          the Agency Owner or Account Manager seat to try it.
        </p>
      </ClayCard>
    )
  }

  return (
    <>
      <div className="grid lg:grid-cols-[380px_1fr] gap-6">
        {/* Controls */}
        <div className="flex flex-col gap-5">
          <ClayCard className="p-5">
            <SectionTitle sub="Everything below drives the live preview and the presentation.">Build the report</SectionTitle>

            <label className="text-xs font-semibold uppercase tracking-wide text-[var(--ink-faint)]">Date range</label>
            <div className="mt-2 mb-5">
              <ClayRadioList
                value={range}
                onChange={(v) => setRange(v as DateRange)}
                options={DATE_RANGES.map((r) => ({ value: r, label: r }))}
              />
            </div>

            <label className="text-xs font-semibold uppercase tracking-wide text-[var(--ink-faint)]">Sections to include</label>
            <div className="mt-3 flex flex-col gap-3">
              {SECTION_LABELS.map((s) => (
                <div key={s.key} className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-sm font-medium text-[var(--ink)]">{s.label}</div>
                    <div className="text-xs text-[var(--ink-faint)]">{s.hint}</div>
                  </div>
                  <ClaySwitch on={sections[s.key]} onChange={(v) => setSections((p) => ({ ...p, [s.key]: v }))} />
                </div>
              ))}
            </div>
          </ClayCard>

          <ClayCard className="p-5 flex items-center gap-5">
            <ClayKnob value={goal} min={Math.round(client.blendedLeads * 0.8)} max={Math.round(client.blendedLeads * 1.6)} onChange={setGoal} display={String(goal)} label="Lead goal" />
            <div className="flex-1">
              <div className="flex items-center gap-1.5 text-sm font-medium text-[var(--ink)] mb-1">
                <Target size={14} style={{ color: CLAY_COLORS.amber }} /> Next-month target
              </div>
              <p className="text-xs text-[var(--ink-soft)] mb-2">
                Currently at {num(client.blendedLeads)} of {num(goal)} leads — {goalPct}% of goal.
              </p>
              <ClayInset small className="h-3 overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${goalPct}%`, background: `linear-gradient(90deg, ${CLAY_COLORS.amber}, ${CLAY_COLORS.teal})` }} />
              </ClayInset>
            </div>
          </ClayCard>

          <div className="flex gap-3">
            <ClayButton amber className="flex-1 flex items-center justify-center gap-2" disabled={active.length === 0} onClick={() => setPresenting(true)}>
              <PresentIcon size={16} /> Present
            </ClayButton>
            <ClayButton
              className="flex-1 flex items-center justify-center gap-2"
              disabled={active.length === 0}
              onClick={() =>
                toast.success('Report sent to ' + client.name, {
                  description: `${active.length} sections · ${range} · delivered as a branded PDF`,
                })
              }
            >
              <Send size={16} /> Send to client
            </ClayButton>
          </div>
        </div>

        {/* Live preview */}
        <ClayCard className="p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold uppercase tracking-wide text-[var(--ink-faint)]">Live preview</span>
            <span className="text-xs text-[var(--ink-faint)]">{active.length + 1} slides</span>
          </div>

          {/* Paper */}
          <ClayInset className="p-6 md:p-8 flex flex-col gap-5">
            {/* Cover */}
            <div className="flex items-center justify-between gap-4 border-b border-[var(--line)] pb-5">
              <div>
                <div className="text-xs font-semibold uppercase tracking-widest" style={{ color: CLAY_COLORS.amber }}>
                  {AGENCY}
                </div>
                <div className="font-display text-2xl md:text-3xl font-bold text-[var(--ink)] mt-1">Performance Report</div>
                <div className="text-sm text-[var(--ink-soft)] mt-1">
                  {client.name} · {client.period} · {range}
                </div>
              </div>
              <div className="clay-sm w-16 h-16 rounded-[20px] grid place-items-center flex-none">
                <span className="font-display text-xl font-bold text-[var(--amber-deep)]">{client.mark}</span>
              </div>
            </div>

            {sections.headline && (
              <PreviewBlock title="Headline results">
                <div className="grid grid-cols-3 gap-3">
                  <MiniStat label="Leads" value={num(client.blendedLeads)} />
                  <MiniStat label="Cost / lead" value={money2(client.blendedCPL)} />
                  <MiniStat label="Spend" value={money(client.totalSpend)} />
                </div>
              </PreviewBlock>
            )}

            {sections.channels && (
              <PreviewBlock title="Where leads came from">
                <ChannelBars client={client} />
              </PreviewBlock>
            )}

            {sections.google && (
              <PreviewBlock title="Google presence">
                <div className="grid grid-cols-3 gap-3">
                  <MiniStat label="Rating" value={client.gbpRating.toFixed(1) + '★'} />
                  <MiniStat label="Reviews" value={num(client.gbpReviews)} />
                  <MiniStat label="Directions" value={num(client.gbpDirections)} />
                </div>
              </PreviewBlock>
            )}

            {sections.search && (
              <PreviewBlock title="Search visibility">
                <div className="grid grid-cols-2 gap-3">
                  <MiniStat label="Visibility" value={client.semVisibility.toFixed(1) + '%'} />
                  <MiniStat label="Keywords tracked" value={num(client.semKeywords)} />
                </div>
              </PreviewBlock>
            )}

            {sections.summary && (
              <PreviewBlock title="Summary & next steps">
                <p className="text-sm text-[var(--ink-soft)] leading-relaxed">
                  {client.blendedLeads} leads at {money2(client.blendedCPL)} each. Budget shifts toward the lowest-cost
                  channels next month, with a target of {num(goal)} leads.
                </p>
              </PreviewBlock>
            )}

            {active.length === 0 && (
              <p className="text-sm text-[var(--ink-faint)] py-8 text-center">
                Toggle a section on to start building the report.
              </p>
            )}
          </ClayInset>
        </ClayCard>
      </div>

      {presenting && (
        <Presentation client={client} sections={active} agency={AGENCY} range={range} onClose={() => setPresenting(false)} />
      )}
    </>
  )
}

function PreviewBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-xs font-semibold uppercase tracking-wide text-[var(--ink-faint)] mb-2">{title}</div>
      {children}
    </div>
  )
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="clay-sm p-3 rounded-[12px]">
      <div className="text-[11px] text-[var(--ink-soft)] uppercase tracking-wide">{label}</div>
      <div className="font-num text-lg font-semibold text-[var(--ink)]">{value}</div>
    </div>
  )
}

function ChannelBars({ client }: { client: Client }) {
  const rows = [
    { name: 'LSA', v: client.lsaLeads, c: CLAY_COLORS.amber },
    { name: 'Google Ads', v: client.adsConversions, c: CLAY_COLORS.slate },
    { name: 'Meta', v: client.metaResults, c: CLAY_COLORS.teal },
  ]
  const max = Math.max(...rows.map((r) => r.v))
  return (
    <div className="flex flex-col gap-2">
      {rows.map((r) => (
        <div key={r.name} className="flex items-center gap-3">
          <span className="text-xs text-[var(--ink-soft)] w-20 flex-none">{r.name}</span>
          <div className="clay-inset-sm flex-1 h-5 overflow-hidden rounded-full">
            <div className="h-full rounded-full flex items-center justify-end pr-2" style={{ width: `${(r.v / max) * 100}%`, background: r.c }}>
              <span className="font-num text-[10px] font-semibold text-white">{r.v}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
