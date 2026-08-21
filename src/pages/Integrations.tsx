/** Integrations: the OpenRouter AI connection, plus source status per account. */
import { useState } from 'react'
import { Link } from 'react-router'
import { toast } from 'sonner'
import { RefreshCw, Sparkles, KeyRound, Eye, EyeOff, Loader2, Check, ArrowRight, Trash2 } from 'lucide-react'
import { useApp } from '@/context/app'
import { accountsForSeat, ACCOUNTS, PLATFORMS, type SourceStatus } from '@/lib/data'
import { relTime } from '@/lib/format'
import { MODELS, generateLive } from '@/lib/llm'
import { Card, Button } from '@/components/ui/kit'
import { Reveal } from '@/components/ui/disclosure'

const LABEL: Record<SourceStatus, string> = { live: 'Live', syncing: 'Syncing', attention: 'Reconnect' }
const COLOR: Record<SourceStatus, string> = { live: 'var(--st-good)', syncing: 'var(--st-warn)', attention: 'var(--st-critical)' }

export default function Integrations() {
  const { ai, setAi, seat } = useApp()
  const accounts = seat ? accountsForSeat(seat) : ACCOUNTS
  const [show, setShow] = useState(false)
  const [testing, setTesting] = useState(false)
  const connected = ai.key.trim().length > 0

  async function test() {
    if (!connected) return
    setTesting(true)
    try {
      await generateLive(accounts[0], ai)
      toast.success('Connection works', { description: MODELS.find((m) => m.id === ai.model)?.label })
    } catch (e) {
      toast.error('Could not reach the model', { description: e instanceof Error ? e.message : 'Check the key and try again' })
    } finally {
      setTesting(false)
    }
  }

  const vendors = [...new Set(MODELS.map((m) => m.vendor))]

  return (
    <Reveal className="flex flex-col gap-5 max-w-[960px]">
      {/* AI provider */}
      <Card className="p-5">
        <div className="flex items-start gap-3 mb-4">
          <span className="w-9 h-9 rounded-[9px] grid place-items-center flex-none" style={{ background: 'var(--accent-weak)', color: 'var(--accent)' }}><Sparkles size={18} /></span>
          <div className="flex-1">
            <div className="text-[14px] font-bold">AI recommendations · OpenRouter</div>
            <div className="text-[12.5px] text-[var(--ink-2)] mt-0.5">One key routes to Claude, GPT, Gemini, Qwen, Kimi and more. Used to write budget and optimization suggestions from each account's numbers.</div>
          </div>
          <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full border flex items-center gap-1.5 flex-none" style={{ color: connected ? 'var(--good)' : 'var(--muted)', borderColor: connected ? 'color-mix(in srgb, var(--st-good) 34%, transparent)' : 'var(--line-2)' }}>
            <span className="w-[7px] h-[7px] rounded-full" style={{ background: connected ? 'var(--st-good)' : 'var(--muted)' }} />
            {connected ? 'Connected' : 'Not connected'}
          </span>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="eyebrow">API key</label>
            <div className="relative mt-2">
              <KeyRound size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
              <input
                type={show ? 'text' : 'password'}
                value={ai.key}
                onChange={(e) => setAi({ key: e.target.value })}
                placeholder="sk-or-v1-…"
                className="w-full bg-[var(--surface-2)] border border-[var(--line-2)] rounded-[8px] pl-9 pr-10 py-2 text-[13px] mono text-[var(--ink)] placeholder:text-[var(--muted)] focus:outline-none focus:border-[var(--accent)]"
              />
              <button onClick={() => setShow((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted)] hover:text-[var(--ink)]" aria-label={show ? 'Hide key' : 'Show key'}>
                {show ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            <div className="text-[11px] text-[var(--muted)] mt-1.5">Stored only in this browser. Get one at openrouter.ai/keys.</div>
          </div>

          <div>
            <label className="eyebrow">Model</label>
            <select
              value={ai.model}
              onChange={(e) => setAi({ model: e.target.value })}
              className="w-full mt-2 bg-[var(--surface-2)] border border-[var(--line-2)] rounded-[8px] px-3 py-2 text-[13px] text-[var(--ink)] focus:outline-none focus:border-[var(--accent)]"
            >
              {vendors.map((v) => (
                <optgroup key={v} label={v}>
                  {MODELS.filter((m) => m.vendor === v).map((m) => <option key={m.id} value={m.id}>{m.label}</option>)}
                </optgroup>
              ))}
            </select>
            <div className="flex items-center gap-2 mt-2.5">
              <Button variant="primary" onClick={test} disabled={!connected || testing}>
                {testing ? <Loader2 size={15} className="spin" /> : <Check size={15} />}{testing ? 'Testing…' : 'Test connection'}
              </Button>
              {connected && <Button onClick={() => setAi({ key: '' })}><Trash2 size={15} /> Clear</Button>}
            </div>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-[var(--line)] flex items-center justify-between gap-3 flex-wrap">
          <span className="text-[12.5px] text-[var(--ink-2)]">{connected ? 'Recommendations can now be written by the model.' : 'The built-in engine still works without a key.'}</span>
          <Link to="/recommendations" className="text-[12.5px] font-semibold text-[var(--accent)] inline-flex items-center gap-1">View recommendations <ArrowRight size={13} /></Link>
        </div>
      </Card>

      {/* Data sources */}
      <div>
        <div className="text-[13px] font-bold mb-1">Data sources</div>
        <p className="text-[12.5px] text-[var(--ink-2)] mb-3">Connection status for every source. Reconnect anything that has dropped.</p>
        <div className="flex flex-col gap-4">
          {accounts.map((a) => (
            <Card key={a.id} className="p-4">
              <div className="flex items-center gap-3 mb-3.5">
                <span className="w-8 h-8 rounded-[8px] grid place-items-center mono text-[12px] font-bold text-white flex-none" style={{ background: a.color }}>{a.mark}</span>
                <div><div className="font-semibold text-[13.5px]">{a.name}</div><div className="text-[11.5px] text-[var(--muted)]">Last synced {relTime(a.lastSyncedMin)}</div></div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
                {PLATFORMS.map((pl) => {
                  const s = a.sources[pl.id]
                  return (
                    <div key={pl.id} className="bg-[var(--surface-2)] border border-[var(--line)] rounded-[9px] px-3 py-2.5 flex flex-col gap-1.5">
                      <div className="flex items-center justify-between"><span className="text-[12px] font-semibold">{pl.short}</span><span className="w-[9px] h-[9px] rounded-full" style={{ background: COLOR[s] }} /></div>
                      <span className="text-[10.5px] font-semibold uppercase tracking-wide" style={{ color: COLOR[s] }}>{LABEL[s]}</span>
                      {s === 'attention' && <Button className="mt-1 py-1 px-2 text-[11px] press" onClick={() => toast.success(`Reauthorizing ${pl.name}`, { description: a.name })}><RefreshCw size={12} /> Reconnect</Button>}
                    </div>
                  )
                })}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </Reveal>
  )
}
