import { useEffect, useState, type FormEvent } from 'react'
import { ActionBar, ActionButton, PassLabel } from '../../shared/ui/chrome'
import { IconButton } from '../../shared/ui/IconButton'
import { PencilIcon, TrashIcon } from '../../shared/ui/icons'
import { Toggle } from '../../shared/ui/Toggle'
import { toast } from '../../shared/ui/toast'
import {
  automationMeta,
  automationSub,
  formatAutomationRelative,
  type AutomationRule,
} from './automations'
import {
  createAutomationRule,
  deleteAutomationRule,
  listAutomationRules,
  runAutomationRule,
  toggleAutomationRule,
  updateAutomationRule,
} from './automations-api'

const EMPTY_FORM = {
  name: '',
  trigger: '',
  condition: '',
  action: '',
  authorName: 'camila reis',
}

export function AutomationsView() {
  const [items, setItems] = useState<AutomationRule[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)

  async function load(preferId?: string | null) {
    setLoading(true)
    setError(null)
    try {
      const data = await listAutomationRules()
      setItems(data.items)
      setSelectedId((current) => {
        const preferred = preferId ?? current
        if (preferred && data.items.some((item) => item.id === preferred)) {
          return preferred
        }
        return data.items[0]?.id ?? null
      })
    } catch (err) {
      setItems([])
      setSelectedId(null)
      setError(err instanceof Error ? err.message : 'falha ao carregar automações')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  const rule = items.find((item) => item.id === selectedId) ?? items[0] ?? null

  async function onToggle(id: string) {
    if (busy) return
    setBusy(true)
    try {
      const updated = await toggleAutomationRule(id)
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

  async function onRun() {
    if (!rule || busy) return
    setBusy(true)
    try {
      const updated = await runAutomationRule(rule.id)
      setItems((current) =>
        current.map((item) => (item.id === updated.id ? updated : item)),
      )
      toast.success('execução registrada')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'falha ao executar')
    } finally {
      setBusy(false)
    }
  }

  async function onRemove() {
    if (!rule || busy) return
    const ok = await toast.confirm({
      title: 'remover regra',
      message: `remover “${rule.name}”?`,
      confirmLabel: 'remover',
    })
    if (!ok) return
    setBusy(true)
    try {
      await deleteAutomationRule(rule.id)
      await load(null)
      toast.success('regra removida')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'falha ao remover')
    } finally {
      setBusy(false)
    }
  }

  function startCreate() {
    setForm(EMPTY_FORM)
    setEditing(false)
    setShowForm(true)
  }

  function startEdit() {
    if (!rule) return
    setForm({
      name: rule.name,
      trigger: rule.trigger,
      condition: rule.condition,
      action: rule.action,
      authorName: rule.authorName,
    })
    setEditing(true)
    setShowForm(true)
  }

  async function save() {
    if (busy) return
    setBusy(true)
    setError(null)
    try {
      if (editing && rule) {
        const updated = await updateAutomationRule(rule.id, {
          name: form.name,
          trigger: form.trigger,
          condition: form.condition,
          action: form.action,
        })
        setItems((current) =>
          current.map((item) => (item.id === updated.id ? updated : item)),
        )
        toast.success('regra atualizada')
      } else {
        const created = await createAutomationRule(form)
        await load(created.id)
        toast.success('regra criada')
      }
      setShowForm(false)
      setForm(EMPTY_FORM)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'falha ao salvar'
      setError(message)
      toast.error(message)
    } finally {
      setBusy(false)
    }
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    await save()
  }

  return (
    <div className="flex min-h-0 flex-1">
      <div className="w-[280px] shrink-0 overflow-y-auto border-r border-stroke bg-panel px-4 py-4">
        <div className="mb-3 flex items-center justify-between gap-2">
          <div className="text-[10px] tracking-widest text-dim uppercase">
            regras de automação
          </div>
          <button
            type="button"
            onClick={startCreate}
            className="text-[10px] font-bold tracking-wide text-amber uppercase"
          >
            + nova
          </button>
        </div>

        {loading ? (
          <div className="text-xs text-dim">carregando…</div>
        ) : null}

        {!loading && items.length === 0 ? (
          <div className="text-xs text-dim">nenhuma regra cadastrada</div>
        ) : null}

        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => {
              setSelectedId(item.id)
              setShowForm(false)
            }}
            className={`mb-2 w-full rounded border px-3 py-3 text-left ${
              selectedId === item.id ? 'border-amber bg-tile' : 'border-stroke bg-tile'
            }`}
          >
            <div className="mb-2 flex items-start justify-between gap-2">
              <span className="text-xs font-bold leading-snug">{item.name}</span>
              <Toggle
                on={item.enabled}
                onToggle={() => {
                  void onToggle(item.id)
                }}
              />
            </div>
            <div className="text-[10.5px] text-dim">{automationMeta(item)}</div>
          </button>
        ))}
      </div>

      <div className="min-w-0 flex-1 overflow-y-auto px-7 py-5">
        {error ? (
          <div className="mb-3 rounded-[3px] border border-red/40 bg-tile px-3 py-2 text-xs text-red">
            {error}
          </div>
        ) : null}

        {showForm ? (
          <form onSubmit={onSubmit} className="max-w-[560px]">
            <p className="mb-1 text-[17px] font-bold tracking-wide text-amber">
              {editing ? 'editar regra' : 'nova regra'}
            </p>
            <p className="mb-5 text-[11.5px] text-dim">
              defina gatilho, condição e ação da automação
            </p>
            {(
              [
                ['name', 'nome'],
                ['trigger', 'gatilho'],
                ['condition', 'condição'],
                ['action', 'ação'],
                ['authorName', 'autor'],
              ] as const
            ).map(([key, label]) => (
              <label key={key} className="mb-3 block">
                <span className="mb-1 block text-[10px] tracking-widest text-dim uppercase">
                  {label}
                </span>
                <input
                  value={form[key]}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, [key]: event.target.value }))
                  }
                  disabled={busy || (editing && key === 'authorName')}
                  className="w-full rounded border border-stroke bg-board px-3 py-2 text-[12.5px]"
                  required
                />
              </label>
            ))}
            <ActionBar>
              <ActionButton primary onClick={() => void save()}>
                {busy ? 'salvando…' : 'salvar'}
              </ActionButton>
              <ActionButton
                onClick={() => {
                  setShowForm(false)
                  setForm(EMPTY_FORM)
                }}
              >
                cancelar
              </ActionButton>
            </ActionBar>
          </form>
        ) : null}

        {!showForm && !rule && !loading ? (
          <div className="text-xs text-dim">selecione ou crie uma regra</div>
        ) : null}

        {!showForm && rule ? (
          <>
            <p className="mb-1 text-[17px] font-bold tracking-wide text-amber">
              {rule.name}
            </p>
            <div className="mb-5 text-[11.5px] text-dim">{automationSub(rule)}</div>
            <div className="mb-6 flex gap-6">
              <div>
                <PassLabel>execuções</PassLabel>
                <div className="text-base font-bold">{rule.runCount}</div>
              </div>
              <div>
                <PassLabel>última execução</PassLabel>
                <div className="text-base font-bold">
                  {formatAutomationRelative(rule.lastRunAt)}
                </div>
              </div>
            </div>
            <div className="mb-7 flex flex-wrap items-stretch gap-2.5">
              <div className="min-w-[180px] flex-1 rounded border border-amber bg-board px-4 py-3.5">
                <div className="mb-2 text-[10px] font-bold tracking-widest text-amber uppercase">
                  gatilho
                </div>
                <div className="text-[12.5px] leading-relaxed">{rule.trigger}</div>
              </div>
              <div className="flex items-center text-base text-dim">→</div>
              <div className="min-w-[180px] flex-1 rounded border border-blue bg-board px-4 py-3.5">
                <div className="mb-2 text-[10px] font-bold tracking-widest text-blue uppercase">
                  condição
                </div>
                <div className="text-[12.5px] leading-relaxed">{rule.condition}</div>
              </div>
              <div className="flex items-center text-base text-dim">→</div>
              <div className="min-w-[180px] flex-1 rounded border border-green bg-board px-4 py-3.5">
                <div className="mb-2 text-[10px] font-bold tracking-widest text-green uppercase">
                  ação
                </div>
                <div className="text-[12.5px] leading-relaxed">{rule.action}</div>
              </div>
            </div>
            <ActionBar>
              <IconButton label="editar" tone="accent" onClick={startEdit}>
                <PencilIcon />
              </IconButton>
              <ActionButton onClick={() => void onRun()}>
                registrar execução
              </ActionButton>
              <IconButton label="remover" tone="danger" onClick={() => void onRemove()}>
                <TrashIcon />
              </IconButton>
            </ActionBar>
            <div className="mt-6 text-[10.5px] tracking-widest text-dim uppercase">
              histórico
            </div>
            <p className="mt-2 text-[12px] text-dim">
              contador e última execução persistem na API. o motor de gatilhos em tempo
              real ainda não dispara ações automaticamente.
            </p>
          </>
        ) : null}
      </div>
    </div>
  )
}
