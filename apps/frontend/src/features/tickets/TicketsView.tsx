import { useEffect, useState } from 'react'
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
  closeTicket,
  listTickets,
  replyToTicket,
  transferTicket,
} from './tickets-api'
import {
  CURRENT_AGENT,
  EMPTY_COUNTS,
  type Ticket,
  type TicketCounts,
  type TicketFilter,
} from './tickets'

const FILTERS: { id: TicketFilter; label: string }[] = [
  { id: 'todos', label: 'todos' },
  { id: 'meus', label: 'meus chamados' },
  { id: 'naoatribuidos', label: 'não atribuídos' },
  { id: 'urgentes', label: 'urgentes' },
]

export function TicketsView() {
  const [filter, setFilter] = useState<TicketFilter>('todos')
  const [rows, setRows] = useState<Ticket[]>([])
  const [counts, setCounts] = useState<TicketCounts>(EMPTY_COUNTS)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [wave, setWave] = useState(0)
  const [draft, setDraft] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const selected = rows.find((ticket) => ticket.id === selectedId) ?? rows[0] ?? null

  async function load(nextFilter = filter, keepId?: string | null) {
    setLoading(true)
    setError(null)
    try {
      const data = await listTickets(nextFilter)
      setRows(data.items)
      setCounts(data.counts)
      const preferred = keepId ?? selectedId
      const nextSelected =
        data.items.find((ticket) => ticket.id === preferred)?.id ??
        data.items[0]?.id ??
        null
      setSelectedId(nextSelected)
      setWave((value) => value + 1)
    } catch (err) {
      setRows([])
      setCounts(EMPTY_COUNTS)
      setSelectedId(null)
      setError(err instanceof Error ? err.message : 'falha ao carregar chamados')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load('todos')
  }, [])

  function applyFilter(next: TicketFilter) {
    setFilter(next)
    void load(next)
  }

  function selectRow(ticket: Ticket) {
    setSelectedId(ticket.id)
    setDraft('')
    setWave((value) => value + 1)
  }

  async function runAction(action: () => Promise<Ticket>) {
    if (!selected || busy) return
    setBusy(true)
    setError(null)
    try {
      const updated = await action()
      setDraft('')
      await load(filter, updated.id)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'falha na ação')
    } finally {
      setBusy(false)
    }
  }

  function onReply() {
    const text = draft.trim()
    if (!text || !selected) return
    void runAction(() => replyToTicket(selected.id, text))
  }

  function onTransfer() {
    if (!selected) return
    const next = window.prompt(
      'transferir para agente (vazio = desatribuir)',
      selected.agent === 'livre' ? CURRENT_AGENT : selected.agent,
    )
    if (next === null) return
    const agent = next.trim() ? next.trim() : null
    void runAction(() => transferTicket(selected.id, agent))
  }

  function onClose() {
    if (!selected) return
    if (!window.confirm(`encerrar chamado #${selected.id}?`)) return
    void runAction(() => closeTicket(selected.id))
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
                  {counts[item.id]}
                </span>
              </button>
            )
          })}
        </div>

        {error ? (
          <div className="mb-3 rounded-[3px] border border-red/40 bg-tile px-3 py-2 text-xs text-red">
            {error}
            <button
              type="button"
              className="ml-3 text-amber underline"
              onClick={() => void load(filter)}
            >
              tentar de novo
            </button>
          </div>
        ) : null}

        <div className="mb-2.5 grid grid-cols-[80px_1fr_120px_100px_100px_60px] px-2.5 text-[10px] tracking-widest text-dim uppercase">
          <span>ticket</span>
          <span>assunto</span>
          <span>status</span>
          <span>prioridade</span>
          <span>agente</span>
          <span className="text-right">tempo</span>
        </div>

        {loading && rows.length === 0 ? (
          <div className="px-2.5 text-xs text-dim">carregando chamados…</div>
        ) : null}

        {!loading && rows.length === 0 && !error ? (
          <div className="px-2.5 text-xs text-dim">nenhum chamado neste filtro</div>
        ) : null}

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
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            disabled={busy || selected.status === 'resolvido'}
            placeholder={`escrever resposta para ${selected.requester.split(' ')[0]}…`}
            className="mt-1.5 h-14 w-full resize-none rounded-[3px] border border-stroke bg-tile px-3 py-2.5 text-xs text-ink placeholder:text-dim disabled:opacity-50"
          />
          <ActionBar>
            <ActionButton primary onClick={onReply}>
              {busy ? '…' : 'responder'}
            </ActionButton>
            <ActionButton onClick={onTransfer}>transferir</ActionButton>
            <ActionButton onClick={onClose}>encerrar</ActionButton>
          </ActionBar>
        </DetailPanel>
      ) : null}
    </div>
  )
}
