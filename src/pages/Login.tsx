/** Mock seat login. No password — pick who you are and the app scopes to it. */
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router'
import { ArrowRight, RadioTower } from 'lucide-react'
import { useApp } from '@/context/app'
import { SEATS, accountsForSeat } from '@/lib/data'

export default function Login() {
  const { login } = useApp()
  const navigate = useNavigate()

  function pick(id: string) {
    login(id)
    navigate('/')
  }

  return (
    <div className="min-h-screen grid place-items-center px-5 py-10">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-[440px]"
      >
        <div className="flex items-center gap-2.5 mb-1">
          <div className="w-9 h-9 rounded-[9px] bg-[var(--ink)] text-[var(--surface)] grid place-items-center flex-none"><RadioTower size={19} /></div>
          <div>
            <div className="font-bold text-[17px] tracking-[-0.01em] leading-none">Reportbeacon</div>
            <div className="text-[11.5px] text-[var(--muted)] mt-0.5">Account console</div>
          </div>
        </div>
        <h1 className="text-[20px] font-bold tracking-[-0.02em] mt-6 mb-1">Choose your seat</h1>
        <p className="text-[13px] text-[var(--ink-2)] mb-5">Demo workspace, no password. You will see only the accounts assigned to your seat.</p>

        <div className="flex flex-col gap-2.5">
          {SEATS.map((s, i) => {
            const count = s.role === 'owner' ? 'All accounts · agency economics' : `${accountsForSeat(s).length} accounts`
            return (
              <motion.button
                key={s.id}
                onClick={() => pick(s.id)}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08 + i * 0.06, duration: 0.35 }}
                className="group flex items-center gap-3.5 p-3.5 rounded-[12px] bg-[var(--surface)] border border-[var(--line)] shadow-[var(--shadow)] lift text-left"
              >
                <span className="w-11 h-11 rounded-full grid place-items-center flex-none text-[14px] font-bold text-white" style={{ background: s.role === 'owner' ? 'var(--ink)' : 'var(--accent)' }}>{s.initials}</span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[14px] font-semibold">{s.name}</span>
                  <span className="block text-[12px] text-[var(--muted)]">{s.title} · {count}</span>
                </span>
                <ArrowRight size={17} className="text-[var(--muted)] group-hover:text-[var(--accent)] group-hover:translate-x-0.5 transition-all" />
              </motion.button>
            )
          })}
        </div>
      </motion.div>
    </div>
  )
}
