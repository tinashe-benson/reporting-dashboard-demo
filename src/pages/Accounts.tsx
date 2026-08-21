/** Accounts: the full roster, searchable, with the range control. */
import { useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import { useApp } from '@/context/app'
import { ACCOUNTS, RANGES } from '@/lib/data'
import { Segmented } from '@/components/ui/kit'
import AccountsTable from '@/components/AccountsTable'

export default function Accounts() {
  const { range, setRange } = useApp()
  const [q, setQ] = useState('')

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase()
    if (!s) return ACCOUNTS
    return ACCOUNTS.filter((a) => (a.name + ' ' + a.trade + ' ' + a.location).toLowerCase().includes(s))
  }, [q])

  return (
    <div className="flex flex-col gap-4">
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
        <span className="text-[12.5px] text-[var(--muted)]">{filtered.length} of {ACCOUNTS.length}</span>
        <div className="ml-auto">
          <Segmented value={range} onChange={setRange} options={RANGES.map((r) => ({ value: r.id, label: r.label }))} />
        </div>
      </div>
      {filtered.length > 0 ? (
        <AccountsTable range={range} accounts={filtered} />
      ) : (
        <div className="text-center text-[13px] text-[var(--muted)] py-12">No accounts match “{q}”.</div>
      )}
    </div>
  )
}
