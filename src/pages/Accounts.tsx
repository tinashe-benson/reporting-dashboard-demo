/** Accounts: the full roster, searchable, with the range control. */
import { useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import { useApp } from '@/context/app'
import { useWorkspace } from '@/context/workspace'
import { RANGES } from '@/lib/data'
import { useLoading } from '@/lib/useLoading'
import { Segmented, TableSkeleton } from '@/components/ui/kit'
import { Reveal } from '@/components/ui/disclosure'
import AccountsTable from '@/components/AccountsTable'

export default function Accounts() {
  const { range, setRange } = useApp()
  const { me, isAdmin, accountsForSeat } = useWorkspace()
  const [q, setQ] = useState('')
  const scope = me ? accountsForSeat(me) : []
  const loading = useLoading([me?.id], 380)

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase()
    if (!s) return scope
    return scope.filter((a) => (a.name + ' ' + a.trade + ' ' + a.location).toLowerCase().includes(s))
  }, [q, scope])

  if (loading) return <TableSkeleton rows={scope.length} />

  return (
    <Reveal className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-[340px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search accounts"
            className="w-full bg-[var(--surface)] border border-[var(--line-2)] rounded-[8px] pl-9 pr-3 py-2 text-[13px] text-[var(--ink)] placeholder:text-[var(--muted)] focus:outline-none focus:border-[var(--accent)]"
          />
        </div>
        <span className="text-[12.5px] text-[var(--muted)]">{filtered.length} of {scope.length}</span>
        <div className="ml-auto">
          <Segmented value={range} onChange={setRange} options={RANGES.map((r) => ({ value: r.id, label: r.label }))} />
        </div>
      </div>
      {filtered.length > 0 ? (
        <AccountsTable range={range} accounts={filtered} showManager={isAdmin} />
      ) : (
        <div className="text-center text-[13px] text-[var(--muted)] py-12">No accounts match “{q}”.</div>
      )}
    </Reveal>
  )
}
