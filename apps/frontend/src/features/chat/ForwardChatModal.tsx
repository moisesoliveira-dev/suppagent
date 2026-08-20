import { useEffect, useMemo, useState } from 'react'

export type ForwardTarget = {
  id: string
  kind: 'ticket' | 'team'
  title: string
  subtitle: string
}

type ForwardChatModalProps = {
  open: boolean
  targets: ForwardTarget[]
  onClose: () => void
  onConfirm: (target: ForwardTarget) => void
}

export function ForwardChatModal({
  open,
  targets,
  onClose,
  onConfirm,
}: ForwardChatModalProps) {
  const [query, setQuery] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [tab, setTab] = useState<'todos' | 'chamados' | 'equipe'>('todos')

  useEffect(() => {
    if (!open) return
    setQuery('')
    setSelectedId(null)
    setTab('todos')
  }, [open])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return targets.filter((target) => {
      if (tab === 'chamados' && target.kind !== 'ticket') return false
      if (tab === 'equipe' && target.kind !== 'team') return false
      if (!q) return true
      return (
        target.title.toLowerCase().includes(q) ||
        target.subtitle.toLowerCase().includes(q) ||
        target.id.toLowerCase().includes(q)
      )
    })
  }, [targets, query, tab])

  if (!open) return null

  const selected = filtered.find((item) => `${item.kind}:${item.id}` === selectedId)

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-seam/70 px-4">
      <div
        role="dialog"
        aria-modal="true"
        className="flex max-h-[min(560px,85vh)] w-full max-w-md flex-col overflow-hidden rounded-[3px] border border-stroke bg-panel shadow-xl shadow-black/50"
      >
        <div className="flex items-center justify-between border-b border-stroke px-4 py-3">
          <div className="text-[12px] font-bold tracking-wide uppercase">encaminhar mensagem</div>
          <button
            type="button"
            onClick={onClose}
            className="text-[11px] tracking-wide text-dim uppercase hover:text-amber"
          >
            fechar
          </button>
        </div>

        <div className="border-b border-stroke px-4 py-3">
          <input
            autoFocus
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="buscar bate-papo…"
            className="w-full rounded-[3px] border border-stroke bg-board px-3 py-2 text-[12.5px] text-ink placeholder:text-dim"
          />
          <div className="mt-2.5 flex gap-1.5">
            {(
              [
                ['todos', 'todos'],
                ['chamados', 'chamados'],
                ['equipe', 'equipe'],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => setTab(id)}
                className={`rounded-full border px-2.5 py-1 text-[10.5px] tracking-wide uppercase ${
                  tab === id ? 'border-amber text-amber' : 'border-stroke text-dim'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-2 py-2">
          {filtered.length === 0 ? (
            <div className="px-2 py-6 text-center text-[12px] text-dim">
              nenhum bate-papo encontrado
            </div>
          ) : (
            filtered.map((target) => {
              const key = `${target.kind}:${target.id}`
              const active = selectedId === key
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setSelectedId(key)}
                  className={`mb-1 flex w-full items-center gap-3 rounded-[3px] px-3 py-2.5 text-left ${
                    active ? 'bg-tile' : 'hover:bg-board'
                  }`}
                >
                  <span
                    className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
                      active ? 'border-amber bg-amber' : 'border-stroke'
                    }`}
                  >
                    {active ? (
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-ink" />
                    ) : null}
                  </span>
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[3px] border border-stroke bg-board text-[10px] font-bold text-amber uppercase">
                    {target.kind === 'team' ? 'eq' : '#'}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[12.5px] font-bold">{target.title}</span>
                    <span className="block truncate text-[11px] text-dim">{target.subtitle}</span>
                  </span>
                </button>
              )
            })
          )}
        </div>

        <div className="flex gap-2 border-t border-stroke px-4 py-3">
          <button
            type="button"
            disabled={!selected}
            onClick={() => selected && onConfirm(selected)}
            className="flex-1 rounded-[3px] border border-amber bg-amber py-2.5 text-[11px] font-bold tracking-widest text-amber-ink uppercase disabled:opacity-40"
          >
            encaminhar
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-[3px] border border-stroke bg-board py-2.5 text-[11px] tracking-widest text-ink uppercase"
          >
            cancelar
          </button>
        </div>
      </div>
    </div>
  )
}
