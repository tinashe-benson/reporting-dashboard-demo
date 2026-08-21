/** Recommendations across the seat's accounts, with optional live model. */
import { useApp } from '@/context/app'
import { accountsForSeat, ACCOUNTS } from '@/lib/data'
import { useLoading } from '@/lib/useLoading'
import { Reveal } from '@/components/ui/disclosure'
import { KpiSkeleton } from '@/components/ui/kit'
import { RecommendationsPanel } from '@/components/Recommendations'

export default function RecommendationsPage() {
  const { seat } = useApp()
  const accounts = seat ? accountsForSeat(seat) : ACCOUNTS
  const loading = useLoading([seat?.id], 400)

  if (loading) {
    return (
      <div className="grid md:grid-cols-2 gap-3.5">
        {Array.from({ length: 4 }).map((_, i) => <KpiSkeleton key={i} />)}
      </div>
    )
  }

  return (
    <Reveal className="flex flex-col gap-4">
      <p className="text-[13px] text-[var(--ink-2)] max-w-[640px]">
        Prioritised actions across your book, weighted toward budget efficiency. Connect an OpenRouter model on Integrations to have a model write them.
      </p>
      <RecommendationsPanel accounts={accounts} />
    </Reveal>
  )
}
