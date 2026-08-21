/** Progressive-disclosure + motion primitives (framer-motion). */
import { useState, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { Card } from './kit'

const EASE = [0.16, 1, 0.3, 1] as const

/** Staggered mount reveal for a section. */
export function Reveal({ children, delay = 0, className = '' }: { children: ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: EASE, delay }}
    >
      {children}
    </motion.div>
  )
}

/** A card whose body is hidden until the header is clicked. */
export function ExpandableCard({
  title, subtitle, icon, right, defaultOpen = false, children,
}: {
  title: ReactNode
  subtitle?: ReactNode
  icon?: ReactNode
  right?: ReactNode
  defaultOpen?: boolean
  children: ReactNode
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <Card className="overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-[var(--surface-2)] transition-colors"
      >
        {icon && <span className="flex-none text-[var(--ink-2)]">{icon}</span>}
        <span className="min-w-0">
          <span className="block text-[13.5px] font-semibold">{title}</span>
          {subtitle && <span className="block text-[11.5px] text-[var(--muted)] truncate">{subtitle}</span>}
        </span>
        <span className="ml-auto flex items-center gap-3">
          {right}
          <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }} className="text-[var(--muted)]">
            <ChevronDown size={17} />
          </motion.span>
        </span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: EASE }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-1 border-t border-[var(--line)]">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  )
}

/** Inline expandable region (no card chrome), for table rows etc. */
export function Collapse({ open, children }: { open: boolean; children: ReactNode }) {
  return (
    <AnimatePresence initial={false}>
      {open && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.26, ease: EASE }}
          className="overflow-hidden"
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
