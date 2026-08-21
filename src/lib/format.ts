/** Number formatting for the console. Compact and tabular-friendly. */

export function money(n: number, dp = 0): string {
  return '$' + n.toLocaleString('en-US', { minimumFractionDigits: dp, maximumFractionDigits: dp })
}

export function money2(n: number): string {
  return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

/** $37.7k style. */
export function moneyK(n: number): string {
  if (Math.abs(n) >= 1000) return '$' + (n / 1000).toLocaleString('en-US', { maximumFractionDigits: 1 }) + 'k'
  return '$' + Math.round(n).toLocaleString('en-US')
}

export function compact(n: number): string {
  if (n >= 1000) return (n / 1000).toLocaleString('en-US', { maximumFractionDigits: 1 }) + 'K'
  return n.toLocaleString('en-US')
}

export function num(n: number): string {
  return Math.round(n).toLocaleString('en-US')
}

/** Absolute percentage, no sign (direction is shown by the arrow/color). */
export function pctAbs(n: number, dp = 1): string {
  return Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: dp, maximumFractionDigits: dp }) + '%'
}

export function relTime(min: number): string {
  if (min < 1) return 'just now'
  if (min < 60) return `${Math.round(min)} min ago`
  const h = Math.floor(min / 60)
  if (h < 24) return `${h} hr ago`
  return `${Math.floor(h / 24)} d ago`
}
