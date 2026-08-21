/**
 * Presentation mode — a fullscreen, client-facing slide deck assembled from
 * the live dashboard data. This is what the agency steps through on a call,
 * or exports as the branded report. Arrow keys / on-screen controls navigate;
 * Escape exits.
 */
import { useCallback, useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
  LabelList,
} from 'recharts'
import { ChevronLeft, ChevronRight, X, Star, Sparkles } from 'lucide-react'
import type { Client } from '@/lib/dashboardData'
import { money, money2, num, compact } from '@/lib/dashboardFormat'
import { CLAY_COLORS } from './Clay'

export type SectionKey = 'headline' | 'channels' | 'google' | 'search' | 'summary'

export const SECTION_LABELS: { key: SectionKey; label: string; hint: string }[] = [
  { key: 'headline', label: 'Headline results', hint: 'Leads, cost per lead, spend' },
  { key: 'channels', label: 'Where leads came from', hint: 'Channel-by-channel mix' },
  { key: 'google', label: 'Google presence', hint: 'Reviews, rating, map actions' },
  { key: 'search', label: 'Search visibility', hint: 'Keyword movement (SEMrush)' },
  { key: 'summary', label: 'Summary & next steps', hint: 'Closing slide' },
]

interface Slide {
  kicker: string
  title: string
  body: React.ReactNode
}

