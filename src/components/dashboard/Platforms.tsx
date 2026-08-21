/** Per-platform breakdown tab — one panel per connected source. */
import { useState } from 'react'
import { ShieldCheck, Timer, TrendingUp, TrendingDown } from 'lucide-react'
import type { Client, PlatformId } from '@/lib/dashboardData'
import { PLATFORMS } from '@/lib/dashboardData'
import { money, money2, num, compact } from '@/lib/dashboardFormat'
import { ClayCard, ClayInset, ClaySegmented, Stat, Sparkline, StatusLED, SectionTitle, CLAY_COLORS } from './Clay'

export default function Platforms({ client }: { client: Client }) {
  const [tab, setTab] = useState<PlatformId>('lsa')

  return (
    <div className="flex flex-col gap-5">
      <div className="overflow-x-auto clay-scroll -mx-1 px-1 pb-1">
        <ClaySegmented
          value={tab}
          onChange={setTab}
          options={PLATFORMS.map((p) => ({
            value: p.id,
            label: (
              <span className="flex items-center gap-1.5 whitespace-nowrap">
                <StatusLED status={client.sources[p.id]} />
                {p.name}
              </span>
            ),
          }))}
        />
      </div>

      {tab === 'lsa' && <LSA client={client} />}
      {tab === 'google-ads' && <GoogleAds client={client} />}
      {tab === 'gbp' && <GBP client={client} />}
      {tab === 'meta' && <Meta client={client} />}
      {tab === 'semrush' && <SEMrush client={client} />}
    </div>
  )
}

function PanelHead({ title, sub }: { title: string; sub: string }) {
  return <SectionTitle sub={sub}>{title}</SectionTitle>
}

function LSA({ client }: { client: Client }) {
  return (
    <section>
      <PanelHead title="Local Services Ads" sub="Pay-per-lead placements at the very top of Google Search." />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat label="Leads" value={num(client.lsaLeads)} series={client.lsaSeries} color={CLAY_COLORS.amber} foot="Booked & messaged" />
        <Stat label="Cost / lead" value={money2(client.lsaCPL)} lowerIsBetter color={CLAY_COLORS.teal} foot="Charged per valid lead" />
        <ClayCard small className="p-4 flex flex-col gap-2.5">
          <span className="text-xs font-medium text-[var(--ink-soft)] uppercase tracking-wide">Google Guaranteed</span>
          <div className="flex items-center gap-2 mt-1">
            <ShieldCheck size={26} style={{ color: client.lsaGuaranteed ? CLAY_COLORS.teal : CLAY_COLORS.coral }} />
            <span className="font-display text-lg font-semibold text-[var(--ink)]">
              {client.lsaGuaranteed ? 'Verified' : 'Pending'}
            </span>
          </div>
          <span className="text-xs text-[var(--ink-faint)]">
            {client.lsaGuaranteed ? 'Badge live on all placements' : 'Background check in review'}
          </span>
        </ClayCard>
        <ClayCard small className="p-4 flex flex-col gap-2.5">
          <span className="text-xs font-medium text-[var(--ink-soft)] uppercase tracking-wide">Avg response time</span>
          <div className="flex items-center gap-2 mt-1">
            <Timer size={22} style={{ color: client.lsaResponseMins < 5 ? CLAY_COLORS.teal : CLAY_COLORS.amber }} />
            <span className="font-num text-[26px] leading-none font-semibold text-[var(--ink)]">
              {client.lsaResponseMins.toFixed(1)}
            </span>
            <span className="text-xs text-[var(--ink-faint)] mb-0.5">min</span>
          </div>
          <span className="text-xs text-[var(--ink-faint)]">
            {client.lsaResponseMins < 5 ? 'Fast — protects lead ranking' : 'Slower than target of 5 min'}
          </span>
        </ClayCard>
      </div>
    </section>
  )
}

function GoogleAds({ client }: { client: Client }) {
  return (
    <section>
      <PanelHead title="Google Ads" sub="Search and Performance Max campaigns across the service area." />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat label="Spend" value={money(client.adsSpend)} lowerIsBetter series={client.adsSeries} bars color={CLAY_COLORS.slate} foot="This month" />
        <Stat label="Clicks" value={compact(client.adsClicks)} series={client.adsSeries} color={CLAY_COLORS.amber} foot={`${(client.adsClicks / 30).toFixed(0)}/day avg`} />
        <Stat label="Conversions" value={num(client.adsConversions)} series={client.adsSeries} color={CLAY_COLORS.teal} foot="Calls & form fills" />
        <Stat label="Cost / conversion" value={money2(client.adsCostPerConv)} lowerIsBetter color={CLAY_COLORS.coral} foot={`${((client.adsConversions / client.adsClicks) * 100).toFixed(1)}% conv. rate`} />
      </div>
    </section>
  )
}

