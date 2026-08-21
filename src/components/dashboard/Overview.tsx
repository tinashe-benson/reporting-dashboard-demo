/** Overview tab — blended cross-platform metrics for the selected client. */
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Star } from 'lucide-react'
import type { Client, Role } from '@/lib/dashboardData'
import { PLATFORMS } from '@/lib/dashboardData'
import { money, money2, num } from '@/lib/dashboardFormat'
import { ClayCard, ClayInset, Stat, StatusLED, Delta, SectionTitle, CLAY_COLORS } from './Clay'

const STATUS_LABEL: Record<string, string> = {
  live: 'Live',
  syncing: 'Syncing',
  attention: 'Needs attention',
}

function weekLabel(i: number, total: number): string {
  const back = total - i
  return back === 1 ? 'This wk' : `${back}w`
}

export default function Overview({ client, role }: { client: Client; role: Role }) {
  const trend = client.leadsSeries.map((leads, i) => ({
    week: weekLabel(i, client.leadsSeries.length),
    leads: Math.round(leads),
    spend: Math.round(client.spendSeries[i]),
  }))

  return (
    <div className="flex flex-col gap-6">
      {/* Blended KPI row */}
      <section>
        <SectionTitle sub="Blended across Local Services Ads, Google Ads and Meta — figures no single platform shows on its own.">
          This month at a glance
        </SectionTitle>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Stat
            label="Leads this month"
            value={num(client.blendedLeads)}
            delta={client.blendedLeadsDelta}
            series={client.leadsSeries}
            color={CLAY_COLORS.amber}
            foot="LSA + Google Ads + Meta"
          />
          <Stat
            label="Blended cost / lead"
            value={money2(client.blendedCPL)}
            delta={client.blendedCPLDelta}
            lowerIsBetter
            series={client.spendSeries.map((s, i) => s / Math.max(1, client.leadsSeries[i]))}
            color={CLAY_COLORS.teal}
            foot="All paid channels combined"
          />
          <Stat
            label="Total ad spend"
            value={money(client.totalSpend)}
            delta={client.totalSpendDelta}
            lowerIsBetter
            series={client.spendSeries}
            color={CLAY_COLORS.slate}
            bars
            foot={role.seesInternalFinance ? `+ ${money(client.retainer)} retainer` : 'Across all paid channels'}
          />
          <ClayCard small className="p-4 flex flex-col gap-2.5">
            <div className="flex items-start justify-between gap-2">
              <span className="text-xs font-medium text-[var(--ink-soft)] uppercase tracking-wide">
                Google rating
              </span>
              <Delta value={(client.gbpReviewDelta / client.gbpReviews) * 100} />
            </div>
            <div className="flex items-end gap-1.5">
              <span className="font-num text-[26px] leading-none font-semibold text-[var(--ink)]">
                {client.gbpRating.toFixed(1)}
              </span>
              <div className="flex mb-0.5 gap-0.5">
                {[0, 1, 2, 3, 4].map((n) => (
                  <Star
                    key={n}
                    size={12}
                    className={n < Math.round(client.gbpRating) ? 'fill-[#ec8a3c] text-[#ec8a3c]' : 'text-[var(--ink-faint)]'}
                  />
                ))}
              </div>
            </div>
            <ClayInset small className="px-2 pt-1 pb-0.5 mt-0.5">
              <ResponsiveContainer width="100%" height={44}>
                <ComposedChart data={client.gbpRatingSeries.map((v, i) => ({ i, v }))}>
                  <Line type="monotone" dataKey="v" stroke={CLAY_COLORS.amber} strokeWidth={2.2} dot={false} isAnimationActive={false} />
                </ComposedChart>
              </ResponsiveContainer>
            </ClayInset>
            <div className="text-xs text-[var(--ink-faint)]">
              {num(client.gbpReviews)} reviews · +{client.gbpReviewDelta} this month
            </div>
          </ClayCard>
        </div>
      </section>

      {/* Connected sources — the row that sells */}
      <section>
        <SectionTitle sub="One dashboard, five platforms. This is what replaces four separate logins.">
          Connected sources
        </SectionTitle>
        <ClayCard className="p-2.5">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2.5">
            {PLATFORMS.map((p) => {
              const status = client.sources[p.id]
              return (
                <ClayInset key={p.id} small className="px-4 py-3.5 flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-display text-sm font-semibold text-[var(--ink)]">{p.short}</span>
                    <StatusLED status={status} />
                  </div>
                  <span className="text-xs text-[var(--ink-soft)] leading-tight">{p.name}</span>
                  <span
                    className="text-[11px] font-medium uppercase tracking-wide"
                    style={{
                      color:
                        status === 'live'
                          ? CLAY_COLORS.teal
                          : status === 'syncing'
                          ? CLAY_COLORS.amber
                          : CLAY_COLORS.coral,
                    }}
                  >
                    {STATUS_LABEL[status]}
                  </span>
                </ClayInset>
              )
            })}
          </div>
        </ClayCard>
      </section>

      {/* Trend */}
      <section>
        <SectionTitle sub="Leads and spend, blended across paid channels, over the last eight weeks.">
          Leads &amp; spend trend
        </SectionTitle>
        <ClayCard className="p-5">
          <div className="flex items-center gap-5 mb-3">
            <LegendDot color={CLAY_COLORS.amber} label="Leads" />
            <LegendDot color={CLAY_COLORS.slate} label="Spend" />
          </div>
          <ClayInset className="p-3">
            <ResponsiveContainer width="100%" height={230}>
              <ComposedChart data={trend} margin={{ top: 8, right: 6, bottom: 0, left: -14 }}>
                <defs>
                  <linearGradient id="ovLeads" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={CLAY_COLORS.amber} stopOpacity={0.28} />
                    <stop offset="100%" stopColor={CLAY_COLORS.amber} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(120,112,92,0.14)" vertical={false} />
                <XAxis dataKey="week" tick={{ fontSize: 11, fill: '#86816f' }} axisLine={false} tickLine={false} />
                <YAxis yAxisId="l" tick={{ fontSize: 11, fill: '#86816f' }} axisLine={false} tickLine={false} width={40} />
                <YAxis yAxisId="r" orientation="right" hide />
                <Tooltip
                  cursor={{ stroke: 'rgba(120,112,92,0.3)' }}
                  contentStyle={{
                    background: '#ece8e0',
                    border: 'none',
                    borderRadius: 12,
                    boxShadow: '4px 4px 12px rgba(160,150,130,0.5)',
                    fontSize: 12,
                  }}
                  formatter={(v: number, key) => (key === 'spend' ? [money(v as number), 'Spend'] : [v, 'Leads'])}
                />
                <Area yAxisId="l" type="monotone" dataKey="leads" stroke={CLAY_COLORS.amber} strokeWidth={2.6} fill="url(#ovLeads)" isAnimationActive={false} />
                <Line yAxisId="r" type="monotone" dataKey="spend" stroke={CLAY_COLORS.slate} strokeWidth={2.4} strokeDasharray="4 3" dot={false} isAnimationActive={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </ClayInset>
        </ClayCard>
      </section>

      {/* Agency-only finance strip */}
      {role.seesInternalFinance && (
        <section>
          <SectionTitle sub="Only visible to the agency owner seat — hidden from account managers and the client view.">
            Account economics
          </SectionTitle>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Stat label="Monthly retainer" value={money(client.retainer)} foot="Recurring management fee" color={CLAY_COLORS.teal} />
            <Stat
              label="Managed spend"
              value={money(client.totalSpend)}
              foot="Pass-through ad budget"
              color={CLAY_COLORS.slate}
            />
            <Stat
              label="Gross margin"
              value={money(Math.round(client.retainer * 0.62))}
              foot="Est. after delivery cost"
              color={CLAY_COLORS.amber}
            />
            <Stat
              label="Cost per acquired job"
              value={money2(client.blendedCPL * 3.4)}
              foot="Assuming 29% lead→job"
              color={CLAY_COLORS.coral}
            />
          </div>
        </section>
      )}
    </div>
  )
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-2 text-xs font-medium text-[var(--ink-soft)]">
      <span className="w-3 h-3 rounded-full" style={{ background: color }} />
      {label}
    </span>
  )
}
