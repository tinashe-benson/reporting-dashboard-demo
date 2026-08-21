/** Settings: workspace preferences, wired to real app state. */
import { useState } from 'react'
import { toast } from 'sonner'
import { useApp } from '@/context/app'
import { ROLES, RANGES } from '@/lib/data'
import { Card, Segmented, Toggle, Button } from '@/components/ui/kit'

export default function Settings() {
  const { theme, toggleTheme, role, setRole, range, setRange } = useApp()
  const [alertEmail, setAlertEmail] = useState(true)
  const [weeklyDigest, setWeeklyDigest] = useState(false)

  return (
    <div className="flex flex-col gap-4 max-w-[640px]">
      <Card className="p-5">
        <div className="text-[13px] font-bold mb-4">Appearance</div>
        <Row label="Theme" hint="Also on the top bar">
          <Segmented value={theme} onChange={(v) => { if (v !== theme) toggleTheme() }} options={[{ value: 'light', label: 'Light' }, { value: 'dark', label: 'Dark' }]} />
        </Row>
        <Row label="Default date range" hint="Applied across the console">
          <Segmented value={range} onChange={setRange} options={RANGES.map((r) => ({ value: r.id, label: r.label }))} />
        </Row>
      </Card>

      <Card className="p-5">
        <div className="text-[13px] font-bold mb-4">Seat</div>
        <Row label="Active seat" hint="Owner sees agency economics">
          <Segmented value={role} onChange={setRole} options={ROLES.map((r) => ({ value: r.id, label: r.label }))} />
        </Row>
      </Card>

      <Card className="p-5">
        <div className="text-[13px] font-bold mb-4">Notifications</div>
        <Row label="Email me on new alerts" hint="At-risk and watch flags">
          <Toggle on={alertEmail} onChange={setAlertEmail} label="Alert email" />
        </Row>
        <Row label="Weekly portfolio digest" hint="Monday mornings">
          <Toggle on={weeklyDigest} onChange={setWeeklyDigest} label="Weekly digest" />
        </Row>
        <div className="mt-4">
          <Button variant="primary" onClick={() => toast.success('Preferences saved')}>Save preferences</Button>
        </div>
      </Card>
    </div>
  )
}

function Row({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2.5 border-t border-[var(--line)] first:border-t-0">
      <div>
        <div className="text-[13px] font-medium">{label}</div>
        {hint && <div className="text-[11.5px] text-[var(--muted)]">{hint}</div>}
      </div>
      {children}
    </div>
  )
}
