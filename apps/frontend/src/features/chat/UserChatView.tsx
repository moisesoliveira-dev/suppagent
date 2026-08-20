import { useEffect, useMemo, useRef, useState } from 'react'
import {
  ActionBar,
  ActionButton,
  DetailPanel,
  PassLabel,
  PassSub,
  PassTitle,
  StubBar,
} from '../../shared/ui/chrome'
import { toast } from '../../shared/ui/toast'
import {
  claimTicket,
  closeTicket,
  deleteTicketMessage,
  editTicketMessage,
  forwardTicketMessage,
  listTickets,
  pinTicketMessage,
  reopenTicket,
  replyToTicket,
  transferTicket,
} from '../tickets/tickets-api'
import type { Ticket, TicketHistoryEntry } from '../tickets/tickets'
import { notifyTicketsChanged, onTicketsChanged } from '../tickets/tickets-ui'
import { listUsers } from '../users/users-api'
import type { User } from '../users/users'
import {
  consumeChatDraft,
  openTicketFocus,
  selectChatTicket,
  useShellNav,
} from '../shell/shell-nav'
import { CreateKnowledgeFromTicketDialog } from '../knowledge/CreateKnowledgeFromTicketDialog'

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}

function statusLabel(status: Ticket['status']) {
  if (status === 'andamento') return 'em andamento'
  return status
}

function lastPublicMessage(ticket: Ticket): TicketHistoryEntry | undefined {
  return [...ticket.history]
    .reverse()
    .find((entry) => !entry.note && !entry.deleted)
}

function isUnread(ticket: Ticket) {
  const last = lastPublicMessage(ticket)
  return Boolean(last && last.author === 'requester' && ticket.status !== 'resolvido')
}

