/** Settings: workspace preferences, wired to real app state. */
import { useState } from 'react'
import { useNavigate, Link } from 'react-router'
import { toast } from 'sonner'
import { LogOut, ArrowRight } from 'lucide-react'
import { useApp } from '@/context/app'
import { RANGES, accountsForSeat } from '@/lib/data'
import { MODELS } from '@/lib/llm'
import { Card, Segmented, Toggle, Button } from '@/components/ui/kit'
import { Reveal } from '@/components/ui/disclosure'

export default function Settings() {
  const { theme, setTheme, range, setRange, seat, signOut, ai } = useApp()
  const navigate = useNavigate()
  const [alertEmail, setAlertEmail] = useState(true)
  const [weeklyDigest, setWeeklyDigest] = useState(false)
  const connectedModel = MODELS.find((m) => m.id === ai.model)

  return (
    <Reveal className="flex flex-col gap-4 max-w-[640px]">
      <Card className="p-5">
        <div className="text-[13px] font-bold mb-4">Seat</div>
        <div className="flex items-center gap-3">
          <span className="w-11 h-11 rounded-full grid place-items-center flex-none text-[14px] font-bold text-white" style={{ background: seat?.role === 'owner' ? 'var(--ink)' : 'var(--accent)' }}>{seat?.initials}</span>
          <div className="flex-1">
            <div className="text-[14px] font-semibold">{seat?.name}</div>
            <div className="text-[12px] text-[var(--muted)]">{seat?.title} · {seat?.role === 'owner' ? 'all accounts' : `${seat ? accountsForSeat(seat).length : 0} accounts`}</div>
          </div>
          <Button onClick={() => { signOut(); navigate('/') }}><LogOut size={15} /> Sign out</Button>
        </div>
      </Card>

      <Card className="p-5">
        <div className="text-[13px] font-bold mb-4">Appearance</div>
        <Row label="Theme" hint="Also on the top bar">
          <Segmented value={theme} onChange={setTheme} options={[{ value: 'light', label: 'Light' }, { value: 'dark', label: 'Dark' }]} />
        </Row>
        <Row label="Default date range" hint="Applied across the console">
          <Segmented value={range} onChange={setRange} options={RANGES.map((r) => ({ value: r.id, label: r.label }))} />
        </Row>
      </Card>

      <Card className="p-5">
        <div className="text-[13px] font-bold mb-4">AI recommendations</div>
        <Row label="OpenRouter model" hint={ai.key ? 'Connected' : 'Not connected'}>
          <Link to="/integrations" className="text-[12.5px] font-semibold text-[var(--accent)] inline-flex items-center gap-1">
            {ai.key ? connectedModel?.label : 'Connect'} <ArrowRight size={13} />
          </Link>
        </Row>
      </Card>

      <Card className="p-5">
        <div className="text-[13px] font-bold mb-4">Notifications</div>
        <Row label="Email me on new alerts" hint="At-risk and watch flags"><Toggle on={alertEmail} onChange={setAlertEmail} label="Alert email" /></Row>
        <Row label="Weekly portfolio digest" hint="Monday mornings"><Toggle on={weeklyDigest} onChange={setWeeklyDigest} label="Weekly digest" /></Row>
        <div className="mt-4"><Button variant="primary" onClick={() => toast.success('Preferences saved')}>Save preferences</Button></div>
      </Card>
    </Reveal>
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
