import { useEffect, useState, type FormEvent } from 'react'
import {
  dismissToast,
  resolveConfirm,
  resolvePrompt,
  subscribeToasts,
  type ToastEntry,
} from './toast-store'

const TONE_CLASS: Record<string, string> = {
  info: 'border-stroke text-ink',
  success: 'border-green/50 text-green',
  error: 'border-red/50 text-red',
}

function MessageCard({ entry }: { entry: Extract<ToastEntry, { kind: 'message' }> }) {
  return (
    <div
      className={`pointer-events-auto w-[320px] rounded-[3px] border bg-tile px-4 py-3 shadow-lg shadow-black/40 ${TONE_CLASS[entry.tone]}`}
      role="status"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          {entry.title ? (
            <div className="mb-1 text-[10px] tracking-widest uppercase">{entry.title}</div>
          ) : null}
          <div className="text-[12.5px] leading-relaxed text-ink">{entry.message}</div>
        </div>
        <button
          type="button"
          onClick={() => dismissToast(entry.id)}
          className="shrink-0 text-[10px] tracking-widest text-dim uppercase hover:text-ink"
        >
          fechar
        </button>
      </div>
    </div>
  )
}

function ConfirmCard({ entry }: { entry: Extract<ToastEntry, { kind: 'confirm' }> }) {
  return (
    <div
      className="pointer-events-auto w-[320px] rounded-[3px] border border-stroke bg-tile px-4 py-3 shadow-lg shadow-black/40"
      role="alertdialog"
    >
      <div className="mb-1 text-[10px] tracking-widest text-amber uppercase">{entry.title}</div>
      <div className="mb-3 text-[12.5px] leading-relaxed text-ink">{entry.message}</div>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => resolveConfirm(entry.id, true)}
          className="flex-1 rounded-[3px] border border-amber bg-amber py-2 text-[10.5px] font-bold tracking-widest text-amber-ink uppercase"
        >
          {entry.confirmLabel}
        </button>
        <button
          type="button"
          onClick={() => resolveConfirm(entry.id, false)}
          className="flex-1 rounded-[3px] border border-stroke bg-board py-2 text-[10.5px] tracking-widest text-ink uppercase"
        >
          {entry.cancelLabel}
        </button>
      </div>
    </div>
  )
}

function PromptCard({ entry }: { entry: Extract<ToastEntry, { kind: 'prompt' }> }) {
  const [value, setValue] = useState(entry.defaultValue)

  function onSubmit(event: FormEvent) {
    event.preventDefault()
    resolvePrompt(entry.id, value)
  }

  return (
    <form
      onSubmit={onSubmit}
      className="pointer-events-auto w-[320px] rounded-[3px] border border-stroke bg-tile px-4 py-3 shadow-lg shadow-black/40"
      role="dialog"
    >
      <div className="mb-1 text-[10px] tracking-widest text-amber uppercase">{entry.title}</div>
      <div className="mb-3 text-[12.5px] leading-relaxed text-ink">{entry.message}</div>
      <input
        autoFocus
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder={entry.placeholder}
        className="mb-3 w-full rounded-[3px] border border-stroke bg-board px-3 py-2 text-[12.5px] text-ink placeholder:text-dim"
      />
      <div className="flex gap-2">
        <button
          type="submit"
          className="flex-1 rounded-[3px] border border-amber bg-amber py-2 text-[10.5px] font-bold tracking-widest text-amber-ink uppercase"
        >
          {entry.confirmLabel}
        </button>
        <button
          type="button"
          onClick={() => resolvePrompt(entry.id, null)}
          className="flex-1 rounded-[3px] border border-stroke bg-board py-2 text-[10.5px] tracking-widest text-ink uppercase"
        >
          {entry.cancelLabel}
        </button>
      </div>
    </form>
  )
}

export function ToastHost() {
  const [items, setItems] = useState<ToastEntry[]>([])

  useEffect(() => subscribeToasts(setItems), [])

  if (items.length === 0) return null

  return (
    <div className="pointer-events-none fixed right-4 bottom-4 z-50 flex max-h-[min(70vh,520px)] flex-col-reverse gap-2 overflow-y-auto">
      {items.map((entry) => {
        if (entry.kind === 'message') return <MessageCard key={entry.id} entry={entry} />
        if (entry.kind === 'confirm') return <ConfirmCard key={entry.id} entry={entry} />
        return <PromptCard key={entry.id} entry={entry} />
      })}
    </div>
  )
}
