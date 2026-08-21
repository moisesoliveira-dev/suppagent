import { useEffect, useState, type FormEvent } from 'react'
import { FlapCell } from '../../shared/ui/FlapCell'
import {
  ActionBar,
  ActionButton,
  DetailPanel,
  PassLabel,
  PassTitle,
} from '../../shared/ui/chrome'
import { IconButton } from '../../shared/ui/IconButton'
import { PencilIcon, TrashIcon } from '../../shared/ui/icons'
import { toast } from '../../shared/ui/toast'
import { categoryLabel, type CannedResponse } from './canned'
import {
  createCannedResponse,
  deleteCannedResponse,
  duplicateCannedResponse,
  listCannedResponses,
  updateCannedResponse,
  useCannedResponse,
} from './canned-api'

const EMPTY_FORM = {
  title: '',
  category: 'acesso',
  shortcut: '',
  body: '',
}

export function CannedView() {
  const [items, setItems] = useState<CannedResponse[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [cat, setCat] = useState('todas')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [wave, setWave] = useState(0)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)

  async function load(preferId?: string | null, category = cat) {
    setLoading(true)
    setError(null)
    try {
      const data = await listCannedResponses(
        category === 'todas' ? undefined : category,
      )
      setItems(data.items)
      setCategories(data.categories)
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
      setError(
        err instanceof Error ? err.message : 'falha ao carregar respostas prontas',
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load(null, cat)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cat])

  const selected =
    items.find((item) => item.id === selectedId) ?? items[0] ?? null

  const filterTabs = ['todas', ...categories]

  function startCreate() {
    setForm(EMPTY_FORM)
    setEditing(false)
    setShowForm(true)
  }

  function startEdit() {
    if (!selected) return
    setForm({
      title: selected.title,
      category: selected.category,
      shortcut: selected.shortcut,
      body: selected.body,
    })
    setEditing(true)
    setShowForm(true)
  }

  async function save() {
    if (busy) return
    setBusy(true)
    setError(null)
    try {
      if (editing && selected) {
        const updated = await updateCannedResponse(selected.id, form)
        await load(updated.id)
        toast.success('modelo atualizado')
      } else {
        const created = await createCannedResponse(form)
        setCat('todas')
        await load(created.id, 'todas')
        toast.success('modelo criado')
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

  async function onUse() {
    if (!selected || busy) return
    setBusy(true)
    try {
      const updated = await useCannedResponse(selected.id)
      setItems((current) =>
        current.map((item) => (item.id === updated.id ? updated : item)),
      )
      await navigator.clipboard.writeText(updated.body)
      toast.success('copiado — cole no chat')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'falha ao usar modelo')
    } finally {
      setBusy(false)
    }
  }

  async function onDuplicate() {
    if (!selected || busy) return
    setBusy(true)
    try {
      const copy = await duplicateCannedResponse(selected.id)
      await load(copy.id)
      toast.success('modelo duplicado')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'falha ao duplicar')
    } finally {
      setBusy(false)
    }
  }

  async function onRemove() {
    if (!selected || busy) return
    const ok = await toast.confirm({
      title: 'remover modelo',
      message: `remover “${selected.title}”?`,
      confirmLabel: 'remover',
    })
    if (!ok) return
    setBusy(true)
    try {
      await deleteCannedResponse(selected.id)
      await load(null)
      toast.success('modelo removido')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'falha ao remover')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex flex-wrap items-center gap-1.5 px-6 pt-4">
        {filterTabs.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => {
              setCat(item)
              setShowForm(false)
              setWave((value) => value + 1)
            }}
            className={`rounded-full border px-3 py-1.5 text-[10.5px] tracking-wide uppercase ${
              cat === item ? 'border-amber text-amber' : 'border-stroke bg-tile text-dim'
            }`}
          >
            {categoryLabel(item)}
          </button>
        ))}
        <button
          type="button"
          onClick={startCreate}
          className="ml-auto text-[10.5px] font-bold tracking-wide text-amber uppercase"
        >
          + novo modelo
        </button>
      </div>

      {error ? (
        <div className="mx-6 mt-3 rounded-[3px] border border-red/40 bg-tile px-3 py-2 text-xs text-red">
          {error}
        </div>
      ) : null}

      <div className="flex min-h-0 flex-1">
        <div className="min-w-0 flex-1 overflow-y-auto px-6 py-4">
          <div className="mb-2 grid grid-cols-[1fr_90px_110px_90px] px-2.5 text-[10px] tracking-widest text-dim uppercase">
            <span>modelo</span>
            <span>atalho</span>
            <span>categoria</span>
            <span className="text-right">usos</span>
          </div>

          {loading ? (
            <div className="text-xs text-dim">carregando…</div>
          ) : null}

          {!loading && items.length === 0 ? (
            <div className="text-xs text-dim">nenhum modelo nesta categoria</div>
          ) : null}

          <div className="flex flex-col gap-1.5" key={`${cat}-${wave}`}>
            {items.map((row, index) => {
              const selectedRow = row.id === selected?.id
              const delay = Math.min(index, 30) * 45
              return (
                <button
                  key={row.id}
                  type="button"
                  onClick={() => {
                    setSelectedId(row.id)
                    setShowForm(false)
                    setWave((value) => value + 1)
                  }}
                  className="grid w-full grid-cols-[1fr_90px_110px_90px] gap-1.5 text-left [perspective:700px]"
                >
                  <FlapCell delayMs={delay} selected={selectedRow}>
                    {row.title}
                  </FlapCell>
                  <FlapCell
                    delayMs={delay}
                    selected={selectedRow}
                    className="font-normal text-amber"
                  >
                    {row.shortcut}
                  </FlapCell>
                  <FlapCell
                    delayMs={delay}
                    selected={selectedRow}
                    className="font-normal text-dim"
                  >
                    {row.category}
                  </FlapCell>
                  <FlapCell
                    delayMs={delay}
                    selected={selectedRow}
                    align="end"
                    className="font-normal"
                  >
                    {row.useCount}
                  </FlapCell>
                </button>
              )
            })}
          </div>
        </div>

        <DetailPanel>
          {showForm ? (
            <form onSubmit={onSubmit}>
              <PassTitle>{editing ? 'editar modelo' : 'novo modelo'}</PassTitle>
              <PassLabel>título, atalho, categoria e texto</PassLabel>
              {(
                [
                  ['title', 'título'],
                  ['shortcut', 'atalho'],
                  ['category', 'categoria'],
                ] as const
              ).map(([key, label]) => (
                <label key={key} className="mb-3 mt-3 block">
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
              <label className="mb-3 block">
                <span className="mb-1 block text-[10px] tracking-widest text-dim uppercase">
                  corpo
                </span>
                <textarea
                  value={form.body}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      body: event.target.value,
                    }))
                  }
                  disabled={busy}
                  rows={5}
                  className="w-full rounded border border-stroke bg-board px-3 py-2 text-[12.5px] leading-relaxed"
                  required
                />
              </label>
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

          {!showForm && selected ? (
            <>
              <PassLabel>{selected.meta}</PassLabel>
              <PassTitle>{selected.title}</PassTitle>
              <span className="mb-3.5 inline-block rounded-[3px] border border-amber px-2 py-0.5 text-[11px] text-amber">
                {selected.shortcut}
              </span>
              <div className="mb-4 rounded border border-stroke bg-board px-4 py-3.5 text-[12.5px] leading-relaxed">
                {selected.body}
              </div>
              <div className="mb-2 text-[10.5px] tracking-widest text-dim uppercase">
                variáveis usadas
              </div>
              {selected.variableHints.map((item) => (
                <div
                  key={item}
                  className="flex gap-2 border-b border-stroke py-1.5 text-xs"
                >
                  <span className="text-amber">·</span>
                  {item}
                </div>
              ))}
              <ActionBar>
                <ActionButton primary onClick={() => void onUse()}>
                  usar na conversa
                </ActionButton>
                <IconButton label="editar" tone="accent" onClick={startEdit}>
                  <PencilIcon />
                </IconButton>
                <ActionButton onClick={() => void onDuplicate()}>
                  duplicar
                </ActionButton>
                <IconButton label="remover" tone="danger" onClick={() => void onRemove()}>
                  <TrashIcon />
                </IconButton>
              </ActionBar>
            </>
          ) : null}

          {!showForm && !selected && !loading ? (
            <div className="text-xs text-dim">selecione ou crie um modelo</div>
          ) : null}
        </DetailPanel>
      </div>
    </div>
  )
}
