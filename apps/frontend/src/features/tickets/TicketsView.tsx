import { useEffect, useRef, useState } from 'react'
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
import { toast } from '../../shared/ui/toast'
import { listUsers } from '../users/users-api'
import type { User } from '../users/users'
import {
  claimTicket,
  closeTicket,
  listTickets,
  markTicketWaiting,
  replyToTicket,
  transferTicket,
} from './tickets-api'
import {
  EMPTY_COUNTS,
  type Ticket,
  type TicketCounts,
  type TicketFilter,
} from './tickets'
import { onTicketsChanged, notifyTicketsChanged } from './tickets-ui'
import {
  EMPTY_ANIM,
  buildPatchAnim,
  mergeAnimPlan,
  nextAnimToken,
  snapshotTickets,
  type AnimPlan,
  type CellField,
} from './tickets-anim'
import {
  consumeTicketFocus,
  openChatForTicket,
  useShellNav,
} from '../shell/shell-nav'

const FILTERS: { id: TicketFilter; label: string }[] = [
  { id: 'todos', label: 'todos' },
  { id: 'meus', label: 'meus chamados' },
  { id: 'naoatribuidos', label: 'não atribuídos' },
  { id: 'urgentes', label: 'urgentes' },
]

export function TicketsView() {
  const { ticketFocusId } = useShellNav()
  const [filter, setFilter] = useState<TicketFilter>('todos')
  const [rows, setRows] = useState<Ticket[]>([])
  const [counts, setCounts] = useState<TicketCounts>(EMPTY_COUNTS)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [anim, setAnim] = useState<AnimPlan>(EMPTY_ANIM)
  const [draft, setDraft] = useState('')
  const [asNote, setAsNote] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [technicians, setTechnicians] = useState<User[]>([])
  const [transferOpen, setTransferOpen] = useState(false)
  const previousRows = useRef<Map<string, Ticket>>(new Map())
  const filterRef = useRef(filter)

  const selected = rows.find((ticket) => ticket.id === selectedId) ?? rows[0] ?? null
  const resolved = selected?.status === 'resolvido'
  const unassigned = selected?.agent === 'livre'

  async function load(
    nextFilter = filter,
    options?: { keepId?: string | null; animMode?: 'list' | 'patch' },
  ) {
    const animMode = options?.animMode ?? 'list'
    setLoading(true)
    setError(null)
    try {
      const data = await listTickets(nextFilter)
      if (animMode === 'list') {
        setAnim({
          listToken: nextAnimToken(),
          rowTokens: {},
          cellTokens: {},
        })
      } else {
        const patch = buildPatchAnim(previousRows.current, data.items)
        setAnim((current) => mergeAnimPlan(current, patch))
      }
      previousRows.current = snapshotTickets(data.items)
      setRows(data.items)
      setCounts(data.counts)
      const preferred = options?.keepId ?? selectedId
      const nextSelected =
        data.items.find((ticket) => ticket.id === preferred)?.id ??
        data.items[0]?.id ??
        null
      setSelectedId(nextSelected)
    } catch (err) {
      setRows([])
      setCounts(EMPTY_COUNTS)
      setSelectedId(null)
      previousRows.current = new Map()
      setAnim(EMPTY_ANIM)
      setError(err instanceof Error ? err.message : 'falha ao carregar chamados')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load('todos', { animMode: 'list' })
    void listUsers('tecnico')
      .then((data) => setTechnicians(data.items.filter((user) => user.handle)))
      .catch(() => setTechnicians([]))
    return onTicketsChanged(() => {
      void load(filterRef.current, { animMode: 'patch' })
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!ticketFocusId) return
    const id = consumeTicketFocus()
    if (!id) return
    setSelectedId(id)
    void load(filterRef.current, { keepId: id, animMode: 'patch' })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ticketFocusId])

  function applyFilter(next: TicketFilter) {
    setFilter(next)
    filterRef.current = next
    setTransferOpen(false)
    void load(next, { animMode: 'list' })
  }

  function selectRow(ticket: Ticket) {
    setSelectedId(ticket.id)
    setDraft('')
    setAsNote(false)
    setTransferOpen(false)
  }

  async function runAction(
    action: () => Promise<Ticket>,
    successMessage?: string,
  ) {
    if (!selected || busy) return
    setBusy(true)
    setError(null)
    try {
      const updated = await action()
      setDraft('')
      setAsNote(false)
      setTransferOpen(false)
      await load(filter, { keepId: updated.id, animMode: 'patch' })
      notifyTicketsChanged()
      if (successMessage) toast.success(successMessage)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'falha na ação'
      setError(message)
      toast.error(message)
    } finally {
      setBusy(false)
    }
  }

  function onReply() {
    if (!selected) return
    if (asNote) {
      const text = draft.trim()
      if (!text) return
      void runAction(() => replyToTicket(selected.id, text, true), 'nota registrada')
      return
    }
    openChatForTicket(selected.id, draft.trim())
  }

  function onClaim() {
    if (!selected) return
    void runAction(() => claimTicket(selected.id), 'chamado assumido')
  }

  function onWaiting() {
    if (!selected) return
    void runAction(() => markTicketWaiting(selected.id), 'marcado como aguardando')
  }

  async function onTransferPick(handle: string | null) {
    if (!selected) return
    void runAction(
      () => transferTicket(selected.id, handle),
      handle ? `transferido para ${handle}` : 'chamado desatribuído',
    )
  }

  async function onClose() {
    if (!selected) return
    const ok = await toast.confirm({
      title: 'encerrar chamado',
      message: `encerrar o chamado nº ${selected.id}?`,
      confirmLabel: 'encerrar',
    })
    if (!ok) return
    void runAction(() => closeTicket(selected.id), 'chamado encerrado')
  }

  function cellAnim(ticketId: string, field: CellField) {
    if (anim.listToken) {
      return { animate: true as const, nonce: anim.listToken }
    }
    if (anim.rowTokens[ticketId]) {
      return { animate: true as const, nonce: anim.rowTokens[ticketId] }
    }
    const cell = anim.cellTokens[ticketId]?.[field]
    if (cell) return { animate: true as const, nonce: cell }
    return { animate: false as const, nonce: 0 }
  }

  function cellKey(ticketId: string, field: CellField) {
    const { animate, nonce } = cellAnim(ticketId, field)
    return animate ? `${ticketId}-${field}-${nonce}` : `${ticketId}-${field}`
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
              onClick={() => void load(filter, { animMode: 'list' })}
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

        <div className="flex flex-col gap-1.5">
          {rows.map((ticket, index) => {
            const selectedRow = selected?.id === ticket.id
            const listDelay = anim.listToken ? Math.min(index, 30) * 45 : 0
            const idAnim = cellAnim(ticket.id, 'id')
            const subjectAnim = cellAnim(ticket.id, 'subject')
            const statusAnim = cellAnim(ticket.id, 'status')
            const priorityAnim = cellAnim(ticket.id, 'priority')
            const agentAnim = cellAnim(ticket.id, 'agent')
            const timeAnim = cellAnim(ticket.id, 'time')
            return (
              <button
                key={ticket.id}
                type="button"
                onClick={() => selectRow(ticket)}
                className="grid w-full grid-cols-[80px_1fr_120px_100px_100px_60px] gap-1.5 text-left [perspective:700px]"
              >
                <FlapCell
                  key={cellKey(ticket.id, 'id')}
                  delayMs={listDelay}
                  selected={selectedRow}
                  animate={idAnim.animate}
                >
                  #{ticket.id}
                </FlapCell>
                <FlapCell
                  key={cellKey(ticket.id, 'subject')}
                  delayMs={listDelay}
                  selected={selectedRow}
                  animate={subjectAnim.animate}
                  className="font-normal tracking-wide normal-case"
                >
                  {ticket.subject}
                </FlapCell>
                <FlapCell
                  key={cellKey(ticket.id, 'status')}
                  delayMs={listDelay}
                  selected={selectedRow}
                  animate={statusAnim.animate}
                >
                  <StatusColor status={ticket.status} />
                </FlapCell>
                <FlapCell
                  key={cellKey(ticket.id, 'priority')}
                  delayMs={listDelay}
                  selected={selectedRow}
                  animate={priorityAnim.animate}
                >
                  <PriorityColor
                    priority={ticket.priority === 'media' ? 'média' : ticket.priority}
                  />
                </FlapCell>
                <FlapCell
                  key={cellKey(ticket.id, 'agent')}
                  delayMs={listDelay}
                  selected={selectedRow}
                  animate={agentAnim.animate}
                >
                  {ticket.agentLabel}
                </FlapCell>
                <FlapCell
                  key={cellKey(ticket.id, 'time')}
                  delayMs={listDelay}
                  selected={selectedRow}
                  animate={timeAnim.animate}
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
                {unassigned ? '— não atribuído' : selected.agentLabel}
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
            disabled={busy || resolved}
            placeholder={`escrever resposta para ${selected.requester.split(' ')[0]}…`}
            className="mt-1.5 h-14 w-full resize-none rounded-[3px] border border-stroke bg-tile px-3 py-2.5 text-xs text-ink placeholder:text-dim disabled:opacity-50"
          />
          <label className="mt-2 flex items-center gap-2 text-[10.5px] tracking-wide text-dim uppercase">
            <input
              type="checkbox"
              checked={asNote}
              disabled={busy || resolved}
              onChange={(event) => setAsNote(event.target.checked)}
            />
            nota interna
          </label>
          <ActionBar>
            <ActionButton primary onClick={onReply}>
              {busy ? '…' : asNote ? 'anotar' : 'responder'}
            </ActionButton>
            {unassigned && !resolved ? (
              <ActionButton onClick={onClaim}>assumir</ActionButton>
            ) : (
              <ActionButton onClick={() => setTransferOpen((value) => !value)}>
                transferir
              </ActionButton>
            )}
            <ActionButton onClick={onClose}>encerrar</ActionButton>
          </ActionBar>
          {!resolved ? (
            <button
              type="button"
              disabled={busy}
              onClick={onWaiting}
              className="mt-2 w-full rounded-[3px] border border-stroke bg-board py-2 text-[10.5px] tracking-widest text-dim uppercase hover:border-amber hover:text-amber disabled:opacity-50"
            >
              aguardando cliente
            </button>
          ) : null}
          {transferOpen && !resolved ? (
            <div className="mt-3 rounded-[3px] border border-stroke bg-board p-2">
              <div className="mb-2 px-1 text-[10px] tracking-widest text-dim uppercase">
                transferir para técnico
              </div>
              {technicians.length === 0 ? (
                <div className="px-1 text-[11px] text-dim">
                  cadastre técnicos em Cadastros → usuários
                </div>
              ) : (
                technicians.map((tech) => (
                  <button
                    key={tech.id}
                    type="button"
                    disabled={busy}
                    onClick={() => void onTransferPick(tech.handle ?? null)}
                    className="mb-1 flex w-full items-center justify-between rounded-[3px] px-2 py-2 text-left text-[11.5px] hover:bg-tile"
                  >
                    <span>{tech.name}</span>
                    <span className="text-dim">{tech.handle}</span>
                  </button>
                ))
              )}
              <button
                type="button"
                disabled={busy}
                onClick={() => void onTransferPick(null)}
                className="mt-1 w-full rounded-[3px] border border-dashed border-stroke py-2 text-[10.5px] text-dim uppercase hover:border-amber hover:text-amber"
              >
                desatribuir
              </button>
            </div>
          ) : null}
        </DetailPanel>
      ) : null}
    </div>
  )
}
