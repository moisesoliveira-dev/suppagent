import { useEffect, useRef, useState } from 'react'
import { PassLabel, PassSub } from '../../shared/ui/chrome'
import { IconButton } from '../../shared/ui/IconButton'
import { PencilIcon, TrashIcon } from '../../shared/ui/icons'
import { toast } from '../../shared/ui/toast'
import {
  createAiChatSession,
  deleteAiChatSession,
  getAiChatSession,
  getAiChatStarters,
  listAiChatSessions,
  renameAiChatSession,
  sendAiChatMessage,
} from './ai-chat-api'
import {
  formatSessionTime,
  type AiChatSessionDetail,
  type AiChatSessionSummary,
} from './ai-chat'

const DOMAIN_SOURCES = [
  ['base de chamados', '1.284 registros'],
  ['clientes', '312 contas'],
  ['base de conhecimento', '6 artigos'],
  ['políticas de sla', '4 políticas'],
  ['documentação do domínio', 'manual interno'],
] as const

export function AiChatView() {
  const [sessions, setSessions] = useState<AiChatSessionSummary[]>([])
  const [session, setSession] = useState<AiChatSessionDetail | null>(null)
  const [starters, setStarters] = useState<string[]>([])
  const [draft, setDraft] = useState('')
  const [renamingId, setRenamingId] = useState<string | null>(null)
  const [renameValue, setRenameValue] = useState('')
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  async function refreshList(preferId?: string | null) {
    const data = await listAiChatSessions()
    setSessions(data.items)
    const nextId =
      preferId && data.items.some((item) => item.id === preferId)
        ? preferId
        : data.items[0]?.id
    if (!nextId) {
      setSession(null)
      return null
    }
    const detail = await getAiChatSession(nextId)
    setSession(detail)
    return detail.id
  }

  useEffect(() => {
    void (async () => {
      setLoading(true)
      setError(null)
      try {
        const [starterData] = await Promise.all([
          getAiChatStarters(),
          refreshList(),
        ])
        setStarters(starterData.items)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'falha ao carregar chat')
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [session?.messages.length, session?.id])

  async function onNewChat() {
    if (busy) return
    setBusy(true)
    try {
      const created = await createAiChatSession()
      await refreshList(created.id)
      toast.success('nova conversa')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'falha ao criar')
    } finally {
      setBusy(false)
    }
  }

  async function onSelect(id: string) {
    if (busy || id === session?.id) return
    setBusy(true)
    setError(null)
    try {
      const detail = await getAiChatSession(id)
      setSession(detail)
      setRenamingId(null)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'falha ao abrir')
    } finally {
      setBusy(false)
    }
  }

  function startRename(item: AiChatSessionSummary) {
    setRenamingId(item.id)
    setRenameValue(item.title)
  }

  async function commitRename() {
    if (!renamingId || busy) return
    const title = renameValue.trim()
    if (!title) {
      toast.error('título é obrigatório')
      return
    }
    setBusy(true)
    try {
      await renameAiChatSession(renamingId, title)
      setRenamingId(null)
      await refreshList(renamingId)
      toast.success('conversa renomeada')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'falha ao renomear')
    } finally {
      setBusy(false)
    }
  }

  async function onDelete(item: AiChatSessionSummary) {
    const ok = await toast.confirm({
      title: 'excluir conversa',
      message: `excluir “${item.title}”?`,
      confirmLabel: 'excluir',
    })
    if (!ok) return
    setBusy(true)
    try {
      await deleteAiChatSession(item.id)
      const nextPrefer = session?.id === item.id ? null : session?.id
      await refreshList(nextPrefer)
      toast.success('conversa excluída')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'falha ao excluir')
    } finally {
      setBusy(false)
    }
  }

  async function send(text: string) {
    const trimmed = text.trim()
    if (!trimmed || busy) return
    setBusy(true)
    try {
      let activeId = session?.id
      if (!activeId) {
        const created = await createAiChatSession()
        activeId = created.id
      }
      const updated = await sendAiChatMessage(activeId, trimmed)
      setSession(updated)
      setDraft('')
      const list = await listAiChatSessions()
      setSessions(list.items)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'falha ao enviar')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex min-h-0 flex-1">
      {/* sessões — estilo ChatGPT */}
      <aside className="flex w-[240px] shrink-0 flex-col border-r border-stroke bg-panel">
        <div className="border-b border-stroke p-3">
          <button
            type="button"
            disabled={busy}
            onClick={() => void onNewChat()}
            className="w-full rounded-[3px] border border-amber bg-tile px-3 py-2 text-[11px] font-bold tracking-wide text-amber uppercase disabled:opacity-50"
          >
            + nova conversa
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-2 py-2">
          <div className="mb-2 px-2 text-[10px] tracking-widest text-dim uppercase">
            conversas
          </div>
          {loading ? (
            <div className="px-2 text-xs text-dim">carregando…</div>
          ) : null}
          {!loading && sessions.length === 0 ? (
            <div className="px-2 text-xs text-dim">nenhuma conversa ainda</div>
          ) : null}
          {sessions.map((item) => {
            const active = item.id === session?.id
            const renaming = renamingId === item.id
            return (
              <div
                key={item.id}
                className={`group mb-0.5 rounded-[3px] px-2 py-2 ${
                  active ? 'bg-tile' : 'hover:bg-tile/70'
                }`}
              >
                {renaming ? (
                  <form
                    onSubmit={(event) => {
                      event.preventDefault()
                      void commitRename()
                    }}
                    className="flex flex-col gap-1.5"
                  >
                    <input
                      autoFocus
                      value={renameValue}
                      onChange={(event) => setRenameValue(event.target.value)}
                      className="w-full rounded border border-stroke bg-board px-2 py-1 text-[12px]"
                    />
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        className="text-[10px] font-bold text-amber uppercase"
                      >
                        ok
                      </button>
                      <button
                        type="button"
                        onClick={() => setRenamingId(null)}
                        className="text-[10px] font-bold text-dim uppercase"
                      >
                        cancelar
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="flex items-start gap-1">
                    <button
                      type="button"
                      onClick={() => void onSelect(item.id)}
                      className="min-w-0 flex-1 text-left"
                    >
                      <div
                        className={`truncate text-[12px] ${
                          active ? 'font-bold text-amber' : 'text-ink'
                        }`}
                      >
                        {item.title}
                      </div>
                      <div className="text-[10px] text-dim">
                        {formatSessionTime(item.updatedAt)}
                      </div>
                    </button>
                    <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                      <IconButton
                        label="editar"
                        tone="accent"
                        disabled={busy}
                        onClick={() => startRename(item)}
                        className="h-7 w-7 border-transparent"
                      >
                        <PencilIcon className="h-3.5 w-3.5" />
                      </IconButton>
                      <IconButton
                        label="excluir"
                        tone="danger"
                        disabled={busy}
                        onClick={() => void onDelete(item)}
                        className="h-7 w-7 border-transparent"
                      >
                        <TrashIcon className="h-3.5 w-3.5" />
                      </IconButton>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </aside>

      {/* coluna principal */}
      <div className="relative flex min-w-0 flex-1 flex-col bg-bg">
        {error ? (
          <div className="mx-5 mt-4 rounded-[3px] border border-red/40 bg-tile px-3 py-2 text-xs text-red">
            {error}
          </div>
        ) : null}

        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="mx-auto flex w-full max-w-[48rem] flex-col gap-6 px-5 py-8">
            {!session && !loading ? (
              <div className="py-16 text-center text-sm text-dim">
                crie uma nova conversa para começar
              </div>
            ) : null}
            {session?.messages.map((message) =>
              message.role === 'assistant' ? (
                <div key={message.id} className="ui-rise flex gap-3.5">
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-stroke bg-tile text-[10px] font-bold tracking-wide text-amber">
                    IA
                  </div>
                  <div
                    className="min-w-0 flex-1 pt-1 text-[14px] leading-[1.65] text-ink [&_b]:font-bold"
                    dangerouslySetInnerHTML={{ __html: message.content }}
                  />
                </div>
              ) : (
                <div key={message.id} className="ui-rise flex justify-end">
                  <div
                    className="max-w-[85%] rounded-[1.35rem] bg-amber px-4 py-2.5 text-[14px] leading-[1.55] text-amber-ink"
                    dangerouslySetInnerHTML={{ __html: message.content }}
                  />
                </div>
              ),
            )}
            <div ref={bottomRef} />
          </div>
        </div>

        <div className="shrink-0 border-t border-stroke/60 bg-bg/95 px-5 pt-3 pb-4 backdrop-blur-sm">
          <div className="mx-auto w-full max-w-[48rem]">
            <div className="mb-2.5 flex flex-wrap gap-1.5">
              {starters.map((chip) => (
                <button
                  key={chip}
                  type="button"
                  disabled={busy}
                  onClick={() => void send(chip)}
                  className="rounded-full border border-stroke bg-tile px-3 py-1.5 text-[11px] text-dim transition-colors hover:border-amber/50 hover:text-ink disabled:opacity-50"
                >
                  {chip}
                </button>
              ))}
            </div>
            <div className="flex items-end gap-2 rounded-[1.75rem] border border-stroke bg-tile px-3 py-2 shadow-[0_8px_30px_rgba(0,0,0,0.18)] focus-within:border-amber/50">
              <textarea
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && !event.shiftKey) {
                    event.preventDefault()
                    void send(draft)
                  }
                }}
                rows={1}
                placeholder="Pergunte qualquer coisa sobre o Balcão…"
                className="max-h-32 min-h-[2.5rem] flex-1 resize-none bg-transparent px-2 py-2 text-[14px] leading-relaxed text-ink outline-none placeholder:text-dim"
              />
              <button
                type="button"
                onClick={() => void send(draft)}
                disabled={!draft.trim() || busy}
                className="mb-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber text-[13px] font-bold text-amber-ink transition enabled:hover:brightness-110 disabled:opacity-35"
                aria-label="enviar"
              >
                ↑
              </button>
            </div>
            <p className="mt-2 text-center text-[10.5px] text-dim">
              {session ? session.title : 'nova conversa'} · a ia pode errar
            </p>
          </div>
        </div>
      </div>

      <aside className="hidden w-[280px] shrink-0 overflow-y-auto border-l border-stroke bg-panel p-5 lg:block">
        <PassLabel>domínio conectado</PassLabel>
        <PassSub>fontes que a ia consulta para responder</PassSub>
        {DOMAIN_SOURCES.map(([name, count]) => (
          <div
            key={name}
            className="mb-2 flex justify-between rounded border border-stroke bg-tile px-3 py-2 text-[11.5px]"
          >
            <span>{name}</span>
            <span className="text-dim">{count}</span>
          </div>
        ))}
      </aside>
    </div>
  )
}