function matchesChatSearch(ticket: Ticket, query: string) {
  const q = query.trim().toLowerCase()
  if (!q) return true
  const normalized = q.replace(/^#/, '')
  const haystack = [
    ticket.id,
    `#${ticket.id}`,
    ticket.requester,
    ticket.email,
    ticket.subject,
    ticket.category,
    lastPublicMessage(ticket)?.text ?? '',
  ]
    .join(' ')
    .toLowerCase()
  return haystack.includes(q) || haystack.includes(normalized)
}

export function UserChatView() {
  const { chatTicketId } = useShellNav()
  const [rows, setRows] = useState<Ticket[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [draft, setDraft] = useState('')
  const [chatSearch, setChatSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [technicians, setTechnicians] = useState<User[]>([])
  const [menuOpen, setMenuOpen] = useState(false)
  const [transferOpen, setTransferOpen] = useState(false)
  const [kbOpen, setKbOpen] = useState(false)
  const [replyTo, setReplyTo] = useState<TicketHistoryEntry | null>(null)
  const [messageMenuId, setMessageMenuId] = useState<string | null>(null)
  const [forwardMessageId, setForwardMessageId] = useState<string | null>(null)
  const threadRef = useRef<HTMLDivElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const selectedIdRef = useRef(selectedId)
  selectedIdRef.current = selectedId

  const filteredRows = useMemo(() => {
    const openRows = rows.filter((ticket) => ticket.status !== 'resolvido')
    const closedRows = rows.filter((ticket) => ticket.status === 'resolvido')
    return [...openRows, ...closedRows].filter((ticket) =>
      matchesChatSearch(ticket, chatSearch),
    )
  }, [rows, chatSearch])

  const selected =
    filteredRows.find((ticket) => ticket.id === selectedId) ??
    rows.find((ticket) => ticket.id === selectedId) ??
    null
  const resolved = selected?.status === 'resolvido'
  const unassigned = selected?.agent === 'livre'
  const pinned = selected?.history.filter((entry) => entry.pinned && !entry.deleted) ?? []
  const forwardTargets = rows.filter(
    (ticket) => ticket.id !== selected?.id && ticket.status !== 'resolvido',
  )

  async function load(preferredId?: string | null) {
    setLoading(true)
    setError(null)
    try {
      const data = await listTickets({
        filter: 'todos',
        page: 1,
        pageSize: 100,
      })
      setRows(data.items)
      const want = preferredId ?? chatTicketId ?? selectedIdRef.current
      const next =
        data.items.find((ticket) => ticket.id === want)?.id ??
        data.items.find((ticket) => ticket.status !== 'resolvido')?.id ??
        data.items[0]?.id ??
        null
      setSelectedId(next)
      if (next) selectChatTicket(next)
    } catch (err) {
      setRows([])
      setSelectedId(null)
      setError(err instanceof Error ? err.message : 'falha ao carregar chats')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load(chatTicketId)
    void listUsers('tecnico')
      .then((data) => setTechnicians(data.items.filter((user) => user.handle)))
      .catch(() => setTechnicians([]))
    return onTicketsChanged(() => {
      void load(selectedIdRef.current)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!chatTicketId) return
    if (rows.some((ticket) => ticket.id === chatTicketId)) {
      setSelectedId(chatTicketId)
    } else if (rows.length > 0) {
      void load(chatTicketId)
    }
    const seeded = consumeChatDraft()
    if (seeded) setDraft(seeded)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatTicketId])

  useEffect(() => {
    threadRef.current?.scrollTo({ top: threadRef.current.scrollHeight, behavior: 'smooth' })
  }, [selected?.history.length, selectedId])

  useEffect(() => {
    if (!menuOpen && !messageMenuId) return
    function onPointerDown(event: MouseEvent) {
      const target = event.target as Node
      if (menuRef.current && !menuRef.current.contains(target)) setMenuOpen(false)
      if (!(target as HTMLElement).closest?.('[data-msg-menu]')) {
        setMessageMenuId(null)
      }
    }
    document.addEventListener('mousedown', onPointerDown)
    return () => document.removeEventListener('mousedown', onPointerDown)
  }, [menuOpen, messageMenuId])

  function pickChat(ticket: Ticket) {
    setSelectedId(ticket.id)
    selectChatTicket(ticket.id)
    setDraft('')
    setReplyTo(null)
    setMenuOpen(false)
    setTransferOpen(false)
    setMessageMenuId(null)
    setForwardMessageId(null)
  }

  async function runAction(action: () => Promise<Ticket>, successMessage?: string) {
    if (!selected || busy) return
    setBusy(true)
    setError(null)
    try {
      const updated = await action()
      setDraft('')
      setReplyTo(null)
      setMenuOpen(false)
      setTransferOpen(false)
      setMessageMenuId(null)
      setForwardMessageId(null)
      await load(updated.id === selected.id ? updated.id : selected.id)
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

  function send() {
    const text = draft.trim()
    if (!text || !selected || resolved) return
    void runAction(
      () => replyToTicket(selected.id, text, false, replyTo?.id ?? null),
      'mensagem enviada',
    )
  }

  function onClaim() {
    if (!selected) return
    void runAction(() => claimTicket(selected.id), 'chamado assumido')
  }

  async function onClose() {
    if (!selected) return
    const ok = await toast.confirm({
      title: 'encerrar conversa',
      message: `encerrar o chamado nº ${selected.id}?`,
      confirmLabel: 'encerrar',
    })
    if (!ok) return
    void runAction(() => closeTicket(selected.id), 'conversa encerrada')
  }

  async function onReopen() {
    if (!selected) return
    const reason = await toast.prompt({
      title: 'reabrir chamado',
      message: `informe a justificativa para reabrir o nº ${selected.id}`,
      placeholder: 'ex.: cliente reportou o mesmo erro novamente',
      confirmLabel: 'reabrir',
    })
    if (reason == null) return
    const trimmed = reason.trim()
    if (!trimmed) {
      toast.error('justificativa é obrigatória')
      return
    }
    void runAction(() => reopenTicket(selected.id, trimmed), 'chamado reaberto')
  }

  async function onTransferPick(handle: string | null) {
    if (!selected) return
    void runAction(
      () => transferTicket(selected.id, handle),
      handle ? `transferido para ${handle}` : 'chamado desatribuído',
    )
  }

  async function onDeleteMessage(message: TicketHistoryEntry) {
    if (!selected) return
    const ok = await toast.confirm({
      title: 'apagar mensagem',
      message: 'apagar esta mensagem para todos nesta conversa?',
      confirmLabel: 'apagar',
    })
    if (!ok) return
    void runAction(
      () => deleteTicketMessage(selected.id, message.id),
      'mensagem apagada',
    )
  }

  async function onEditMessage(message: TicketHistoryEntry) {
    if (!selected || message.deleted) return
    const next = await toast.prompt({
      title: 'editar mensagem',
      message: 'altere o texto da mensagem',
      defaultValue: message.text,
      confirmLabel: 'salvar',
    })
    if (next == null) return
    const trimmed = next.trim()
    if (!trimmed) {
      toast.error('texto é obrigatório')
      return
    }
    void runAction(
      () => editTicketMessage(selected.id, message.id, trimmed),
      'mensagem editada',
    )
  }

  function onReplyMessage(message: TicketHistoryEntry) {
    if (message.deleted || message.note) return
    setReplyTo(message)
    setMessageMenuId(null)
  }

  function onPinMessage(message: TicketHistoryEntry) {
    if (!selected) return
    void runAction(
      () => pinTicketMessage(selected.id, message.id),
      message.pinned ? 'mensagem desafixada' : 'mensagem fixada',
    )
  }

  function onForwardPick(targetId: string) {
    if (!selected || !forwardMessageId) return
    void runAction(
      () => forwardTicketMessage(selected.id, forwardMessageId, targetId),
      'mensagem encaminhada',
    )
  }

  return (
    <div className="flex min-h-0 flex-1">
      <div className="flex w-[270px] shrink-0 flex-col border-r border-stroke bg-panel">
        <div className="shrink-0 border-b border-stroke px-3 py-3">
          <input
            value={chatSearch}
            onChange={(event) => setChatSearch(event.target.value)}
            placeholder="buscar conversa ou nº…"
            className="w-full rounded-[3px] border border-stroke bg-board px-3 py-2 text-[11.5px] text-ink placeholder:text-dim"
          />
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto">
          {loading && filteredRows.length === 0 ? (
            <div className="px-3.5 py-4 text-[11px] text-dim">carregando…</div>
          ) : null}
          {error ? <div className="px-3.5 py-4 text-[11px] text-red">{error}</div> : null}
          {!loading && filteredRows.length === 0 ? (
            <div className="px-3.5 py-4 text-[11px] text-dim">
              {chatSearch ? 'nenhuma conversa encontrada' : 'nenhuma conversa'}
            </div>
          ) : null}
          {filteredRows.map((item) => {
            const active = selected?.id === item.id
            const last = lastPublicMessage(item)
            const unread = isUnread(item)
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => pickChat(item)}
                className={`relative flex w-full gap-2.5 border-b border-l-2 border-stroke px-3.5 py-3 text-left ${
                  active ? 'border-l-amber bg-tile' : 'border-l-transparent hover:bg-tile'
                }`}
              >
                <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-[3px] border border-stroke bg-board text-[11px] font-bold text-amber">
                  {initials(item.requester)}
                  <span
                    className={`absolute -right-px -bottom-px h-[7px] w-[7px] rounded-full border-2 border-panel ${
                      item.status === 'resolvido' ? 'bg-dim' : 'bg-green'
                    }`}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="mb-0.5 flex justify-between gap-2">
                    <span className="truncate text-xs font-bold">{item.requester}</span>
                    <span className="shrink-0 text-[10px] text-dim">{item.time}</span>
                  </div>
                  <div className="truncate text-[11px] text-dim">
                    #{item.id} · {last?.deleted ? 'mensagem apagada' : last?.text ?? item.subject}
                  </div>
                </div>
                {unread ? (
                  <span className="absolute top-[15px] right-3 h-[7px] w-[7px] rounded-full bg-amber" />
                ) : null}
              </button>
            )
          })}
        </div>
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        {selected ? (
          <>
            <div className="flex shrink-0 items-center justify-between border-b border-stroke bg-panel px-5 py-3.5">
              <div className="min-w-0">
                <div className="truncate text-[13.5px] font-bold">{selected.requester}</div>
                <div className="mt-0.5 truncate text-[11px] text-dim">
                  #{selected.id} · {statusLabel(selected.status)} · {selected.subject}
                </div>
              </div>
              <div className="relative shrink-0" ref={menuRef}>
                <button
                  type="button"
                  aria-label="mais opções"
                  disabled={busy}
                  onClick={() => {
                    setMenuOpen((value) => !value)
                    setTransferOpen(false)
                  }}
                  className="flex h-9 w-9 items-center justify-center rounded-full text-dim hover:bg-tile hover:text-ink disabled:opacity-50"
                >
                  <span className="flex flex-col gap-[3px]" aria-hidden>
                    <span className="block h-[3px] w-[3px] rounded-full bg-current" />
                    <span className="block h-[3px] w-[3px] rounded-full bg-current" />
                    <span className="block h-[3px] w-[3px] rounded-full bg-current" />
                  </span>
                </button>
                {menuOpen ? (
                  <div className="absolute top-full right-0 z-20 mt-1 min-w-[200px] rounded-[3px] border border-stroke bg-panel py-1 shadow-lg">
                    {!resolved && unassigned ? (
                      <button
                        type="button"
                        disabled={busy}
                        onClick={onClaim}
                        className="block w-full px-3.5 py-2.5 text-left text-[12px] hover:bg-tile"
                      >
                        assumir
                      </button>
                    ) : null}
                    {!resolved && !unassigned ? (
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => {
                          setTransferOpen(true)
                          setMenuOpen(false)
                        }}
                        className="block w-full px-3.5 py-2.5 text-left text-[12px] hover:bg-tile"
                      >
                        transferir
                      </button>
                    ) : null}
                    {!resolved ? (
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => {
                          setMenuOpen(false)
                          void onClose()
                        }}
                        className="block w-full px-3.5 py-2.5 text-left text-[12px] hover:bg-tile"
                      >
                        encerrar conversa
                      </button>
                    ) : null}
                    {resolved ? (
                      <>
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => {
                            setMenuOpen(false)
                            void onReopen()
                          }}
                          className="block w-full px-3.5 py-2.5 text-left text-[12px] hover:bg-tile"
                        >
                          reabrir chamado
                        </button>
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => {
                            setMenuOpen(false)
                            setKbOpen(true)
                          }}
                          className="block w-full px-3.5 py-2.5 text-left text-[12px] hover:bg-tile"
                        >
                          criar na base
                        </button>
                      </>
                    ) : null}
                  </div>
                ) : null}
              </div>
            </div>

            {transferOpen && !resolved ? (
              <div className="shrink-0 border-b border-stroke bg-board px-5 py-2">
                <div className="mb-1 text-[10px] tracking-widest text-dim uppercase">
                  transferir para técnico
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {technicians.map((tech) => (
                    <button
                      key={tech.id}
                      type="button"
                      disabled={busy}
                      onClick={() => void onTransferPick(tech.handle ?? null)}
                      className="rounded-[3px] border border-stroke px-2 py-1 text-[11px] hover:border-amber"
                    >
                      {tech.handle}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            {pinned.length > 0 ? (
              <div className="shrink-0 border-b border-stroke bg-board px-5 py-2">
                <div className="mb-1 text-[10px] tracking-widest text-dim uppercase">fixadas</div>
                <div className="flex max-h-24 flex-col gap-1 overflow-y-auto">
                  {pinned.map((entry) => (
                    <button
                      key={entry.id}
                      type="button"
                      onClick={() =>
                        document
                          .getElementById(`msg-${entry.id}`)
                          ?.scrollIntoView({ behavior: 'smooth', block: 'center' })
                      }
                      className="truncate text-left text-[11.5px] text-amber hover:underline"
                    >
                      {entry.text}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            {forwardMessageId ? (
              <div className="shrink-0 border-b border-stroke bg-board px-5 py-2">
                <div className="mb-2 flex items-center justify-between">
                  <div className="text-[10px] tracking-widest text-dim uppercase">
                    encaminhar para
                  </div>
                  <button
                    type="button"
                    className="text-[10px] text-dim uppercase hover:text-amber"
                    onClick={() => setForwardMessageId(null)}
                  >
                    cancelar
                  </button>
                </div>
                <div className="flex max-h-28 flex-col gap-1 overflow-y-auto">
                  {forwardTargets.length === 0 ? (
                    <div className="text-[11px] text-dim">nenhuma outra conversa aberta</div>
                  ) : (
                    forwardTargets.map((ticket) => (
                      <button
                        key={ticket.id}
                        type="button"
                        disabled={busy}
                        onClick={() => onForwardPick(ticket.id)}
                        className="rounded-[3px] border border-stroke px-2 py-1.5 text-left text-[11.5px] hover:border-amber"
                      >
                        #{ticket.id} · {ticket.requester}
                      </button>
                    ))
                  )}
                </div>
              </div>
            ) : null}

            <div ref={threadRef} className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
              {selected.history.map((message) => {
                if (message.note) {
                  return (
                    <div
                      key={message.id}
                      id={`msg-${message.id}`}
                      className="mb-3 text-center text-[11px] text-amber"
                    >
                      <span className="mr-2 text-dim">{message.time}</span>
                      {message.text}
                    </div>
                  )
                }
                const role = message.author === 'agent' ? 'agent' : 'user'
                const mark = initials(message.authorName || selected.requester)
                return (
                  <div
                    key={message.id}
                    id={`msg-${message.id}`}
                    className={`group relative mb-3.5 flex max-w-[78%] ${
                      role === 'agent' ? 'ml-auto flex-row-reverse' : 'mr-auto'
                    }`}
                  >
                    <div
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-[3px] border border-stroke bg-board text-[9.5px] font-bold text-amber ${
                        role === 'agent' ? 'ml-2' : 'mr-2'
                      }`}
                    >
                      {mark}
                    </div>
                    <div
                      className={`min-w-0 rounded-md px-3 py-2 text-[12.5px] leading-relaxed ${
                        message.deleted
                          ? 'border border-dashed border-stroke bg-board italic text-dim'
                          : role === 'agent'
                            ? 'bg-amber text-amber-ink'
                            : 'border border-stroke bg-tile'
                      }`}
                    >
                      {message.forwarded && !message.deleted ? (
                        <div
                          className={`mb-1 text-[10px] uppercase ${
                            role === 'agent' ? 'text-amber-ink/70' : 'text-dim'
                          }`}
                        >
                          encaminhada · {message.forwardedFromName}
                        </div>
                      ) : null}
                      {message.replyToId && !message.deleted ? (
                        <div
                          className={`mb-1.5 border-l-2 px-2 py-1 text-[11px] ${
                            role === 'agent'
                              ? 'border-amber-ink/40 bg-amber-ink/10 text-amber-ink/80'
                              : 'border-amber bg-board text-dim'
                          }`}
                        >
                          <div className="font-bold">
                            {message.replyToAuthorName ?? 'mensagem'}
                          </div>
                          <div className="truncate">{message.replyToText}</div>
                        </div>
                      ) : null}
                      {message.deleted ? 'mensagem apagada' : message.text}
                      {!message.deleted && message.edited ? (
                        <span
                          className={`ml-2 text-[10px] ${
                            role === 'agent' ? 'text-amber-ink/60' : 'text-dim'
                          }`}
                        >
                          editada
                        </span>
                      ) : null}
                    </div>
                    {!resolved && !message.deleted ? (
                      <div className="relative self-center" data-msg-menu>
                        <button
                          type="button"
                          aria-label="ações da mensagem"
                          className={`mx-1 flex h-7 w-7 items-center justify-center rounded-full text-dim opacity-0 hover:bg-tile hover:text-ink group-hover:opacity-100 ${
                            messageMenuId === message.id ? 'opacity-100' : ''
                          }`}
                          onClick={() =>
                            setMessageMenuId((current) =>
                              current === message.id ? null : message.id,
                            )
                          }
                        >
                          <span className="flex flex-col gap-[2px]" aria-hidden>
                            <span className="block h-[2px] w-[2px] rounded-full bg-current" />
                            <span className="block h-[2px] w-[2px] rounded-full bg-current" />
                            <span className="block h-[2px] w-[2px] rounded-full bg-current" />
                          </span>
                        </button>
                        {messageMenuId === message.id ? (
                          <div
                            className={`absolute z-20 top-full mt-1 min-w-[160px] rounded-[3px] border border-stroke bg-panel py-1 shadow-lg ${
                              role === 'agent' ? 'right-0' : 'left-0'
                            }`}
                          >
                            <button
                              type="button"
                              className="block w-full px-3 py-2 text-left text-[11.5px] hover:bg-tile"
                              onClick={() => onReplyMessage(message)}
                            >
                              responder
                            </button>
                            {message.author === 'agent' ? (
                              <button
                                type="button"
                                className="block w-full px-3 py-2 text-left text-[11.5px] hover:bg-tile"
                                onClick={() => void onEditMessage(message)}
                              >
                                editar
                              </button>
                            ) : null}
                            <button
                              type="button"
                              className="block w-full px-3 py-2 text-left text-[11.5px] hover:bg-tile"
                              onClick={() => onPinMessage(message)}
                            >
                              {message.pinned ? 'desafixar' : 'fixar'}
                            </button>
                            <button
                              type="button"
                              className="block w-full px-3 py-2 text-left text-[11.5px] hover:bg-tile"
                              onClick={() => {
                                setForwardMessageId(message.id)
                                setMessageMenuId(null)
                              }}
                            >
                              encaminhar
                            </button>
                            <button
                              type="button"
                              className="block w-full px-3 py-2 text-left text-[11.5px] text-red hover:bg-tile"
                              onClick={() => void onDeleteMessage(message)}
                            >
                              apagar
                            </button>
                          </div>
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                )
              })}
            </div>

            {replyTo ? (
              <div className="flex shrink-0 items-center justify-between border-t border-stroke bg-board px-5 py-2">
                <div className="min-w-0 border-l-2 border-amber pl-2">
                  <div className="text-[10px] tracking-widest text-dim uppercase">
                    respondendo {replyTo.authorName}
                  </div>
                  <div className="truncate text-[11.5px]">{replyTo.text}</div>
                </div>
                <button
                  type="button"
                  className="ml-3 text-[10px] text-dim uppercase hover:text-amber"
                  onClick={() => setReplyTo(null)}
                >
                  cancelar
                </button>
              </div>
            ) : null}

            <div className="flex shrink-0 gap-2 border-t border-stroke bg-panel px-5 py-3.5">
              <textarea
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && !event.shiftKey) {
                    event.preventDefault()
                    send()
                  }
                }}
                disabled={busy || resolved}
                placeholder={
                  resolved
                    ? 'conversa encerrada'
                    : `escrever uma mensagem para ${selected.requester.split(' ')[0]}…`
                }
                className="h-10 flex-1 resize-none rounded border border-stroke bg-tile px-3 py-2.5 text-[12.5px] text-ink disabled:opacity-50"
              />
              <button
                type="button"
                onClick={send}
                disabled={busy || resolved || !draft.trim()}
                className="rounded-[3px] bg-amber px-4 text-[11px] font-bold text-amber-ink uppercase disabled:opacity-50"
              >
                enviar
              </button>
            </div>
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center text-[12px] text-dim">
            selecione uma conversa
          </div>
        )}
      </div>

      {selected ? (
        <DetailPanel>
          <PassLabel>
            cliente · {selected.category} · {statusLabel(selected.status)}
          </PassLabel>
          <PassTitle>{selected.requester}</PassTitle>
          <PassSub>{selected.email}</PassSub>
          <StubBar />
          <div className="mb-4 flex items-center justify-between rounded border border-stroke bg-board px-3 py-2.5 text-[11.5px]">
            <span className="text-dim">chamado vinculado</span>
            <b className="text-amber">
              #{selected.id} — {statusLabel(selected.status)}
            </b>
          </div>
          <div className="mb-4 text-[12px] leading-relaxed text-dim">{selected.subject}</div>
          <ActionBar>
            <ActionButton primary onClick={() => openTicketFocus(selected.id)}>
              ver chamado vinculado
            </ActionButton>
            {resolved ? (
              <ActionButton onClick={() => setKbOpen(true)}>
                criar na base de conhecimento
              </ActionButton>
            ) : null}
          </ActionBar>
        </DetailPanel>
      ) : null}
      {kbOpen && selected && resolved ? (
        <CreateKnowledgeFromTicketDialog
          ticket={selected}
          onClose={() => setKbOpen(false)}
        />
      ) : null}
    </div>
  )
}
