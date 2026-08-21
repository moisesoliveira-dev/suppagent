import { useEffect, useState, type FormEvent } from 'react'
import { toast } from '../../shared/ui/toast'
import type { CannedResponse } from './canned'
import {
  createCannedResponse,
  deleteCannedResponse,
  listCannedResponses,
} from './canned-api'

const EMPTY = {
  title: '',
  category: 'acesso',
  shortcut: '',
  body: '',
}

export function CannedCatalogPanel() {
  const [items, setItems] = useState<CannedResponse[]>([])
  const [form, setForm] = useState(EMPTY)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const data = await listCannedResponses()
      setItems(data.items)
    } catch (err) {
      setItems([])
      setError(
        err instanceof Error ? err.message : 'falha ao carregar respostas prontas',
      )
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
    setBusy(true)
    setError(null)
    try {
      await createCannedResponse(form)
      setForm(EMPTY)
      setShowForm(false)
      await load()
      toast.success('resposta pronta cadastrada')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'falha ao cadastrar'
      setError(message)
      toast.error(message)
    } finally {
      setBusy(false)
    }
  }

  async function onRemove(item: CannedResponse) {
    const ok = await toast.confirm({
      title: 'remover resposta pronta',
      message: `remover “${item.title}” do cadastro?`,
      confirmLabel: 'remover',
    })
    if (!ok) return
    setBusy(true)
    setError(null)
    try {
      await deleteCannedResponse(item.id)
      await load()
      toast.success('resposta pronta removida')
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
      <p className="mb-1 text-[15px] font-bold">respostas prontas</p>
      <p className="mb-6 text-[11.5px] text-dim">
        modelos de texto com atalho. edição completa em atendimento → respostas
        prontas.
      </p>

      {error ? (
        <div className="mb-3 rounded-[3px] border border-red/40 bg-tile px-3 py-2 text-xs text-red">
          {error}
        </div>
      ) : null}

      {loading ? (
        <div className="mb-3 text-xs text-dim">carregando…</div>
      ) : null}

      {!loading && items.length === 0 ? (
        <div className="mb-3 text-xs text-dim">nenhuma resposta pronta cadastrada</div>
      ) : null}

      {items.map((item) => (
        <div
          key={item.id}
          className="mb-2 flex max-w-[560px] items-center justify-between gap-3 rounded border border-stroke bg-tile px-4 py-3"
        >
          <div className="min-w-0">
            <div className="mb-0.5 text-[12.5px] font-bold">{item.title}</div>
            <div className="text-[10.5px] text-dim">
              {item.shortcut} · {item.category} · {item.useCount} usos
            </div>
          </div>
          <button
            type="button"
            disabled={busy}
            onClick={() => void onRemove(item)}
            className="shrink-0 text-[10.5px] font-bold tracking-wide text-red uppercase disabled:opacity-50"
          >
            remover
          </button>
        </div>
      ))}

      {!showForm ? (
        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="mt-4 text-[11px] font-bold tracking-wide text-amber uppercase"
        >
          + nova resposta pronta
        </button>
      ) : (
        <form onSubmit={onSubmit} className="mt-4 max-w-[560px] space-y-3">
          {(
            [
              ['title', 'título'],
              ['shortcut', 'atalho'],
              ['category', 'categoria'],
            ] as const
          ).map(([key, label]) => (
            <label key={key} className="block">
              <span className="mb-1 block text-[10px] tracking-widest text-dim uppercase">
                {label}
              </span>
              <input
                value={form[key]}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    [key]: event.target.value,
                  }))
                }
                disabled={busy}
                className="w-full rounded border border-stroke bg-board px-3 py-2 text-[12.5px]"
                required
              />
            </label>
          ))}
          <label className="block">
            <span className="mb-1 block text-[10px] tracking-widest text-dim uppercase">
              corpo
            </span>
            <textarea
              value={form.body}
              onChange={(event) =>
                setForm((current) => ({ ...current, body: event.target.value }))
              }
              disabled={busy}
              rows={4}
              className="w-full rounded border border-stroke bg-board px-3 py-2 text-[12.5px]"
              required
            />
          </label>
          <div className="flex gap-3 pt-1">
            <button
              type="submit"
              disabled={busy}
              className="rounded border border-amber bg-tile px-3 py-1.5 text-[11px] font-bold tracking-wide text-amber uppercase disabled:opacity-50"
            >
              {busy ? 'salvando…' : 'salvar'}
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => {
                setShowForm(false)
                setForm(EMPTY)
              }}
              className="text-[11px] font-bold tracking-wide text-dim uppercase"
            >
              cancelar
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
