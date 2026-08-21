/**
 * Rule-based recommendation engine. Produces budget and optimization
 * suggestions from an account's own numbers. This is the guaranteed path; an
 * optional live model (see llm.ts) can rewrite these into richer prose, but
 * the heuristics here always run so the console is useful with no key.
 */
import { metricsFor, pacing, health, type Account } from './data'
import { money, money2, num } from './format'

export type RecCategory = 'budget' | 'optimize' | 'reputation' | 'seo' | 'ops'
export type RecPriority = 'high' | 'medium' | 'low'

export interface Recommendation {
  id: string
  accountId: string
  accountName: string
  category: RecCategory
  priority: RecPriority
  title: string
  rationale: string
  impact: string
  action: string
  /** 'model' when written by a live LLM, otherwise the built-in engine. */
  source?: 'rule' | 'model'
}

export const CATEGORY_LABEL: Record<RecCategory, string> = {
  budget: 'Budget', optimize: 'Optimization', reputation: 'Reputation', seo: 'Search', ops: 'Operations',
}

interface Channel { name: string; cpl: number; spend: number; leads: number }

function channels(a: Account): Channel[] {
  return [
    { name: 'Local Services Ads', cpl: a.lsa.cpl, spend: Math.round(a.lsa.leads * a.lsa.cpl), leads: a.lsa.leads },
    { name: 'Google Ads', cpl: a.googleAds.costPerConv, spend: a.googleAds.spend, leads: a.googleAds.conversions },
    { name: 'Meta Ads', cpl: a.meta.costPerResult, spend: a.meta.spend, leads: a.meta.results },
  ]
}

/** Concrete "move $X from the worst channel to the best" plan. */
export interface BudgetPlan {
  from: string
  to: string
  amount: number
  extraLeads: number
  newBlendedCpl: number
  currentBlendedCpl: number
}

export function budgetPlan(a: Account): BudgetPlan | null {
  const ch = channels(a).filter((c) => c.leads > 0)
  if (ch.length < 2) return null
  const best = ch.reduce((m, c) => (c.cpl < m.cpl ? c : m))
  const worst = ch.reduce((m, c) => (c.cpl > m.cpl ? c : m))
  if (best.name === worst.name || worst.cpl < best.cpl * 1.25) return null
  const amount = Math.round((worst.spend * 0.15) / 10) * 10
  const leadsLost = amount / worst.cpl
  const leadsGained = amount / best.cpl
  const extraLeads = Math.round(leadsGained - leadsLost)
  const totalSpend = ch.reduce((s, c) => s + c.spend, 0)
  const totalLeads = ch.reduce((s, c) => s + c.leads, 0)
  const newLeads = totalLeads + extraLeads
  return {
    from: worst.name, to: best.name, amount, extraLeads,
    currentBlendedCpl: totalSpend / totalLeads,
    newBlendedCpl: totalSpend / newLeads,
  }
}

export function recommendationsFor(a: Account): Recommendation[] {
  const out: Recommendation[] = []
  const m = metricsFor(a, '30d')
  const p = pacing(a)
  const push = (r: Omit<Recommendation, 'accountId' | 'accountName' | 'id'>, key: string) =>
    out.push({ ...r, accountId: a.id, accountName: a.name, id: `${a.id}-${key}` })

  const plan = budgetPlan(a)
  if (plan) {
    push({
      category: 'budget', priority: 'high',
      title: `Shift ${money(plan.amount)} from ${plan.from} to ${plan.to}`,
      rationale: `${plan.from} is the most expensive channel per lead; ${plan.to} is the cheapest. Moving spend at the same total budget buys cheaper leads.`,
      impact: `~${plan.extraLeads} more leads / mo · blended CPL ${money2(plan.currentBlendedCpl)} → ${money2(plan.newBlendedCpl)}`,
      action: 'Draft reallocation',
    }, 'budget')
  }

  if (p.pct > 100) {
    push({
      category: 'budget', priority: p.pct > 112 ? 'high' : 'medium',
      title: `Cap pacing before month end`,
      rationale: `Spend is at ${p.pct}% of the ${money(p.budget)} budget with time left in the month. Left alone it overshoots.`,
      impact: `Avoid ~${money(Math.round(p.mtd * (p.pct - 100) / 100))} of overspend`,
      action: 'Adjust daily caps',
    }, 'pace')
  } else if (p.pct < 82 && health(a) !== 'risk') {
    push({
      category: 'budget', priority: 'low',
      title: `Room to scale spend`,
      rationale: `Only ${p.pct}% of budget is deployed and performance is healthy. There is headroom to capture more demand.`,
      impact: `~${num(Math.round((m.leads * (95 - p.pct)) / 100))} additional leads if scaled to 95%`,
      action: 'Raise budget',
    }, 'scale')
  }

  if (a.lsa.responseMins > 5) {
    push({
      category: 'ops', priority: a.lsa.responseMins > 10 ? 'high' : 'medium',
      title: `Cut LSA response time to under 5 min`,
      rationale: `Average response is ${a.lsa.responseMins.toFixed(1)} min. Google ranks fast responders higher and slow replies lose booked jobs.`,
      impact: `Protects top LSA placement and lead-to-job rate`,
      action: 'Enable auto-reply',
    }, 'resp')
  }

  if (m.cplDelta > 5) {
    push({
      category: 'optimize', priority: 'medium',
      title: `Investigate rising cost per lead`,
      rationale: `Blended CPL is up ${m.cplDelta.toFixed(1)}% month over month. Usually a few broad Google Ads search terms are the cause.`,
      impact: `Add negatives to claw back the ${m.cplDelta.toFixed(1)}% increase`,
      action: 'Review search terms',
    }, 'cpl')
  }

  if (a.gbp.rating < 4.7 || a.gbp.reviewDelta < 10) {
    push({
      category: 'reputation', priority: 'low',
      title: `Push a review request campaign`,
      rationale: `Rating is ${a.gbp.rating.toFixed(1)} with ${a.gbp.reviewDelta} new reviews this month. More recent 5-star reviews lift map ranking and LSA trust.`,
      impact: `Higher map pack ranking and click-through`,
      action: 'Queue SMS asks',
    }, 'rep')
  }

  if (a.semrush.gaining.length) {
    const top = a.semrush.gaining[0]
    push({
      category: 'seo', priority: 'low',
      title: `Push "${top.term}" onto page one`,
      rationale: `It moved from #${top.from} to #${top.to}. A content refresh and a few internal links can close the gap to the top three.`,
      impact: `Page-one ranking on a high-intent term`,
      action: 'Brief a content update',
    }, 'seo')
  }

  const PRI: Record<RecPriority, number> = { high: 0, medium: 1, low: 2 }
  return out.sort((x, y) => PRI[x.priority] - PRI[y.priority])
}

export function recommendationsForMany(accounts: Account[]): Recommendation[] {
  return accounts.flatMap(recommendationsFor)
}
