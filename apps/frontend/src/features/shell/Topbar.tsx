import { useEffect, useState } from 'react'
import { listTickets } from '../tickets/tickets-api'
import { EMPTY_COUNTS, type TicketCounts } from '../tickets/tickets'
import { onTicketsChanged, openCreateTicketDialog } from '../tickets/tickets-ui'

export function Topbar() {
  const [counts, setCounts] = useState<TicketCounts>(EMPTY_COUNTS)

  useEffect(() => {
    async function refresh() {
      try {
        const data = await listTickets('todos')
        setCounts(data.counts)
      } catch {
        setCounts(EMPTY_COUNTS)
      }
    }
    void refresh()
    return onTicketsChanged(() => {
      void refresh()
    })
  }, [])

  return (
    <header className="flex shrink-0 items-center gap-3.5 border-b border-stroke bg-panel px-6 py-4">
      <div className="max-w-[280px] flex-1 rounded-[3px] border border-stroke bg-board px-3 py-2 text-[11.5px] tracking-wide text-dim">
        buscar chamado, cliente…
      </div>
      <div className="flex items-baseline gap-1.5 rounded-[3px] border border-stroke bg-board px-3 py-1.5">
        <b className="text-sm text-red">{counts.urgentes}</b>
        <span className="text-[10.5px] tracking-wide text-dim uppercase">urgentes</span>
      </div>
      <div className="flex items-baseline gap-1.5 rounded-[3px] border border-stroke bg-board px-3 py-1.5">
        <b className="text-sm text-amber">{counts.abertos}</b>
        <span className="text-[10.5px] tracking-wide text-dim uppercase">aberto</span>
      </div>
      <div className="flex items-baseline gap-1.5 rounded-[3px] border border-stroke bg-board px-3 py-1.5">
        <b className="text-sm text-amber">{counts.naoatribuidos}</b>
        <span className="text-[10.5px] tracking-wide text-dim uppercase">livres</span>
      </div>
      <button
        type="button"
        onClick={() => openCreateTicketDialog()}
        className="ml-auto rounded-[3px] bg-amber px-4 py-2 text-[11.5px] font-bold tracking-wide text-amber-ink uppercase"
      >
        abrir chamado
      </button>
    </header>
  )
}
