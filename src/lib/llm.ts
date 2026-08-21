/**
 * Optional live recommendations via OpenRouter (one key, many models).
 *
 * Called only when the user has saved a key. It runs entirely in the browser
 * against the user's own key; on any failure the caller falls back to the
 * built-in rule engine, so the feature degrades gracefully.
 */
import { metricsFor, pacing, type Account } from './data'
import type { Recommendation, RecCategory, RecPriority } from './recommend'

export interface ModelOption {
  id: string
  label: string
  vendor: string
}

/** A representative slice of what OpenRouter routes to. */
export const MODELS: ModelOption[] = [
  { id: 'anthropic/claude-3.5-sonnet', label: 'Claude 3.5 Sonnet', vendor: 'Anthropic' },
  { id: 'anthropic/claude-3.5-haiku', label: 'Claude 3.5 Haiku', vendor: 'Anthropic' },
  { id: 'openai/gpt-4o', label: 'GPT-4o', vendor: 'OpenAI' },
  { id: 'openai/gpt-4o-mini', label: 'GPT-4o mini', vendor: 'OpenAI' },
  { id: 'google/gemini-2.0-flash-001', label: 'Gemini 2.0 Flash', vendor: 'Google' },
  { id: 'qwen/qwen-2.5-72b-instruct', label: 'Qwen 2.5 72B', vendor: 'Qwen' },
  { id: 'moonshotai/kimi-k2', label: 'Kimi K2', vendor: 'Moonshot' },
  { id: 'deepseek/deepseek-chat', label: 'DeepSeek V3', vendor: 'DeepSeek' },
]

export interface AIConfig {
  key: string
  model: string
}

function accountBrief(a: Account) {
  const m = metricsFor(a, '30d')
  const p = pacing(a)
  return {
    account: a.name,
    trade: a.trade,
    last30: { leads: m.leads, leadsChangePct: +m.leadsDelta.toFixed(1), costPerLead: +m.cpl.toFixed(2), cplChangePct: +m.cplDelta.toFixed(1), spend: m.spend },
    budgetPacingPct: p.pct,
    monthlyBudget: a.budget,
    channels: {
      localServicesAds: { costPerLead: a.lsa.cpl, leads: a.lsa.leads, avgResponseMin: a.lsa.responseMins },
      googleAds: { costPerConversion: a.googleAds.costPerConv, conversions: a.googleAds.conversions, spend: a.googleAds.spend },
      metaAds: { costPerResult: a.meta.costPerResult, results: a.meta.results, spend: a.meta.spend },
    },
    googleProfile: { rating: a.gbp.rating, newReviews: a.gbp.reviewDelta },
    seo: { visibilityPct: a.semrush.visibility, gaining: a.semrush.gaining, losing: a.semrush.losing },
  }
}

const SYSTEM = `You are a senior paid-media strategist at a marketing agency for home-service businesses (HVAC, plumbing, roofing, pest control). Given one account's cross-channel numbers, return 3 to 5 specific, high-leverage recommendations, prioritising budget reallocation and spend efficiency. Respond with ONLY a JSON array, no prose. Each item: {"category": one of "budget"|"optimize"|"reputation"|"seo"|"ops", "priority": "high"|"medium"|"low", "title": short imperative, "rationale": one sentence, "impact": estimated outcome, "action": 2-4 word button label}.`

export async function generateLive(a: Account, cfg: AIConfig): Promise<Recommendation[]> {
  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${cfg.key}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': typeof location !== 'undefined' ? location.origin : 'https://reportbeacon.app',
      'X-Title': 'Reportbeacon',
    },
    body: JSON.stringify({
      model: cfg.model,
      temperature: 0.4,
      messages: [
        { role: 'system', content: SYSTEM },
        { role: 'user', content: JSON.stringify(accountBrief(a)) },
      ],
    }),
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`OpenRouter ${res.status}: ${text.slice(0, 140) || res.statusText}`)
  }
  const data = await res.json()
  const content: string = data?.choices?.[0]?.message?.content ?? ''
  const start = content.indexOf('[')
  const end = content.lastIndexOf(']')
  if (start === -1 || end === -1) throw new Error('Model did not return JSON')
  const parsed = JSON.parse(content.slice(start, end + 1)) as any[]
  const cats: RecCategory[] = ['budget', 'optimize', 'reputation', 'seo', 'ops']
  const pris: RecPriority[] = ['high', 'medium', 'low']
  return parsed.slice(0, 5).map((r, i) => ({
    id: `${a.id}-ai-${i}`,
    accountId: a.id,
    accountName: a.name,
    category: cats.includes(r.category) ? r.category : 'optimize',
    priority: pris.includes(r.priority) ? r.priority : 'medium',
    title: String(r.title ?? 'Recommendation'),
    rationale: String(r.rationale ?? ''),
    impact: String(r.impact ?? ''),
    action: String(r.action ?? 'Review'),
    source: 'model' as const,
  }))
}