function buildSlides(client: Client, sections: SectionKey[], agency: string, range: string): Slide[] {
  const slides: Slide[] = []

  // Cover — always present
  slides.push({
    kicker: agency,
    title: 'Performance Report',
    body: (
      <div className="flex flex-col items-center gap-6 text-center">
        <div className="w-20 h-20 rounded-[24px] clay grid place-items-center">
          <span className="font-display text-2xl font-bold text-[var(--amber-deep)]">{client.mark}</span>
        </div>
        <div>
          <div className="font-display text-3xl md:text-5xl font-bold text-[var(--ink)]">{client.name}</div>
          <div className="text-[var(--ink-soft)] mt-2 text-lg">{client.trade} · {client.location}</div>
        </div>
        <div className="clay-inset px-6 py-3 text-sm text-[var(--ink-soft)]">
          {client.period} · {range}
        </div>
      </div>
    ),
  })

  if (sections.includes('headline')) {
    slides.push({
      kicker: 'The month in three numbers',
      title: 'Headline results',
      body: (
        <div className="grid md:grid-cols-3 gap-6 w-full max-w-4xl">
          <BigStat label="New leads" value={num(client.blendedLeads)} delta={client.blendedLeadsDelta} />
          <BigStat label="Cost per lead" value={money2(client.blendedCPL)} delta={client.blendedCPLDelta} lowerIsBetter />
          <BigStat label="Total ad spend" value={money(client.totalSpend)} delta={client.totalSpendDelta} lowerIsBetter />
        </div>
      ),
    })
  }

  if (sections.includes('channels')) {
    const data = [
      { name: 'Local Services Ads', leads: client.lsaLeads, fill: CLAY_COLORS.amber },
      { name: 'Google Ads', leads: client.adsConversions, fill: CLAY_COLORS.slate },
      { name: 'Meta Ads', leads: client.metaResults, fill: CLAY_COLORS.teal },
    ]
    slides.push({
      kicker: 'Every paid channel, one view',
      title: 'Where your leads came from',
      body: (
        <div className="w-full max-w-3xl clay-inset p-6">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={data} layout="vertical" margin={{ left: 10, right: 40 }}>
              <XAxis type="number" hide />
              <YAxis type="category" dataKey="name" width={150} tick={{ fontSize: 14, fill: '#34333c' }} axisLine={false} tickLine={false} />
              <Bar dataKey="leads" radius={[6, 6, 6, 6]} isAnimationActive={false} barSize={34}>
                {data.map((d, i) => (
                  <Cell key={i} fill={d.fill} />
                ))}
                <LabelList dataKey="leads" position="right" style={{ fill: '#34333c', fontSize: 15, fontWeight: 600 }} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      ),
    })
  }

  if (sections.includes('google')) {
    slides.push({
      kicker: 'Your reputation on the map',
      title: 'Google Business Profile',
      body: (
        <div className="grid md:grid-cols-2 gap-6 w-full max-w-4xl">
          <div className="clay p-8 flex flex-col items-center gap-2">
            <div className="flex items-center gap-2">
              <span className="font-num text-6xl font-bold text-[var(--ink)]">{client.gbpRating.toFixed(1)}</span>
              <Star size={38} className="fill-[#ec8a3c] text-[#ec8a3c]" />
            </div>
            <div className="text-[var(--ink-soft)]">{num(client.gbpReviews)} reviews · +{client.gbpReviewDelta} this month</div>
          </div>
          <div className="grid grid-rows-2 gap-6">
            <BigStat label="Profile views" value={compact(client.gbpViews)} />
            <BigStat label="Direction requests" value={num(client.gbpDirections)} />
          </div>
        </div>
      ),
    })
  }

  if (sections.includes('search')) {
    slides.push({
      kicker: 'Organic search visibility',
      title: 'Getting found on Google',
      body: (
        <div className="w-full max-w-4xl grid md:grid-cols-2 gap-6">
          <BigStat label="Visibility score" value={client.semVisibility.toFixed(1) + '%'} delta={client.semVisibilityDelta} />
          <div className="clay p-6">
            <div className="text-sm font-semibold text-[var(--ink)] mb-3">Biggest climbers</div>
            <div className="flex flex-col gap-2">
              {client.semGaining.slice(0, 3).map((m) => (
                <div key={m.term} className="clay-inset px-4 py-2.5 flex items-center justify-between gap-3">
                  <span className="text-sm text-[var(--ink)] truncate">{m.term}</span>
                  <span className="font-num text-xs font-semibold flex-none" style={{ color: CLAY_COLORS.teal }}>
                    #{m.from} → #{m.to}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ),
    })
  }

  if (sections.includes('summary')) {
    slides.push({
      kicker: 'The takeaway',
      title: 'Summary & what we are doing next',
      body: (
        <div className="w-full max-w-3xl flex flex-col gap-4">
          {[
            `${client.blendedLeads} leads at ${money2(client.blendedCPL)} each — ${client.blendedLeadsDelta > 0 ? 'up' : 'down'} ${Math.abs(client.blendedLeadsDelta)}% on last month.`,
            `Google Guaranteed ${client.lsaGuaranteed ? 'is live and protecting your top-of-page LSA placement' : 'verification is in progress to unlock top placement'}.`,
            `Your ${client.gbpRating.toFixed(1)}★ profile earned ${client.gbpReviewDelta} new reviews and drove ${num(client.gbpDirections)} direction requests.`,
            `Next month: shift budget toward the channels with the lowest cost per lead and push the climbing keywords onto page one.`,
          ].map((line, i) => (
            <div key={i} className="clay-inset px-6 py-4 flex items-start gap-3">
              <span className="clay-sm w-7 h-7 rounded-full grid place-items-center flex-none font-num text-sm font-semibold text-[var(--amber-deep)]">
                {i + 1}
              </span>
              <span className="text-lg text-[var(--ink)]">{line}</span>
            </div>
          ))}
        </div>
      ),
    })
  }

  return slides
}

function BigStat({
  label,
  value,
  delta,
  lowerIsBetter = false,
}: {
  label: string
  value: string
  delta?: number
  lowerIsBetter?: boolean
}) {
  const good = delta === undefined ? true : (lowerIsBetter ? delta < 0 : delta > 0)
  return (
    <div className="clay p-8 flex flex-col gap-1 items-center text-center">
      <span className="text-sm font-medium text-[var(--ink-soft)] uppercase tracking-wide">{label}</span>
      <span className="font-num text-5xl font-bold text-[var(--ink)]">{value}</span>
      {delta !== undefined && (
        <span className="font-num text-sm font-semibold" style={{ color: good ? CLAY_COLORS.teal : CLAY_COLORS.coral }}>
          {delta > 0 ? '▲' : '▼'} {Math.abs(delta)}% vs last month
        </span>
      )}
    </div>
  )
}

export default function Presentation({
  client,
  sections,
  agency,
  range,
  onClose,
}: {
  client: Client
  sections: SectionKey[]
  agency: string
  range: string
  onClose: () => void
}) {
  const slides = useMemo(() => buildSlides(client, sections, agency, range), [client, sections, agency, range])
  const [i, setI] = useState(0)
  const clamp = useCallback((n: number) => Math.max(0, Math.min(slides.length - 1, n)), [slides.length])

  const go = useCallback((d: number) => setI((cur) => clamp(cur + d)), [clamp])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'ArrowRight' || e.key === ' ') go(1)
      else if (e.key === 'ArrowLeft') go(-1)
      else if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [go, onClose])

  const slide = slides[i]

  return createPortal(
    <div className="clay-root fixed inset-0 z-[100] flex flex-col" style={{ background: 'var(--ground)' }}>
      {/* Top bar */}
      <div className="flex items-center justify-between px-5 md:px-8 py-4">
        <div className="flex items-center gap-2 text-sm font-medium text-[var(--ink-soft)]">
          <Sparkles size={15} style={{ color: CLAY_COLORS.amber }} />
          Presenting · {client.name}
        </div>
        <button onClick={onClose} className="clay-btn w-10 h-10 grid place-items-center rounded-full" title="Exit (Esc)">
          <X size={18} />
        </button>
      </div>

      {/* Slide */}
      <div className="flex-1 flex flex-col items-center justify-center px-5 md:px-10 overflow-y-auto clay-scroll">
        <div key={i} className="slide-enter w-full flex flex-col items-center gap-8 py-6">
          <div className="text-center">
            <div className="text-sm font-medium uppercase tracking-widest mb-2" style={{ color: CLAY_COLORS.amber }}>
              {slide.kicker}
            </div>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-[var(--ink)]">{slide.title}</h2>
          </div>
          <div className="w-full flex justify-center">{slide.body}</div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between px-5 md:px-8 py-5">
        <button
          onClick={() => go(-1)}
          disabled={i === 0}
          className="clay-btn w-12 h-12 grid place-items-center rounded-full disabled:opacity-30"
        >
          <ChevronLeft size={20} />
        </button>
        <div className="flex items-center gap-2">
          {slides.map((_, n) => (
            <button
              key={n}
              onClick={() => setI(n)}
              className="transition-all rounded-full"
              style={{
                width: n === i ? 26 : 9,
                height: 9,
                background: n === i ? CLAY_COLORS.amber : 'var(--lo)',
              }}
              aria-label={`Slide ${n + 1}`}
            />
          ))}
        </div>
        <button
          onClick={() => go(1)}
          disabled={i === slides.length - 1}
          className="clay-btn-amber w-12 h-12 grid place-items-center rounded-full disabled:opacity-40"
        >
          <ChevronRight size={20} />
        </button>
      </div>
    </div>,
    document.body,
  )
}
