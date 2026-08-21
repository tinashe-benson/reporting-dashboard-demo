/** Integrations: source connection status per account, with reconnect. */
import { toast } from 'sonner'
import { RefreshCw } from 'lucide-react'
import { ACCOUNTS, PLATFORMS, type SourceStatus } from '@/lib/data'
import { relTime } from '@/lib/format'
import { Card, Button } from '@/components/ui/kit'

const LABEL: Record<SourceStatus, string> = { live: 'Live', syncing: 'Syncing', attention: 'Reconnect' }
const COLOR: Record<SourceStatus, string> = { live: 'var(--st-good)', syncing: 'var(--st-warn)', attention: 'var(--st-critical)' }

export default function Integrations() {
  return (
    <div className="flex flex-col gap-4 max-w-[960px]">
      <p className="text-[13px] text-[var(--ink-2)]">Connection status for every source across the roster. Reconnect anything that has dropped.</p>
      {ACCOUNTS.map((a) => (
        <Card key={a.id} className="p-4">
          <div className="flex items-center gap-3 mb-3.5">
            <span className="w-8 h-8 rounded-[8px] grid place-items-center mono text-[12px] font-bold text-white flex-none" style={{ background: a.color }}>{a.mark}</span>
            <div>
              <div className="font-semibold text-[13.5px]">{a.name}</div>
              <div className="text-[11.5px] text-[var(--muted)]">Last synced {relTime(a.lastSyncedMin)}</div>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
            {PLATFORMS.map((pl) => {
              const s = a.sources[pl.id]
              return (
                <div key={pl.id} className="bg-[var(--surface-2)] border border-[var(--line)] rounded-[9px] px-3 py-2.5 flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[12px] font-semibold">{pl.short}</span>
                    <span className="w-[9px] h-[9px] rounded-full" style={{ background: COLOR[s] }} />
                  </div>
                  <span className="text-[10.5px] font-semibold uppercase tracking-wide" style={{ color: COLOR[s] }}>{LABEL[s]}</span>
                  {s === 'attention' && (
                    <Button variant="default" className="mt-1 py-1 px-2 text-[11px]" onClick={() => toast.success(`Reauthorizing ${pl.name}`, { description: a.name })}>
                      <RefreshCw size={12} /> Reconnect
                    </Button>
                  )}
                </div>
              )
            })}
          </div>
        </Card>
      ))}
    </div>
  )
}
