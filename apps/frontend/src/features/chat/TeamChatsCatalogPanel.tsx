import { useEffect, useState, type FormEvent } from 'react'
import { IconButton } from '../../shared/ui/IconButton'
import { TrashIcon } from '../../shared/ui/icons'
import { toast } from '../../shared/ui/toast'
import {
  createTeamChat,
  deleteTeamChat,
  listTeamChats,
  type TeamChatSummary,
} from './team-chat-api'

export function TeamChatsCatalogPanel() {
  const [items, setItems] = useState<TeamChatSummary[]>([])
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const data = await listTeamChats()
      setItems(data.items)
    } catch (err) {
      setItems([])
      setError(err instanceof Error ? err.message : 'falha ao carregar bate-papos')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    if (busy) return
    const trimmed = name.trim()
    if (!trimmed) {
      toast.error('nome é obrigatório')
      return
    }
    setBusy(true)
    setError(null)
    try {
      await createTeamChat(trimmed)
      setName('')
      setShowForm(false)
      await load()
      toast.success('bate-papo cadastrado')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'falha ao cadastrar'
      setError(message)
      toast.error(message)
    } finally {
      setBusy(false)
    }
  }

  async function onRemove(chat: TeamChatSummary) {
    const ok = await toast.confirm({
      title: 'remover bate-papo',
      message: `remover o canal “${chat.name}” e todas as mensagens?`,
      confirmLabel: 'remover',
    })
    if (!ok) return
    setBusy(true)
    setError(null)
    try {
      await deleteTeamChat(chat.id)
      await load()
      toast.success('bate-papo removido')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'falha ao remover'
      setError(message)
      toast.error(message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="max-w-[620px]">
      <p className="mb-1 text-[15px] font-bold">bate-papos da equipe</p>
      <p className="mb-6 text-[11.5px] text-dim">
        canais internos usados na aba chat com usuários → equipe
      </p>

      {error ? (
        <div className="mb-3 rounded-[3px] border border-red/40 bg-tile px-3 py-2 text-xs text-red">
          {error}
        </div>
      ) : null}

      {loading ? (
        <div className="mb-3 text-xs text-dim">carregando bate-papos…</div>
      ) : null}

      {!loading && items.length === 0 ? (
        <div className="mb-3 text-xs text-dim">nenhum bate-papo cadastrado</div>
      ) : null}

      {items.map((chat) => (
        <div
          key={chat.id}
          className="mb-2 flex max-w-[560px] items-center justify-between rounded border border-stroke bg-tile px-4 py-3"
        >
          <div>
            <div className="mb-0.5 text-[12.5px] font-bold">{chat.name}</div>
            <div className="text-[10.5px] text-dim">
              {chat.kind === 'direct' ? 'direto' : 'canal'} · {chat.snippet}
            </div>
          </div>
          <IconButton
            label="remover"
            tone="danger"
            disabled={busy}
            onClick={() => void onRemove(chat)}
          >
            <TrashIcon />
          </IconButton>
        </div>
      ))}

      {showForm ? (
        <form onSubmit={onSubmit} className="mt-4 max-w-[420px] rounded border border-stroke bg-board p-4">
          <div className="mb-3">
            <div className="mb-1.5 text-[10px] tracking-widest text-dim uppercase">nome do canal</div>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="ex.: plantão, comercial"
              className="w-full rounded-[3px] border border-stroke bg-tile px-3 py-2 text-[12.5px] text-ink"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={busy}
              className="rounded-[3px] bg-amber px-4 py-2 text-[11px] font-bold text-amber-ink uppercase disabled:opacity-50"
            >
              salvar
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => {
                setShowForm(false)
                setName('')
              }}
              className="rounded-[3px] border border-stroke px-4 py-2 text-[11px] tracking-wide text-dim uppercase"
            >
              cancelar
            </button>
          </div>
        </form>
      ) : (
        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="mt-3 rounded-[3px] border border-dashed border-stroke px-3.5 py-2 text-[11px] text-dim uppercase hover:border-amber hover:text-amber"
        >
          + novo bate-papo
        </button>
      )}
    </div>
  )
}
