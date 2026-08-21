/** Briefly shows a loading state when deps change, so skeletons are visible.
 *  Data here is local and instant; this simulates a fetch for the demo. */
import { useEffect, useState } from 'react'

export function useLoading(deps: unknown[], ms = 450): boolean {
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    setLoading(true)
    const t = setTimeout(() => setLoading(false), ms)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
  return loading
}
