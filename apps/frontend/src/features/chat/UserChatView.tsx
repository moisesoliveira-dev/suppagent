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
import { showContextMenu, type ContextMenuItem } from '../../shared/ui/context-menu'
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
import {
  CURRENT_AGENT,
  type Ticket,
  type TicketHistoryEntry,
} from '../tickets/tickets'
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
import { ForwardChatModal, type ForwardTarget } from './ForwardChatModal'
import {
  deleteTeamChatMessage,
  editTeamChatMessage,
  forwardTeamMessage,
  forwardTicketMessageToTeam,
  listTeamChats,
  pinTeamChatMessage,
  postTeamChatMessage,
  type TeamChatMessage,
  type TeamChatSummary,
} from './team-chat-api'

type ChatCategory = 'chamados' | 'equipe'
type SelectedChat =
  | { type: 'ticket'; id: string }
  | { type: 'team'; id: string }

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

export function matchesChatSearch(ticket: Ticket, query: string) {
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

export function matchesTeamSearch(chat: TeamChatSummary, query: string) {
  const q = query.trim().toLowerCase()
  if (!q) return true
  return [chat.id, chat.name, chat.snippet, chat.kind]
    .join(' ')
    .toLowerCase()
    .includes(q)
}

function pinnedLabel(entry: { text: string; authorName: string; pinnedTime?: string; time: string }) {
  return `${entry.text} · ${entry.authorName} · ${entry.pinnedTime ?? entry.time}`
}

export function UserChatView() {
  const { chatTicketId } = useShellNav()
  const [category, setCategory] = useState<ChatCategory>('chamados')
  const [ticketRows, setTicketRows] = useState<Ticket[]>([])
  const [teamRows, setTeamRows] = useState<TeamChatSummary[]>([])
  const [selected, setSelected] = useState<SelectedChat | null>(null)
  const [draft, setDraft] = useState('')
  const [chatSearch, setChatSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [technicians, setTechnicians] = useState<User[]>([])
  const [menuOpen, setMenuOpen] = useState(false)
  const [transferOpen, setTransferOpen] = useState(false)
  const [kbOpen, setKbOpen] = useState(false)
  const [replyTo, setReplyTo] = useState<TicketHistoryEntry | TeamChatMessage | null>(null)
  const [forwardMessageId, setForwardMessageId] = useState<string | null>(null)
  const threadRef = useRef<HTMLDivElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const selectedRef = useRef(selected)
  selectedRef.current = selected

  const filteredTickets = useMemo(() => {
    const openRows = ticketRows.filter((ticket) => ticket.status !== 'resolvido')
    const closedRows = ticketRows.filter((ticket) => ticket.status === 'resolvido')
    return [...openRows, ...closedRows].filter((ticket) =>
      matchesChatSearch(ticket, chatSearch),
    )
  }, [ticketRows, chatSearch])

  const filteredTeams = useMemo(
    () => teamRows.filter((chat) => matchesTeamSearch(chat, chatSearch)),
    [teamRows, chatSearch],
  )

  const selectedTicket =
    selected?.type === 'ticket'
      ? (ticketRows.find((ticket) => ticket.id === selected.id) ?? null)
      : null
  const selectedTeam =
    selected?.type === 'team'
      ? (teamRows.find((chat) => chat.id === selected.id) ?? null)
      : null

  const resolved = selectedTicket?.status === 'resolvido'
  const unassigned = selectedTicket?.agent === 'livre'
  const ticketPinned =
    selectedTicket?.history.filter((entry) => entry.pinned && !entry.deleted) ?? []
  const teamPinned =
    selectedTeam?.messages.filter((entry) => entry.pinned && !entry.deleted) ?? []

  const forwardTargets = useMemo((): ForwardTarget[] => {
    const tickets = ticketRows
      .filter(
        (ticket) =>
          ticket.status !== 'resolvido' &&
          !(selected?.type === 'ticket' && selected.id === ticket.id),
      )
      .map((ticket) => ({
        id: ticket.id,
        kind: 'ticket' as const,
        title: ticket.requester,
        subtitle: `#${ticket.id} · ${ticket.subject}`,
      }))
    const teams = teamRows
      .filter((chat) => !(selected?.type === 'team' && selected.id === chat.id))
      .map((chat) => ({
        id: chat.id,
        kind: 'team' as const,
        title: chat.name,
        subtitle: chat.kind === 'direct' ? 'direto' : 'canal',
      }))
    return [...tickets, ...teams]
  }, [ticketRows, teamRows, selected])

  async function load(preferred?: SelectedChat | null) {
    setLoading(true)
    setError(null)
    try {
      const [ticketsData, teamsData] = await Promise.all([
        listTickets({ filter: 'todos', page: 1, pageSize: 100 }),
        listTeamChats(),
      ])
      setTicketRows(ticketsData.items)
      setTeamRows(teamsData.items)

      const want = preferred ?? selectedRef.current
      if (want?.type === 'ticket' && ticketsData.items.some((t) => t.id === want.id)) {
        setSelected(want)
        selectChatTicket(want.id)
        return
      }
      if (want?.type === 'team' && teamsData.items.some((t) => t.id === want.id)) {
        setSelected(want)
        return
      }

      if (chatTicketId && ticketsData.items.some((t) => t.id === chatTicketId)) {
        setCategory('chamados')
        setSelected({ type: 'ticket', id: chatTicketId })
        selectChatTicket(chatTicketId)
        return
      }

      const firstOpen =
        ticketsData.items.find((ticket) => ticket.status !== 'resolvido')?.id ??
        ticketsData.items[0]?.id ??
        null
      if (firstOpen) {
        setCategory('chamados')
        setSelected({ type: 'ticket', id: firstOpen })
        selectChatTicket(firstOpen)
        return
      }

      const firstTeam = teamsData.items[0]?.id ?? null
      if (firstTeam) {
        setCategory('equipe')
        setSelected({ type: 'team', id: firstTeam })
        return
      }

      setSelected(null)
    } catch (err) {
      setTicketRows([])
      setTeamRows([])
      setSelected(null)
      setError(err instanceof Error ? err.message : 'falha ao carregar chats')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load(
      chatTicketId ? { type: 'ticket', id: chatTicketId } : selectedRef.current,
    )
    void listUsers('tecnico')
      .then((data) => setTechnicians(data.items.filter((user) => user.handle)))
      .catch(() => setTechnicians([]))
    return onTicketsChanged(() => {
      void load(selectedRef.current)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!chatTicketId) return
    setCategory('chamados')
    if (ticketRows.some((ticket) => ticket.id === chatTicketId)) {
      setSelected({ type: 'ticket', id: chatTicketId })
    } else if (ticketRows.length > 0 || teamRows.length > 0) {
      void load({ type: 'ticket', id: chatTicketId })
    }
    const seeded = consumeChatDraft()
    if (seeded) setDraft(seeded)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatTicketId])

  useEffect(() => {
    threadRef.current?.scrollTo({
      top: threadRef.current.scrollHeight,
      behavior: 'smooth',
    })
  }, [
    selectedTicket?.history.length,
    selectedTeam?.messages.length,
    selected?.id,
    selected?.type,
  ])

  useEffect(() => {
    if (!menuOpen) return
    function onPointerDown(event: MouseEvent) {
      const target = event.target as Node
      if (menuRef.current && !menuRef.current.contains(target)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', onPointerDown)
    return () => document.removeEventListener('mousedown', onPointerDown)
  }, [menuOpen])

  function resetComposer() {
    setDraft('')
    setReplyTo(null)
    setMenuOpen(false)
    setTransferOpen(false)
    setForwardMessageId(null)
  }

  function pickTicket(ticket: Ticket) {
    setSelected({ type: 'ticket', id: ticket.id })
    selectChatTicket(ticket.id)
    resetComposer()
  }

  function pickTeam(chat: TeamChatSummary) {
    setSelected({ type: 'team', id: chat.id })
    resetComposer()
  }

  function switchCategory(next: ChatCategory) {
    setCategory(next)
    setChatSearch('')
    setMenuOpen(false)
    setTransferOpen(false)
    setForwardMessageId(null)
    setReplyTo(null)
    if (next === 'chamados') {
      const keep =
        selected?.type === 'ticket'
          ? selected.id
          : (ticketRows.find((t) => t.status !== 'resolvido')?.id ??
            ticketRows[0]?.id ??
            null)
      if (keep) {
        setSelected({ type: 'ticket', id: keep })
        selectChatTicket(keep)
      } else {
        setSelected(null)
      }
    } else {
      const keep =
        selected?.type === 'team'
          ? selected.id
          : (teamRows[0]?.id ?? null)
      setSelected(keep ? { type: 'team', id: keep } : null)
    }
  }

  async function runTicketAction(
    action: () => Promise<Ticket>,
    successMessage?: string,
  ) {
    if (!selectedTicket || busy) return
    setBusy(true)
    setError(null)
    try {
      const updated = await action()
      resetComposer()
      await load({ type: 'ticket', id: updated.id })
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

  async function runTeamAction(
    action: () => Promise<TeamChatSummary | { ok: true }>,
    successMessage?: string,
  ) {
    if (!selectedTeam || busy) return
    setBusy(true)
    setError(null)
    try {
      const updated = await action()
      resetComposer()
      if ('id' in updated) {
        setTeamRows((rows) =>
          rows.map((row) => (row.id === updated.id ? updated : row)),
        )
        setSelected({ type: 'team', id: updated.id })
      } else {
        await load({ type: 'team', id: selectedTeam.id })
      }
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
    if (!text || busy) return
    if (selectedTicket) {
      if (resolved) return
      void runTicketAction(
        () => replyToTicket(selectedTicket.id, text, false, replyTo?.id ?? null),
        'mensagem enviada',
      )
      return
    }
    if (selectedTeam) {
      void runTeamAction(
        () => postTeamChatMessage(selectedTeam.id, text, replyTo?.id ?? null),
        'mensagem enviada',
      )
    }
  }

  function onClaim() {
    if (!selectedTicket) return
    void runTicketAction(() => claimTicket(selectedTicket.id), 'chamado assumido')
  }

  async function onClose() {
    if (!selectedTicket) return
    const ok = await toast.confirm({
      title: 'encerrar conversa',
      message: `encerrar o chamado nº ${selectedTicket.id}?`,
      confirmLabel: 'encerrar',
    })
    if (!ok) return
    void runTicketAction(() => closeTicket(selectedTicket.id), 'conversa encerrada')
  }

  async function onReopen() {
    if (!selectedTicket) return
    const reason = await toast.prompt({
      title: 'reabrir chamado',
      message: `informe a justificativa para reabrir o nº ${selectedTicket.id}`,
      placeholder: 'ex.: cliente reportou o mesmo erro novamente',
      confirmLabel: 'reabrir',
    })
    if (reason == null) return
    const trimmed = reason.trim()
    if (!trimmed) {
      toast.error('justificativa é obrigatória')
      return
    }
    void runTicketAction(
      () => reopenTicket(selectedTicket.id, trimmed),
      'chamado reaberto',
    )
  }

  async function onTransferPick(handle: string | null) {
    if (!selectedTicket) return
    void runTicketAction(
      () => transferTicket(selectedTicket.id, handle),
      handle ? `transferido para ${handle}` : 'chamado desatribuído',
    )
  }

  async function onDeleteTicketMessage(message: TicketHistoryEntry) {
    if (!selectedTicket) return
    const ok = await toast.confirm({
      title: 'apagar mensagem',
      message: 'apagar esta mensagem para todos nesta conversa?',
      confirmLabel: 'apagar',
    })
    if (!ok) return
    void runTicketAction(
      () => deleteTicketMessage(selectedTicket.id, message.id),
      'mensagem apagada',
    )
  }

  async function onDeleteTeamMessage(message: TeamChatMessage) {
    if (!selectedTeam) return
    const ok = await toast.confirm({
      title: 'apagar mensagem',
      message: 'apagar esta mensagem para todos nesta conversa?',
      confirmLabel: 'apagar',
    })
    if (!ok) return
    void runTeamAction(
      () => deleteTeamChatMessage(selectedTeam.id, message.id),
      'mensagem apagada',
    )
  }

  async function onEditTicketMessage(message: TicketHistoryEntry) {
    if (!selectedTicket || message.deleted) return
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
    void runTicketAction(
      () => editTicketMessage(selectedTicket.id, message.id, trimmed),
      'mensagem editada',
    )
  }

  async function onEditTeamMessage(message: TeamChatMessage) {
    if (!selectedTeam || message.deleted) return
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
    void runTeamAction(
      () => editTeamChatMessage(selectedTeam.id, message.id, trimmed),
      'mensagem editada',
    )
  }

  function onPinTicketMessage(message: TicketHistoryEntry) {
    if (!selectedTicket) return
    void runTicketAction(
      () => pinTicketMessage(selectedTicket.id, message.id),
      message.pinned ? 'mensagem desafixada' : 'mensagem fixada',
    )
  }

  function onPinTeamMessage(message: TeamChatMessage) {
    if (!selectedTeam) return
    void runTeamAction(
      () => pinTeamChatMessage(selectedTeam.id, message.id),
      message.pinned ? 'mensagem desafixada' : 'mensagem fixada',
    )
  }

  function openForward(messageId: string) {
    setForwardMessageId(messageId)
  }

  async function onForwardConfirm(target: ForwardTarget) {
    if (!forwardMessageId || !selected || busy) return
    const messageId = forwardMessageId
    const source = selected

    if (source.type === 'ticket' && target.kind === 'ticket') {
      void runTicketAction(
        () => forwardTicketMessage(source.id, messageId, target.id),
        'mensagem encaminhada',
      )
      return
    }

    if (source.type === 'ticket' && target.kind === 'team') {
      setBusy(true)
      setError(null)
      try {
        await forwardTicketMessageToTeam(target.id, source.id, messageId)
        resetComposer()
        await load({ type: 'ticket', id: source.id })
        notifyTicketsChanged()
        toast.success('mensagem encaminhada')
      } catch (err) {
        const message = err instanceof Error ? err.message : 'falha na ação'
        setError(message)
        toast.error(message)
      } finally {
        setBusy(false)
      }
      return
    }

    if (source.type === 'team') {
      void runTeamAction(
        () =>
          forwardTeamMessage(source.id, messageId, {
            targetTeamChatId: target.kind === 'team' ? target.id : undefined,
            targetTicketId: target.kind === 'ticket' ? target.id : undefined,
          }),
        'mensagem encaminhada',
      )
    }
  }

  function ticketMessageMenuItems(message: TicketHistoryEntry): ContextMenuItem[] {
    if (resolved || message.deleted || message.note) return []
    const items: ContextMenuItem[] = [
      {
        id: 'reply',
        label: 'responder',
        onSelect: () => setReplyTo(message),
      },
    ]
    if (message.author === 'agent') {
      items.push({
        id: 'edit',
        label: 'editar',
        onSelect: () => void onEditTicketMessage(message),
      })
    }
    items.push(
      {
        id: 'pin',
        label: message.pinned ? 'desafixar' : 'fixar',
        onSelect: () => onPinTicketMessage(message),
      },
      {
        id: 'forward',
        label: 'encaminhar',
        onSelect: () => openForward(message.id),
      },
      {
        id: 'delete',
        label: 'apagar',
        danger: true,
        onSelect: () => void onDeleteTicketMessage(message),
      },
    )
    return items
  }

  function teamMessageMenuItems(message: TeamChatMessage): ContextMenuItem[] {
    if (message.deleted) return []
    const items: ContextMenuItem[] = [
      {
        id: 'reply',
        label: 'responder',
        onSelect: () => setReplyTo(message),
      },
      {
        id: 'edit',
        label: 'editar',
        onSelect: () => void onEditTeamMessage(message),
      },
      {
        id: 'pin',
        label: message.pinned ? 'desafixar' : 'fixar',
        onSelect: () => onPinTeamMessage(message),
      },
      {
        id: 'forward',
        label: 'encaminhar',
        onSelect: () => openForward(message.id),
      },
      {
        id: 'delete',
        label: 'apagar',
        danger: true,
        onSelect: () => void onDeleteTeamMessage(message),
      },
    ]
    return items
  }

  function renderMessageBubble(opts: {
    message: TicketHistoryEntry | TeamChatMessage
    mark: string
    mine: boolean
    menuItems: ContextMenuItem[]
  }) {
    const { message, mark, mine, menuItems } = opts
    return (
      <div
        key={message.id}
        id={`msg-${message.id}`}
        className={`mb-3.5 flex max-w-[78%] ${mine ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
      >
        <div
          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-[3px] border border-stroke bg-board text-[9.5px] font-bold text-amber ${
            mine ? 'ml-2' : 'mr-2'
          }`}
        >
          {mark}
        </div>
        <div
          data-ctx="1"
          onContextMenu={(event) => {
            if (menuItems.length === 0) return
            showContextMenu(event, menuItems)
          }}
          className={`min-w-0 rounded-md px-3 py-2 text-[12.5px] leading-relaxed ${
            message.deleted
              ? 'border border-dashed border-stroke bg-board italic text-dim'
              : mine
                ? 'bg-amber text-amber-ink'
                : 'border border-stroke bg-tile'
          }`}
        >
          {message.forwarded && !message.deleted ? (
            <div
              className={`mb-1 text-[10px] uppercase ${
                mine ? 'text-amber-ink/70' : 'text-dim'
              }`}
            >
              encaminhada · {message.forwardedFromName}
            </div>
          ) : null}
          {message.replyToId && !message.deleted ? (
            <div
              className={`mb-1.5 border-l-2 px-2 py-1 text-[11px] ${
                mine
                  ? 'border-amber-ink/40 bg-amber-ink/10 text-amber-ink/80'
                  : 'border-amber bg-board text-dim'
              }`}
            >
              <div className="font-bold">{message.replyToAuthorName ?? 'mensagem'}</div>
              <div className="truncate">{message.replyToText}</div>
            </div>
          ) : null}
          {message.deleted ? 'mensagem apagada' : message.text}
          {!message.deleted && message.edited ? (
            <span
              className={`ml-2 text-[10px] ${mine ? 'text-amber-ink/60' : 'text-dim'}`}
            >
              editada
            </span>
          ) : null}
        </div>
      </div>
    )
  }

  const listEmptyLabel =
    category === 'chamados'
      ? chatSearch
        ? 'nenhuma conversa encontrada'
        : 'nenhuma conversa'
      : chatSearch
        ? 'nenhum bate-papo encontrado'
        : 'nenhum bate-papo'

  return (
    <div className="flex min-h-0 flex-1">
      <div className="flex w-[270px] shrink-0 flex-col border-r border-stroke bg-panel">
        <div className="shrink-0 border-b border-stroke px-3 pt-3 pb-2">
          <div className="mb-2 flex gap-1">
            {(
              [
                ['chamados', 'chamados'],
                ['equipe', 'equipe'],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => switchCategory(id)}
                className={`flex-1 rounded-[3px] border px-2 py-1.5 text-[10.5px] tracking-wide uppercase ${
                  category === id
                    ? 'border-amber bg-tile text-amber'
                    : 'border-stroke text-dim hover:text-ink'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <input
            value={chatSearch}
            onChange={(event) => setChatSearch(event.target.value)}
            placeholder={
              category === 'chamados'
                ? 'buscar conversa ou nº…'
                : 'buscar bate-papo…'
            }
            className="w-full rounded-[3px] border border-stroke bg-board px-3 py-2 text-[11.5px] text-ink placeholder:text-dim"
          />
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto">
          {loading &&
          ((category === 'chamados' && filteredTickets.length === 0) ||
            (category === 'equipe' && filteredTeams.length === 0)) ? (
            <div className="px-3.5 py-4 text-[11px] text-dim">carregando…</div>
          ) : null}
          {error ? <div className="px-3.5 py-4 text-[11px] text-red">{error}</div> : null}
          {category === 'chamados' ? (
            <>
              {!loading && filteredTickets.length === 0 ? (
                <div className="px-3.5 py-4 text-[11px] text-dim">{listEmptyLabel}</div>
              ) : null}
              {filteredTickets.map((item) => {
                const active =
                  selected?.type === 'ticket' && selected.id === item.id
                const last = lastPublicMessage(item)
                const unread = isUnread(item)
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => pickTicket(item)}
                    className={`relative flex w-full gap-2.5 border-b border-l-2 border-stroke px-3.5 py-3 text-left ${
                      active
                        ? 'border-l-amber bg-tile'
                        : 'border-l-transparent hover:bg-tile'
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
                        #{item.id} ·{' '}
                        {last?.deleted
                          ? 'mensagem apagada'
                          : (last?.text ?? item.subject)}
                      </div>
                    </div>
                    {unread ? (
                      <span className="absolute top-[15px] right-3 h-[7px] w-[7px] rounded-full bg-amber" />
                    ) : null}
                  </button>
                )
              })}
            </>
          ) : (
            <>
              {!loading && filteredTeams.length === 0 ? (
                <div className="px-3.5 py-4 text-[11px] text-dim">{listEmptyLabel}</div>
              ) : null}
              {filteredTeams.map((item) => {
                const active = selected?.type === 'team' && selected.id === item.id
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => pickTeam(item)}
                    className={`relative flex w-full gap-2.5 border-b border-l-2 border-stroke px-3.5 py-3 text-left ${
                      active
                        ? 'border-l-amber bg-tile'
                        : 'border-l-transparent hover:bg-tile'
                    }`}
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[3px] border border-stroke bg-board text-[11px] font-bold text-amber">
                      {initials(item.name)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="mb-0.5 flex justify-between gap-2">
                        <span className="truncate text-xs font-bold">{item.name}</span>
                        <span className="shrink-0 text-[10px] text-dim">{item.time}</span>
                      </div>
                      <div className="truncate text-[11px] text-dim">{item.snippet}</div>
                    </div>
                  </button>
                )
              })}
            </>
          )}
        </div>
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        {selectedTicket ? (
          <>
            <div className="flex shrink-0 items-center justify-between border-b border-stroke bg-panel px-5 py-3.5">
              <div className="min-w-0">
                <div className="truncate text-[13.5px] font-bold">
                  {selectedTicket.requester}
                </div>
                <div className="mt-0.5 truncate text-[11px] text-dim">
                  #{selectedTicket.id} · {statusLabel(selectedTicket.status)} ·{' '}
                  {selectedTicket.subject}
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

            {ticketPinned.length > 0 ? (
              <div className="shrink-0 border-b border-stroke bg-board px-5 py-2">
                <div className="mb-1 text-[10px] tracking-widest text-dim uppercase">
                  fixadas
                </div>
                <div className="flex max-h-24 flex-col gap-1 overflow-y-auto">
                  {ticketPinned.map((entry) => (
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
                      {pinnedLabel(entry)}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            <div ref={threadRef} className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
              {selectedTicket.history.map((message) => {
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
                const mine = message.author === 'agent'
                return renderMessageBubble({
                  message,
                  mark: initials(message.authorName || selectedTicket.requester),
                  mine,
                  menuItems: ticketMessageMenuItems(message),
                })
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
                    : `escrever uma mensagem para ${selectedTicket.requester.split(' ')[0]}…`
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
        ) : selectedTeam ? (
          <>
            <div className="flex shrink-0 items-center justify-between border-b border-stroke bg-panel px-5 py-3.5">
              <div className="min-w-0">
                <div className="truncate text-[13.5px] font-bold">{selectedTeam.name}</div>
                <div className="mt-0.5 truncate text-[11px] text-dim">
                  bate-papo da equipe ·{' '}
                  {selectedTeam.kind === 'direct' ? 'direto' : 'canal'}
                </div>
              </div>
            </div>

            {teamPinned.length > 0 ? (
              <div className="shrink-0 border-b border-stroke bg-board px-5 py-2">
                <div className="mb-1 text-[10px] tracking-widest text-dim uppercase">
                  fixadas
                </div>
                <div className="flex max-h-24 flex-col gap-1 overflow-y-auto">
                  {teamPinned.map((entry) => (
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
                      {pinnedLabel(entry)}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            <div ref={threadRef} className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
              {selectedTeam.messages.map((message) => {
                const mine = message.authorHandle === CURRENT_AGENT
                return renderMessageBubble({
                  message,
                  mark: initials(message.authorName || selectedTeam.name),
                  mine,
                  menuItems: teamMessageMenuItems(message),
                })
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
                disabled={busy}
                placeholder={`escrever no ${selectedTeam.name}…`}
                className="h-10 flex-1 resize-none rounded border border-stroke bg-tile px-3 py-2.5 text-[12.5px] text-ink disabled:opacity-50"
              />
              <button
                type="button"
                onClick={send}
                disabled={busy || !draft.trim()}
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

      {selectedTicket ? (
        <DetailPanel>
          <PassLabel>
            cliente · {selectedTicket.category} · {statusLabel(selectedTicket.status)}
          </PassLabel>
          <PassTitle>{selectedTicket.requester}</PassTitle>
          <PassSub>{selectedTicket.email}</PassSub>
          <StubBar />
          <div className="mb-4 flex items-center justify-between rounded border border-stroke bg-board px-3 py-2.5 text-[11.5px]">
            <span className="text-dim">chamado vinculado</span>
            <b className="text-amber">
              #{selectedTicket.id} — {statusLabel(selectedTicket.status)}
            </b>
          </div>
          <div className="mb-4 text-[12px] leading-relaxed text-dim">
            {selectedTicket.subject}
          </div>
          <ActionBar>
            <ActionButton primary onClick={() => openTicketFocus(selectedTicket.id)}>
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

      {selectedTeam ? (
        <DetailPanel>
          <PassLabel>bate-papo da equipe</PassLabel>
          <PassTitle>{selectedTeam.name}</PassTitle>
          <PassSub>
            {selectedTeam.kind === 'direct' ? 'conversa direta' : 'canal da equipe'}
          </PassSub>
          <StubBar />
          <div className="text-[12px] leading-relaxed text-dim">
            mensagens internas entre a equipe. use o botão direito nas bolhas para
            responder, editar, fixar, encaminhar ou apagar.
          </div>
        </DetailPanel>
      ) : null}

      {kbOpen && selectedTicket && resolved ? (
        <CreateKnowledgeFromTicketDialog
          ticket={selectedTicket}
          onClose={() => setKbOpen(false)}
        />
      ) : null}

      <ForwardChatModal
        open={Boolean(forwardMessageId)}
        targets={forwardTargets}
        onClose={() => setForwardMessageId(null)}
        onConfirm={(target) => {
          onForwardConfirm(target)
        }}
      />
    </div>
  )
}
