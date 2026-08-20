export type ToastTone = 'info' | 'success' | 'error'

export type ToastMessage = {
  id: string
  kind: 'message'
  tone: ToastTone
  title?: string
  message: string
  durationMs: number
}

export type ToastConfirm = {
  id: string
  kind: 'confirm'
  title: string
  message: string
  confirmLabel: string
  cancelLabel: string
  resolve: (value: boolean) => void
}

export type ToastPrompt = {
  id: string
  kind: 'prompt'
  title: string
  message: string
  defaultValue: string
  placeholder: string
  confirmLabel: string
  cancelLabel: string
  resolve: (value: string | null) => void
}

export type ToastEntry = ToastMessage | ToastConfirm | ToastPrompt

type Listener = (entries: ToastEntry[]) => void

let entries: ToastEntry[] = []
const listeners = new Set<Listener>()
let seq = 0

function emit() {
  const snapshot = [...entries]
  for (const listener of listeners) listener(snapshot)
}

function nextId() {
  seq += 1
  return `toast-${seq}-${Date.now()}`
}

function push(entry: ToastEntry) {
  entries = [...entries, entry]
  emit()
}

function remove(id: string) {
  entries = entries.filter((entry) => entry.id !== id)
  emit()
}

export function subscribeToasts(listener: Listener): () => void {
  listeners.add(listener)
  listener([...entries])
  return () => {
    listeners.delete(listener)
  }
}

export function dismissToast(id: string) {
  const entry = entries.find((item) => item.id === id)
  if (entry?.kind === 'confirm') entry.resolve(false)
  if (entry?.kind === 'prompt') entry.resolve(null)
  remove(id)
}

export function resolveConfirm(id: string, value: boolean) {
  const entry = entries.find((item) => item.id === id)
  if (entry?.kind === 'confirm') {
    entry.resolve(value)
    remove(id)
  }
}

export function resolvePrompt(id: string, value: string | null) {
  const entry = entries.find((item) => item.id === id)
  if (entry?.kind === 'prompt') {
    entry.resolve(value)
    remove(id)
  }
}

function showMessage(
  tone: ToastTone,
  message: string,
  title?: string,
  durationMs = 3200,
) {
  const id = nextId()
  push({ id, kind: 'message', tone, title, message, durationMs })
  if (durationMs > 0) {
    globalThis.setTimeout(() => remove(id), durationMs)
  }
  return id
}

export const toast = {
  info(message: string, title?: string) {
    return showMessage('info', message, title)
  },
  success(message: string, title?: string) {
    return showMessage('success', message, title)
  },
  error(message: string, title?: string) {
    return showMessage('error', message, title)
  },
  confirm(options: {
    title: string
    message: string
    confirmLabel?: string
    cancelLabel?: string
  }): Promise<boolean> {
    return new Promise((resolve) => {
      push({
        id: nextId(),
        kind: 'confirm',
        title: options.title,
        message: options.message,
        confirmLabel: options.confirmLabel ?? 'confirmar',
        cancelLabel: options.cancelLabel ?? 'cancelar',
        resolve,
      })
    })
  },
  prompt(options: {
    title: string
    message: string
    defaultValue?: string
    placeholder?: string
    confirmLabel?: string
    cancelLabel?: string
  }): Promise<string | null> {
    return new Promise((resolve) => {
      push({
        id: nextId(),
        kind: 'prompt',
        title: options.title,
        message: options.message,
        defaultValue: options.defaultValue ?? '',
        placeholder: options.placeholder ?? '',
        confirmLabel: options.confirmLabel ?? 'ok',
        cancelLabel: options.cancelLabel ?? 'cancelar',
        resolve,
      })
    })
  },
}

/** só para testes */
export function __resetToastsForTests() {
  entries = []
  seq = 0
  emit()
}