function GBP({ client }: { client: Client }) {
  return (
    <section>
      <PanelHead title="Google Business Profile" sub="The map listing — reviews, visibility and the actions customers take." />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat label="Rating" value={client.gbpRating.toFixed(1)} series={client.gbpRatingSeries} color={CLAY_COLORS.amber} foot="Out of 5.0" />
        <Stat label="Reviews" value={num(client.gbpReviews)} color={CLAY_COLORS.teal} foot={`+${client.gbpReviewDelta} this month`} />
        <Stat label="Profile views" value={compact(client.gbpViews)} color={CLAY_COLORS.slate} foot="Search + Maps" />
        <Stat label="Direction requests" value={num(client.gbpDirections)} color={CLAY_COLORS.amber} foot="High-intent actions" />
      </div>
    </section>
  )
}

function Meta({ client }: { client: Client }) {
  return (
    <section>
      <PanelHead title="Meta Ads" sub="Facebook and Instagram lead campaigns and retargeting." />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat label="Spend" value={money(client.metaSpend)} lowerIsBetter series={client.metaSeries} bars color={CLAY_COLORS.slate} foot="This month" />
        <Stat label="Results" value={num(client.metaResults)} series={client.metaSeries} color={CLAY_COLORS.amber} foot="Leads generated" />
        <Stat label="Cost / result" value={money2(client.metaCostPerResult)} lowerIsBetter color={CLAY_COLORS.teal} foot="Per lead" />
        <Stat label="Reach" value={compact(client.metaReach)} color={CLAY_COLORS.coral} foot="Unique people" />
      </div>
    </section>
  )
}

function SEMrush({ client }: { client: Client }) {
  return (
    <section>
      <PanelHead title="SEMrush" sub="Organic keyword tracking and search visibility." />
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-5">
        <Stat label="Keywords tracked" value={num(client.semKeywords)} color={CLAY_COLORS.slate} foot="In the local market" />
        <Stat
          label="Visibility score"
          value={client.semVisibility.toFixed(1) + '%'}
          delta={client.semVisibilityDelta}
          series={client.semVisibilitySeries}
          color={CLAY_COLORS.amber}
          foot="Share of top-20 rankings"
        />
        <ClayCard small className="p-4 flex flex-col gap-2.5">
          <span className="text-xs font-medium text-[var(--ink-soft)] uppercase tracking-wide">Trend</span>
          <ClayInset small className="px-2 pt-1 pb-0.5 mt-auto">
            <Sparkline data={client.semVisibilitySeries} color={CLAY_COLORS.teal} height={52} />
          </ClayInset>
        </ClayCard>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <MoverCard title="Top gaining keywords" moves={client.semGaining} gaining />
        <MoverCard title="Losing ground" moves={client.semLosing} gaining={false} />
      </div>
    </section>
  )
}

function MoverCard({
  title,
  moves,
  gaining,
}: {
  title: string
  moves: { term: string; from: number; to: number }[]
  gaining: boolean
}) {
  const color = gaining ? CLAY_COLORS.teal : CLAY_COLORS.coral
  const Icon = gaining ? TrendingUp : TrendingDown
  return (
    <ClayCard className="p-5">
      <div className="flex items-center gap-2 mb-3">
        <Icon size={16} style={{ color }} />
        <h3 className="font-display text-sm font-semibold text-[var(--ink)]">{title}</h3>
      </div>
      <div className="flex flex-col gap-2">
        {moves.map((m) => (
          <ClayInset key={m.term} small className="px-3.5 py-2.5 flex items-center justify-between gap-3">
            <span className="text-sm text-[var(--ink)] truncate">{m.term}</span>
            <span className="font-num text-xs flex items-center gap-1.5 flex-none text-[var(--ink-faint)]">
              #{m.from}
              <span style={{ color }}>→</span>
              <span className="font-semibold" style={{ color }}>
                #{m.to}
              </span>
            </span>
          </ClayInset>
        ))}
      </div>
    </ClayCard>
  )
}
