/**
 * Mock data for the client reporting dashboard demo.
 *
 * This is sales-demo data, not a real integration. Everything a viewer sees —
 * four fictional home-service clients across four trades, their blended
 * cross-platform metrics, and each platform's own KPIs — is invented here so
 * switching clients visibly changes every number on the page.
 *
 * Numbers are hand-tuned to look like real account performance (no round 100s
 * or 50s), and the four clients are deliberately different: one runs high lead
 * volume on a big budget, another is a lean single-van operation, one has a
 * standout review profile, one is climbing after a slow start. Small trend
 * series are generated from a seeded walk so sparklines look organic but never
 * shift between renders.
 */

// ---------------------------------------------------------------------------
// Roles — proves role-level access. Each role sees a different slice.
// ---------------------------------------------------------------------------

export type RoleId = 'admin' | 'manager' | 'client'

export interface Role {
  id: RoleId
  label: string
  /** One line describing what this seat can do, shown in the role switcher. */
  scope: string
  /** Sees agency-internal money (margin, blended agency spend, roster totals). */
  seesInternalFinance: boolean
  /** Can open and edit the report/presentation builder. */
  canBuildReports: boolean
  /** Locked to a single client instead of the whole roster. */
  singleClientOnly: boolean
  /** Which client this seat is pinned to, when singleClientOnly. */
  pinnedClientId?: string
}

export const ROLES: Role[] = [
  {
    id: 'admin',
    label: 'Agency Owner',
    scope: 'Full roster, spend, margin & report builder',
    seesInternalFinance: true,
    canBuildReports: true,
    singleClientOnly: false,
  },
  {
    id: 'manager',
    label: 'Account Manager',
    scope: 'Full roster & report builder, no agency margin',
    seesInternalFinance: false,
    canBuildReports: true,
    singleClientOnly: false,
  },
  {
    id: 'client',
    label: 'Client View',
    scope: 'One account, read-only — what the client sees',
    seesInternalFinance: false,
    canBuildReports: false,
    singleClientOnly: true,
    pinnedClientId: 'summit-air',
  },
]

// ---------------------------------------------------------------------------
// Seeded series generator — stable across renders.
// ---------------------------------------------------------------------------

