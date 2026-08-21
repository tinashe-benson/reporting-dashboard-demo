/** Number formatting for the reporting dashboard. Compact, tabular-friendly. */

export function money(n: number, dp = 0): string {
  return '$' + n.toLocaleString('en-US', { minimumFractionDigits: dp, maximumFractionDigits: dp })
}

export function money2(n: number): string {
  return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export function compact(n: number): string {
  if (n >= 1000) return (n / 1000).toLocaleString('en-US', { maximumFractionDigits: 1 }) + 'K'
  return n.toLocaleString('en-US')
}

export function num(n: number): string {
  return n.toLocaleString('en-US')
}

export function pct(n: number, dp = 1): string {
  const s = n.toLocaleString('en-US', { minimumFractionDigits: dp, maximumFractionDigits: dp })
  return (n > 0 ? '+' : '') + s + '%'
}

/** Is a delta good? Usually up-is-good, but for cost metrics down-is-good. */
export function deltaTone(delta: number, lowerIsBetter = false): 'up' | 'down' | 'flat' {
  if (Math.abs(delta) < 0.05) return 'flat'
  const good = lowerIsBetter ? delta < 0 : delta > 0
  return good ? 'up' : 'down'
}
