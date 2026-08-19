import { useMemo, useState } from 'react'
import { FlapCell } from '../../shared/ui/FlapCell'
import {
  ActionBar,
  ActionButton,
  DetailPanel,
  PassLabel,
  PassSub,
  PassTitle,
  PriorityColor,
  StatusColor,
  StubBar,
} from '../../shared/ui/chrome'
import {
  filterTickets,
  TICKETS,
  type Ticket,
  type TicketFilter,
} from './tickets'

const FILTERS: { id: TicketFilter; label: string }[] = [
  { id: 'todos', label: 'todos' },
  { id: 'meus', label: 'meus chamados' },
  { id: 'naoatribuidos', label: 'não atribuídos' },
  { id: 'urgentes', label: 'urgentes' },
]

function countFor(filter: TicketFilter) {
  return filterTickets(TICKETS, filter).length
}

export function TicketsView() {
  const [filter, setFilter] = useState<TicketFilter>('todos')
  const [selectedId, setSelectedId] = useState('4471')
  const [wave, setWave] = useState(0)

  const rows = useMemo(() => filterTickets(TICKETS, filter), [filter])
  const selected = rows.find((ticket) => ticket.id === selectedId) ?? rows[0]

  function applyFilter(next: TicketFilter) {
    setFilter(next)
    setWave((value) => value + 1)
  }

  function selectRow(ticket: Ticket) {
    setSelectedId(ticket.id)
    setWave((value) => value + 1)
  }

  return (
    <div className="flex min-h-0 flex-1">
      <div className="min-w-0 flex-1 overflow-y-auto px-6 py-4">
        <div className="mb-4 flex gap-1.5">
          {FILTERS.map((item) => {
            const active = filter === item.id
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => applyFilter(item.id)}
                className={`rounded-[3px] border px-3.5 py-2 text-[11px] font-bold tracking-wide uppercase ${
                  active
                    ? 'border-amber bg-tile text-amber'
                    : 'border-stroke bg-tile text-dim hover:text-ink'
                }`}
              >
                {item.label}
                <span className={`ml-1 ${active ? 'text-amber' : 'text-dim'}`}>
                  {countFor(item.id)}
                </span>
              </button>
            )
          })}
        </div>

        <div className="mb-2.5 grid grid-cols-[80px_1fr_120px_100px_100px_60px] px-2.5 text-[10px] tracking-widest text-dim uppercase">
          <span>ticket</span>
          <span>assunto</span>
          <span>status</span>
          <span>prioridade</span>
          <span>agente</span>
          <span className="text-right">tempo</span>
        </div>

        <div className="flex flex-col gap-1.5" key={`${filter}-${wave}`}>
          {rows.map((ticket, index) => {
            const selectedRow = selected?.id === ticket.id
            const delay = Math.min(index, 30) * 45
            return (
              <button
                key={ticket.id}
                type="button"
                onClick={() => selectRow(ticket)}
                className="grid w-full grid-cols-[80px_1fr_120px_100px_100px_60px] gap-1.5 text-left [perspective:700px]"
              >
                <FlapCell delayMs={delay} selected={selectedRow}>
                  #{ticket.id}
                </FlapCell>
                <FlapCell
                  delayMs={delay}
                  selected={selectedRow}
                  className="font-normal tracking-wide normal-case"
                >
                  {ticket.subject}
                </FlapCell>
                <FlapCell delayMs={delay} selected={selectedRow}>
                  <StatusColor status={ticket.status} />
                </FlapCell>
                <FlapCell delayMs={delay} selected={selectedRow}>
                  <PriorityColor
                    priority={ticket.priority === 'media' ? 'média' : ticket.priority}
                  />
                </FlapCell>
                <FlapCell delayMs={delay} selected={selectedRow}>
                  {ticket.agentLabel}
                </FlapCell>
                <FlapCell
                  delayMs={delay}
                  selected={selectedRow}
                  align="end"
                  className="font-normal text-dim"
                >
                  {ticket.time}
                </FlapCell>
              </button>
            )
          })}
        </div>
      </div>

      {selected ? (
        <DetailPanel>
          <PassLabel>
            chamado nº {selected.id} · {selected.category}
          </PassLabel>
          <PassTitle>{selected.subject}</PassTitle>
          <PassSub>
            {selected.requester} · {selected.email}
          </PassSub>
          <StubBar />
          <div className="mb-5 grid grid-cols-2 gap-3">
            <div>
              <PassLabel>status</PassLabel>
              <div className="text-[12.5px]">
                <StatusColor status={selected.status} />
              </div>
            </div>
            <div>
              <PassLabel>prioridade</PassLabel>
              <div className="text-[12.5px]">
                <PriorityColor
                  priority={selected.priority === 'media' ? 'média' : selected.priority}
                />
              </div>
            </div>
            <div>
              <PassLabel>agente</PassLabel>
              <div className="text-[12.5px]">
                {selected.agent === 'livre' ? '— não atribuído' : selected.agentLabel}
              </div>
            </div>
            <div>
              <PassLabel>aberto em</PassLabel>
              <div className="text-[12.5px]">{selected.openedAt}</div>
            </div>
          </div>
          <div className="mb-2 text-[10.5px] tracking-widest text-dim uppercase">histórico</div>
          {selected.history.map((line) => (
            <div
              key={`${line.time}-${line.text}`}
              className={`mb-2 text-xs leading-relaxed ${line.note ? 'text-amber' : 'text-ink'}`}
            >
              <span className="mr-2 text-dim">{line.time}</span>
              {line.text}
            </div>
          ))}
          <textarea
            placeholder={`escrever resposta para ${selected.requester.split(' ')[0]}…`}
            className="mt-1.5 h-14 w-full resize-none rounded-[3px] border border-stroke bg-tile px-3 py-2.5 text-xs text-ink placeholder:text-dim"
          />
          <ActionBar>
            <ActionButton primary>responder</ActionButton>
            <ActionButton>transferir</ActionButton>
            <ActionButton>encerrar</ActionButton>
          </ActionBar>
        </DetailPanel>
      ) : null}
    </div>
  )
}
