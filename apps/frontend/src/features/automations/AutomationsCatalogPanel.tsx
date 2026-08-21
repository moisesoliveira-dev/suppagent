import { useEffect, useState, type FormEvent } from 'react'
import { toast } from '../../shared/ui/toast'
import {
  automationMeta,
  type AutomationRule,
} from './automations'
import {
  createAutomationRule,
  deleteAutomationRule,
  listAutomationRules,
  toggleAutomationRule,
} from './automations-api'

const EMPTY = {
  name: '',
  trigger: '',
  condition: '',
  action: '',
  authorName: 'camila reis',
}

export function AutomationsCatalogPanel() {
  const [items, setItems] = useState<AutomationRule[]>([])
  const [form, setForm] = useState(EMPTY)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const data = await listAutomationRules()
      setItems(data.items)
    } catch (err) {
      setItems([])
      setError(err instanceof Error ? err.message : 'falha ao carregar automações')
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
      await createAutomationRule(form)
      setForm(EMPTY)
      setShowForm(false)
      await load()
      toast.success('automação cadastrada')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'falha ao cadastrar'
      setError(message)
      toast.error(message)
    } finally {
      setBusy(false)
    }
  }

  async function onToggle(rule: AutomationRule) {
    if (busy) return
    setBusy(true)
    try {
      const updated = await toggleAutomationRule(rule.id)
      setItems((current) =>
        current.map((item) => (item.id === updated.id ? updated : item)),
      )
      toast.success(updated.enabled ? 'regra ativada' : 'regra desativada')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'falha ao alternar')
    } finally {
      setBusy(false)
    }
  }

  async function onRemove(rule: AutomationRule) {
    const ok = await toast.confirm({
      title: 'remover automação',
      message: `remover “${rule.name}” do cadastro?`,
      confirmLabel: 'remover',
    })
    if (!ok) return
    setBusy(true)
    setError(null)
    try {
      await deleteAutomationRule(rule.id)
      await load()
      toast.success('automação removida')
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
      <p className="mb-1 text-[15px] font-bold">automações</p>
      <p className="mb-6 text-[11.5px] text-dim">
        cadastre regras de gatilho → condição → ação. detalhes e execução em gestão →
        automações.
      </p>

      {error ? (
        <div className="mb-3 rounded-[3px] border border-red/40 bg-tile px-3 py-2 text-xs text-red">
          {error}
        </div>
      ) : null}

      {loading ? (
        <div className="mb-3 text-xs text-dim">carregando automações…</div>
      ) : null}

      {!loading && items.length === 0 ? (
        <div className="mb-3 text-xs text-dim">nenhuma automação cadastrada</div>
      ) : null}

      {items.map((rule) => (
        <div
          key={rule.id}
          className="mb-2 flex max-w-[560px] items-center justify-between gap-3 rounded border border-stroke bg-tile px-4 py-3"
        >
          <div className="min-w-0">
            <div className="mb-0.5 text-[12.5px] font-bold">{rule.name}</div>
            <div className="text-[10.5px] text-dim">
              {automationMeta(rule)}
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
          + nova automação
        </button>
      ) : (
        <form onSubmit={onSubmit} className="mt-4 max-w-[560px] space-y-3">
          {(
            [
              ['name', 'nome'],
              ['trigger', 'gatilho'],
              ['condition', 'condição'],
              ['action', 'ação'],
              ['authorName', 'autor'],
            ] as const
          ).map(([key, label]) => (
            <label key={key} className="block">
              <span className="mb-1 block text-[10px] tracking-widest text-dim uppercase">
                {label}
              </span>
              <input
                value={form[key]}
                onChange={(event) =>
                  setForm((current) => ({ ...current, [key]: event.target.value }))
                }
                disabled={busy}
                className="w-full rounded border border-stroke bg-board px-3 py-2 text-[12.5px]"
                required
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
