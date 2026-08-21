import { useEffect, useState, type FormEvent } from 'react'
import { IconButton } from '../../shared/ui/IconButton'
import { PencilIcon } from '../../shared/ui/icons'
import { toast } from '../../shared/ui/toast'
import { listSlaPolicies, updateSlaPolicy } from './sla-api'
import type { SlaPolicy } from './sla'

export function SlaPoliciesCatalogPanel() {
  const [items, setItems] = useState<SlaPolicy[]>([])
  const [editing, setEditing] = useState<string | null>(null)
  const [responseMinutes, setResponseMinutes] = useState('')
  const [resolutionMinutes, setResolutionMinutes] = useState('')
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const data = await listSlaPolicies()
      setItems(data.items)
    } catch (err) {
      setItems([])
      setError(err instanceof Error ? err.message : 'falha ao carregar políticas')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  function startEdit(policy: SlaPolicy) {
    setEditing(policy.priorityKey)
    setResponseMinutes(String(policy.responseMinutes))
    setResolutionMinutes(String(policy.resolutionMinutes))
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    if (!editing || busy) return
    const response = Number(responseMinutes)
    const resolution = Number(resolutionMinutes)
    if (!Number.isFinite(response) || !Number.isFinite(resolution)) {
      toast.error('informe minutos válidos')
      return
    }
    setBusy(true)
    setError(null)
    try {
      await updateSlaPolicy(editing, {
        responseMinutes: response,
        resolutionMinutes: resolution,
      })
      setEditing(null)
      await load()
      toast.success('política atualizada')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'falha ao salvar'
      setError(message)
      toast.error(message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="max-w-[620px]">
      <p className="mb-1 text-[15px] font-bold">prioridades / sla</p>
      <p className="mb-6 text-[11.5px] text-dim">
        metas de 1ª resposta e resolução por prioridade. o painel gestão → sla usa
        estes prazos nos chamados abertos.
      </p>

      {error ? (
        <div className="mb-3 rounded-[3px] border border-red/40 bg-tile px-3 py-2 text-xs text-red">
          {error}
        </div>
      ) : null}

      {loading ? (
        <div className="mb-3 text-xs text-dim">carregando políticas…</div>
      ) : null}

      {items.map((policy) => (
        <div
          key={policy.id}
          className="mb-2 max-w-[560px] rounded border border-stroke bg-tile px-4 py-3"
        >
          <div className="mb-0.5 flex items-center justify-between gap-2">
            <div className="text-[12.5px] font-bold">{policy.priority}</div>
            {editing !== policy.priorityKey ? (
              <IconButton
                label="editar"
                tone="accent"
                disabled={busy}
                onClick={() => startEdit(policy)}
              >
                <PencilIcon />
              </IconButton>
            ) : null}
          </div>
          {editing === policy.priorityKey ? (
            <form onSubmit={onSubmit} className="mt-2 space-y-2">
              <label className="block">
                <span className="mb-1 block text-[10px] tracking-widest text-dim uppercase">
                  resposta (minutos)
                </span>
                <input
                  type="number"
                  min={1}
                  value={responseMinutes}
                  onChange={(event) => setResponseMinutes(event.target.value)}
                  disabled={busy}
                  className="w-full rounded border border-stroke bg-board px-3 py-2 text-[12.5px]"
                  required
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-[10px] tracking-widest text-dim uppercase">
                  resolução (minutos)
                </span>
                <input
                  type="number"
                  min={1}
                  value={resolutionMinutes}
                  onChange={(event) => setResolutionMinutes(event.target.value)}
                  disabled={busy}
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
                  onClick={() => setEditing(null)}
                  className="text-[11px] font-bold tracking-wide text-dim uppercase"
                >
                  cancelar
                </button>
              </div>
            </form>
          ) : (
            <div className="text-[10.5px] text-dim">{policy.targetsLabel}</div>
          )}
        </div>
      ))}
    </div>
  )
}
