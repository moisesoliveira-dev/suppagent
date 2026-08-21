import { useEffect, useState, type FormEvent } from 'react'
import { toast } from '../../shared/ui/toast'
import type { RoutingRule } from './routing'
import {
  createRoutingRule,
  deleteRoutingRule,
  listRoutingRules,
  updateRoutingRule,
} from './routing-api'

const EMPTY = {
  name: '',
  keywords: '',
  category: 'financeiro',
  agentHandle: 'c.reis',
}

export function RoutingRulesCatalogPanel() {
  const [items, setItems] = useState<RoutingRule[]>([])
  const [form, setForm] = useState(EMPTY)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const data = await listRoutingRules()
      setItems(data.items)
    } catch (err) {
      setItems([])
      setError(err instanceof Error ? err.message : 'falha ao carregar regras')
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
      await createRoutingRule({
        name: form.name,
        keywords: form.keywords,
        category: form.category,
        agentHandle: form.agentHandle.trim() || null,
      })
      setForm(EMPTY)
      setShowForm(false)
      await load()
      toast.success('regra de roteamento cadastrada')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'falha ao cadastrar'
      setError(message)
      toast.error(message)
    } finally {
      setBusy(false)
    }
  }

  async function onToggle(rule: RoutingRule) {
    if (busy) return
    setBusy(true)
    try {
      await updateRoutingRule(rule.id, { enabled: !rule.enabled })
      await load()
      toast.success(rule.enabled ? 'regra desativada' : 'regra ativada')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'falha ao alternar')
    } finally {
      setBusy(false)
    }
  }

  async function onRemove(rule: RoutingRule) {
    const ok = await toast.confirm({
      title: 'remover regra',
      message: `remover “${rule.name}”?`,
      confirmLabel: 'remover',
    })
    if (!ok) return
    setBusy(true)
    try {
      await deleteRoutingRule(rule.id)
      await load()
      toast.success('regra removida')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'falha ao remover')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="max-w-[620px]">
      <p className="mb-1 text-[15px] font-bold">roteamento ia</p>
      <p className="mb-6 text-[11.5px] text-dim">
        regras de palavras-chave → categoria e agente. o board em agente ia →
        roteamento usa estas regras nos chamados abertos.
      </p>

      {error ? (
        <div className="mb-3 rounded-[3px] border border-red/40 bg-tile px-3 py-2 text-xs text-red">
          {error}
        </div>
      ) : null}

      {loading ? <div className="mb-3 text-xs text-dim">carregando…</div> : null}

      {items.map((rule) => (
        <div
          key={rule.id}
          className="mb-2 flex max-w-[560px] items-center justify-between gap-3 rounded border border-stroke bg-tile px-4 py-3"
        >
          <div className="min-w-0">
            <div className="mb-0.5 text-[12.5px] font-bold">{rule.name}</div>
            <div className="text-[10.5px] text-dim">
              {rule.keywordsLabel} → {rule.category}
              {rule.agentHandle ? ` / ${rule.agentHandle}` : ' / revisão'}
              {rule.enabled ? '' : ' · inativa'}
            </div>
          </div>
          <div className="flex shrink-0 gap-2">
            <button
              type="button"
              disabled={busy}
              onClick={() => void onToggle(rule)}
              className="text-[10.5px] font-bold tracking-wide text-amber uppercase disabled:opacity-50"
            >
              {rule.enabled ? 'desativar' : 'ativar'}
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => void onRemove(rule)}
              className="text-[10.5px] font-bold tracking-wide text-red uppercase disabled:opacity-50"
            >
              remover
            </button>
          </div>
        </div>
      ))}

      {!showForm ? (
        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="mt-4 text-[11px] font-bold tracking-wide text-amber uppercase"
        >
          + nova regra
        </button>
      ) : (
        <form onSubmit={onSubmit} className="mt-4 max-w-[560px] space-y-3">
          {(
            [
              ['name', 'nome'],
              ['keywords', 'palavras-chave (vírgula)'],
              ['category', 'categoria'],
              ['agentHandle', 'agente (handle, vazio = revisão)'],
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
                required={key !== 'agentHandle'}
              />
            </label>
          ))}
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
