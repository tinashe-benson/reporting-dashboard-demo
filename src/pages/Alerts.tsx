/** Alerts: every open exception across the roster, most severe first. */
import { Link } from 'react-router'
import { ArrowRight } from 'lucide-react'
import { allAlerts, type Severity } from '@/lib/data'
import { Card, SeverityDot, Chip } from '@/components/ui/kit'

const SEV_LABEL: Record<Severity, string> = { serious: 'At risk', warning: 'Watch', info: 'Info' }

export default function Alerts() {
  const alerts = allAlerts()
  const groups: Severity[] = ['serious', 'warning', 'info']

  return (
    <div className="flex flex-col gap-6 max-w-[860px]">
      {groups.map((sev) => {
        const items = alerts.filter((a) => a.severity === sev)
        if (items.length === 0) return null
        return (
          <section key={sev}>
            <div className="flex items-center gap-2 mb-3">
              <SeverityDot severity={sev} />
              <h2 className="text-[14px] font-bold">{SEV_LABEL[sev]}</h2>
              <span className="text-[12px] text-[var(--muted)]">{items.length}</span>
            </div>
            <Card>
              {items.map((al, i) => (
                <Link key={al.id} to={`/accounts/${al.accountId}`} className={`flex items-center gap-3 px-4 py-3.5 hover:bg-[var(--surface-2)] transition-colors ${i > 0 ? 'border-t border-[var(--line)]' : ''}`}>
                  <div className="min-w-0 flex-1">
                    <div className="text-[13px] font-semibold">{al.title}</div>
                    <div className="text-[11.5px] text-[var(--ink-2)]">{al.detail}</div>
                  </div>
                  <span className="text-[11.5px] font-medium text-[var(--ink-2)] whitespace-nowrap hidden sm:block">{al.accountName}</span>
                  <Chip tone={al.severity === 'serious' ? 'serious' : 'warn'}>{al.tag}</Chip>
                  <ArrowRight size={15} className="text-[var(--muted)]" />
                </Link>
              ))}
            </Card>
          </section>
        )
      })}
      {alerts.length === 0 && <Card className="p-10 text-center text-[13px] text-[var(--muted)]">No open alerts.</Card>}
    </div>
  )
}