function seeded(seed: number): () => number {
  let s = seed % 2147483647
  if (s <= 0) s += 2147483646
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

/** A gently drifting series of `n` points around `base`, trending by `slope`. */
function walk(seed: number, n: number, base: number, spread: number, slope = 0): number[] {
  const rnd = seeded(seed)
  const out: number[] = []
  let v = base
  for (let i = 0; i < n; i++) {
    v += (rnd() - 0.5) * spread + slope
    out.push(Math.max(0, Math.round(v * 10) / 10))
  }
  return out
}

// ---------------------------------------------------------------------------
// Platforms — the "connected sources" row.
// ---------------------------------------------------------------------------

export type PlatformId = 'lsa' | 'google-ads' | 'gbp' | 'meta' | 'semrush'

export interface PlatformMeta {
  id: PlatformId
  name: string
  short: string
}

export const PLATFORMS: PlatformMeta[] = [
  { id: 'lsa', name: 'Local Services Ads', short: 'LSA' },
  { id: 'google-ads', name: 'Google Ads', short: 'Ads' },
  { id: 'gbp', name: 'Google Business Profile', short: 'GBP' },
  { id: 'meta', name: 'Meta Ads', short: 'Meta' },
  { id: 'semrush', name: 'SEMrush', short: 'SEO' },
]

export type SourceStatus = 'live' | 'syncing' | 'attention'

// ---------------------------------------------------------------------------
// Client shape
// ---------------------------------------------------------------------------

export interface KeywordMove {
  term: string
  from: number
  to: number
}

export interface Client {
  id: string
  name: string
  trade: 'HVAC' | 'Plumbing' | 'Roofing' | 'Pest Control'
  location: string
  /** Two-letter mark for the neumorphic avatar tile. */
  mark: string
  /** Month label the numbers describe. */
  period: string

  // Blended overview (across LSA + Google Ads + Meta)
  blendedLeads: number
  blendedLeadsDelta: number
  blendedCPL: number
  blendedCPLDelta: number
  totalSpend: number
  totalSpendDelta: number
  /** Agency retainer — only revealed to the finance-seeing roles. */
  retainer: number
  /** Blended leads over the last 8 weeks, for the overview trend. */
  leadsSeries: number[]
  /** Blended spend over the last 8 weeks. */
  spendSeries: number[]

  sources: Record<PlatformId, SourceStatus>

  // Local Services Ads
  lsaLeads: number
  lsaCPL: number
  lsaGuaranteed: boolean
  lsaResponseMins: number
  lsaSeries: number[]

  // Google Ads
  adsSpend: number
  adsClicks: number
  adsConversions: number
  adsCostPerConv: number
  adsSeries: number[]

  // Google Business Profile
  gbpRating: number
  gbpReviews: number
  gbpReviewDelta: number
  gbpViews: number
  gbpDirections: number
  gbpRatingSeries: number[]

  // Meta Ads
  metaSpend: number
  metaResults: number
  metaCostPerResult: number
  metaReach: number
  metaSeries: number[]

  // SEMrush
  semKeywords: number
  semVisibility: number
  semVisibilityDelta: number
  semVisibilitySeries: number[]
  semGaining: KeywordMove[]
  semLosing: KeywordMove[]
}

const PERIOD = 'August 2025'

export const CLIENTS: Client[] = [
  {
    id: 'summit-air',
    name: 'Summit Air & Heating',
    trade: 'HVAC',
    location: 'Phoenix, AZ',
    mark: 'SA',
    period: PERIOD,
    blendedLeads: 342,
    blendedLeadsDelta: 12.4,
    blendedCPL: 41.18,
    blendedCPLDelta: -6.2,
    totalSpend: 14086,
    totalSpendDelta: 5.1,
    retainer: 3200,
    leadsSeries: walk(11, 8, 74, 14, 2.4),
    spendSeries: walk(12, 8, 1680, 220, 20),
    sources: { lsa: 'live', 'google-ads': 'live', gbp: 'live', meta: 'live', semrush: 'live' },
    lsaLeads: 148,
    lsaCPL: 32.4,
    lsaGuaranteed: true,
    lsaResponseMins: 3.2,
    lsaSeries: walk(13, 8, 33, 6, 0.6),
    adsSpend: 8420,
    adsClicks: 2914,
    adsConversions: 121,
    adsCostPerConv: 69.6,
    adsSeries: walk(14, 8, 26, 5, 0.5),
    gbpRating: 4.8,
    gbpReviews: 612,
    gbpReviewDelta: 23,
    gbpViews: 18240,
    gbpDirections: 486,
    gbpRatingSeries: walk(15, 8, 4.6, 0.08, 0.02),
    metaSpend: 3240,
    metaResults: 73,
    metaCostPerResult: 44.4,
    metaReach: 41200,
    metaSeries: walk(16, 8, 16, 4, 0.4),
    semKeywords: 214,
    semVisibility: 38.6,
    semVisibilityDelta: 4.1,
    semVisibilitySeries: walk(17, 8, 31, 2.2, 1.0),
    semGaining: [
      { term: 'emergency ac repair phoenix', from: 14, to: 4 },
      { term: 'hvac tune up near me', from: 9, to: 3 },
      { term: 'ac installation cost az', from: 22, to: 12 },
    ],
    semLosing: [
      { term: 'furnace repair phoenix', from: 6, to: 11 },
      { term: 'ductless mini split install', from: 8, to: 13 },
    ],
  },
  {
    id: 'riverrun-plumbing',
    name: 'RiverRun Plumbing Co.',
    trade: 'Plumbing',
    location: 'Austin, TX',
    mark: 'RP',
    period: PERIOD,
    blendedLeads: 129,
    blendedLeadsDelta: -3.8,
    blendedCPL: 58.72,
    blendedCPLDelta: 8.4,
    totalSpend: 6390,
    totalSpendDelta: -2.2,
    retainer: 1750,
    leadsSeries: walk(21, 8, 34, 9, -0.8),
    spendSeries: walk(22, 8, 820, 130, -6),
    sources: { lsa: 'live', 'google-ads': 'live', gbp: 'live', meta: 'attention', semrush: 'live' },
    lsaLeads: 61,
    lsaCPL: 46.9,
    lsaGuaranteed: true,
    lsaResponseMins: 6.8,
    lsaSeries: walk(23, 8, 15, 4, -0.2),
    adsSpend: 3980,
    adsClicks: 1247,
    adsConversions: 44,
    adsCostPerConv: 90.5,
    adsSeries: walk(24, 8, 11, 3, -0.3),
    gbpRating: 4.5,
    gbpReviews: 208,
    gbpReviewDelta: 6,
    gbpViews: 7420,
    gbpDirections: 173,
    gbpRatingSeries: walk(25, 8, 4.5, 0.06, 0.0),
    metaSpend: 1160,
    metaResults: 19,
    metaCostPerResult: 61.1,
    metaReach: 14800,
    metaSeries: walk(26, 8, 5, 2.4, -0.2),
    semKeywords: 96,
    semVisibility: 21.3,
    semVisibilityDelta: -1.6,
    semVisibilitySeries: walk(27, 8, 24, 1.8, -0.5),
    semGaining: [
      { term: 'tankless water heater austin', from: 19, to: 9 },
      { term: 'slab leak detection', from: 15, to: 8 },
    ],
    semLosing: [
      { term: 'drain cleaning austin', from: 4, to: 9 },
      { term: 'emergency plumber near me', from: 7, to: 14 },
      { term: 'water heater repair', from: 5, to: 10 },
    ],
  },
  {
    id: 'ironclad-roofing',
    name: 'Ironclad Roofing',
    trade: 'Roofing',
    location: 'Denver, CO',
    mark: 'IR',
    period: PERIOD,
    blendedLeads: 87,
    blendedLeadsDelta: 31.2,
    blendedCPL: 112.4,
    blendedCPLDelta: -14.8,
    totalSpend: 9780,
    totalSpendDelta: 18.6,
    retainer: 2600,
    leadsSeries: walk(31, 8, 16, 6, 2.0),
    spendSeries: walk(32, 8, 1010, 190, 34),
    sources: { lsa: 'attention', 'google-ads': 'live', gbp: 'live', meta: 'live', semrush: 'syncing' },
    lsaLeads: 24,
    lsaCPL: 128.6,
    lsaGuaranteed: false,
    lsaResponseMins: 11.4,
    lsaSeries: walk(33, 8, 5, 2, 0.3),
    adsSpend: 6820,
    adsClicks: 1583,
    adsConversions: 38,
    adsCostPerConv: 179.5,
    adsSeries: walk(34, 8, 8, 3, 0.6),
    gbpRating: 4.9,
    gbpReviews: 341,
    gbpReviewDelta: 18,
    gbpViews: 11960,
    gbpDirections: 214,
    gbpRatingSeries: walk(35, 8, 4.7, 0.05, 0.03),
    metaSpend: 2960,
    metaResults: 31,
    metaCostPerResult: 95.5,
    metaReach: 28400,
    metaSeries: walk(36, 8, 6, 2.6, 0.5),
    semKeywords: 143,
    semVisibility: 29.8,
    semVisibilityDelta: 6.7,
    semVisibilitySeries: walk(37, 8, 21, 2.4, 1.4),
    semGaining: [
      { term: 'hail damage roof repair denver', from: 17, to: 5 },
      { term: 'metal roof installation colorado', from: 24, to: 11 },
      { term: 'roof replacement cost denver', from: 12, to: 6 },
    ],
    semLosing: [{ term: 'gutter installation denver', from: 9, to: 15 }],
  },
  {
    id: 'greenshield-pest',
    name: 'GreenShield Pest Control',
    trade: 'Pest Control',
    location: 'Orlando, FL',
    mark: 'GS',
    period: PERIOD,
    blendedLeads: 268,
    blendedLeadsDelta: 7.9,
    blendedCPL: 27.94,
    blendedCPLDelta: -3.1,
    totalSpend: 7488,
    totalSpendDelta: 4.4,
    retainer: 2100,
    leadsSeries: walk(41, 8, 58, 11, 1.4),
    spendSeries: walk(42, 8, 900, 140, 12),
    sources: { lsa: 'live', 'google-ads': 'live', gbp: 'live', meta: 'live', semrush: 'live' },
    lsaLeads: 132,
    lsaCPL: 21.8,
    lsaGuaranteed: true,
    lsaResponseMins: 2.4,
    lsaSeries: walk(43, 8, 30, 5, 0.4),
    adsSpend: 4020,
    adsClicks: 2361,
    adsConversions: 96,
    adsCostPerConv: 41.9,
    adsSeries: walk(44, 8, 21, 4, 0.5),
    gbpRating: 4.7,
    gbpReviews: 489,
    gbpReviewDelta: 31,
    gbpViews: 14720,
    gbpDirections: 302,
    gbpRatingSeries: walk(45, 8, 4.6, 0.05, 0.01),
    metaSpend: 1980,
    metaResults: 58,
    metaCostPerResult: 34.1,
    metaReach: 33600,
    metaSeries: walk(46, 8, 13, 3, 0.3),
    semKeywords: 178,
    semVisibility: 34.2,
    semVisibilityDelta: 2.3,
    semVisibilitySeries: walk(47, 8, 30, 2.0, 0.6),
    semGaining: [
      { term: 'mosquito control orlando', from: 11, to: 4 },
      { term: 'termite inspection near me', from: 16, to: 8 },
    ],
    semLosing: [
      { term: 'bed bug treatment orlando', from: 6, to: 10 },
      { term: 'rodent removal', from: 7, to: 12 },
    ],
  },
]

export function getClient(id: string): Client {
  return CLIENTS.find((c) => c.id === id) ?? CLIENTS[0]
}

export const DATE_RANGES = [
  'Last 7 days',
  'Last 30 days',
  'This month',
  'Last month',
  'Last 90 days',
] as const
export type DateRange = (typeof DATE_RANGES)[number]
