/**
 * Team & access (admin only): manage account managers, assign clients to them,
 * and archive clients that leave. Managers never see this screen.
 */
import { useState } from 'react'
import { toast } from 'sonner'
import { UserPlus, Trash2, Archive, RotateCcw, Inbox } from 'lucide-react'
import { useWorkspace } from '@/context/workspace'
import { Card, Button, SectionTitle } from '@/components/ui/kit'
import { Reveal } from '@/components/ui/disclosure'

export default function Team() {
  const {
    isAdmin, members, clients, unassigned, archivedClients, managerFor, clientCount,
    addMember, removeMember, assignClient, archiveClient, restoreClient,
  } = useWorkspace()
  const [name, setName] = useState('')

  if (!isAdmin) {
    return <Card className="p-10 text-center text-[13px] text-[var(--muted)] max-w-[520px]">Team and access is managed by the agency owner.</Card>
  }

  const managers = members.filter((m) => m.role === 'manager')

  function add() {
    const n = name.trim()
    if (!n) return
    addMember(n)
    setName('')
    toast.success(`${n} added`, { description: 'They can now sign in from the seat picker' })
  }

  return (
    <Reveal className="flex flex-col gap-6 max-w-[920px]">
      {/* Team members */}
      <section>
        <SectionTitle>Team</SectionTitle>
        <Card className="divide-y divide-[var(--line)]">
          {members.map((m) => (
            <div key={m.id} className="flex items-center gap-3 px-4 py-3">
              <span className="w-9 h-9 rounded-full grid place-items-center flex-none text-[12px] font-bold text-white" style={{ background: m.role === 'owner' ? 'var(--ink)' : 'var(--accent)' }}>{m.initials}</span>
              <div className="flex-1 min-w-0">
                <div className="text-[13.5px] font-semibold">{m.name}</div>
                <div className="text-[11.5px] text-[var(--muted)]">{m.role === 'owner' ? 'Agency owner · all accounts' : `Account manager · ${clientCount(m.id)} clients`}</div>
              </div>
              {m.role === 'manager' && (
                <Button
                  onClick={() => { removeMember(m.id); toast.success(`${m.name} removed`, { description: 'Their clients moved to Unassigned' }) }}
                  className="text-[12px] py-1.5 px-2.5"
                ><Trash2 size={13} /> Remove</Button>
              )}
            </div>
          ))}
          <div className="flex items-center gap-2 px-4 py-3">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') add() }}
              placeholder="Add an account manager by name"
              className="flex-1 bg-[var(--surface-2)] border border-[var(--line-2)] rounded-[8px] px-3 py-2 text-[13px] text-[var(--ink)] placeholder:text-[var(--muted)] focus:outline-none focus:border-[var(--accent)]"
            />
            <Button variant="primary" onClick={add} disabled={!name.trim()}><UserPlus size={15} /> Add manager</Button>
          </div>
        </Card>
      </section>

      {/* Client assignments */}
      <section>
        <SectionTitle>Client assignments <span className="text-[11px] font-medium text-[var(--muted)] ml-1">{clients.length} clients</span></SectionTitle>
        {unassigned.length > 0 && (
          <div className="flex items-center gap-2 text-[12.5px] text-[var(--st-warn)] mb-2.5"><Inbox size={14} /> {unassigned.length} unassigned {unassigned.length === 1 ? 'client needs' : 'clients need'} an owner.</div>
        )}
        <Card className="divide-y divide-[var(--line)]">
          {clients.map((c) => {
            const owner = managerFor(c.id)
            return (
              <div key={c.id} className="flex items-center gap-3 px-4 py-3">
                <span className="w-8 h-8 rounded-[8px] grid place-items-center mono text-[11px] font-bold text-white flex-none" style={{ background: c.color }}>{c.mark}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-semibold">{c.name}</div>
                  <div className="text-[11.5px] text-[var(--muted)]">{c.trade} · {c.location}</div>
                </div>
                {!owner && <span className="text-[10.5px] font-semibold uppercase tracking-wide text-[var(--st-warn)] hidden sm:inline">Unassigned</span>}
                <select
                  value={owner?.id ?? ''}
                  onChange={(e) => assignClient(c.id, e.target.value)}
                  className="bg-[var(--surface-2)] border border-[var(--line-2)] rounded-[8px] px-2.5 py-1.5 text-[12.5px] text-[var(--ink)] focus:outline-none focus:border-[var(--accent)]"
                >
                  <option value="">Unassigned</option>
                  {managers.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
                <Button
                  onClick={() => { archiveClient(c.id); toast.success(`${c.name} archived`) }}
                  className="text-[12px] py-1.5 px-2.5"
                ><Archive size={13} /> Archive</Button>
              </div>
            )
          })}
          {clients.length === 0 && <div className="px-4 py-8 text-center text-[13px] text-[var(--muted)]">No clients imported yet. Add them from Integrations.</div>}
        </Card>
      </section>

      {/* Archived */}
      {archivedClients.length > 0 && (
        <section>
          <SectionTitle>Archived</SectionTitle>
          <Card className="divide-y divide-[var(--line)]">
            {archivedClients.map((c) => (
              <div key={c.id} className="flex items-center gap-3 px-4 py-3">
                <span className="w-8 h-8 rounded-[8px] grid place-items-center mono text-[11px] font-bold text-white flex-none opacity-60" style={{ background: c.color }}>{c.mark}</span>
                <div className="flex-1 min-w-0"><div className="text-[13px] font-semibold text-[var(--ink-2)]">{c.name}</div><div className="text-[11.5px] text-[var(--muted)]">{c.trade} · {c.location}</div></div>
                <Button onClick={() => { restoreClient(c.id); toast.success(`${c.name} restored`, { description: 'Now unassigned' }) }} className="text-[12px] py-1.5 px-2.5"><RotateCcw size={13} /> Restore</Button>
              </div>
            ))}
          </Card>
        </section>
      )}
    </Reveal>
  )
}
