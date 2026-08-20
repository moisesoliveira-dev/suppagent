import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  __resetToastsForTests,
  dismissToast,
  resolveConfirm,
  resolvePrompt,
  subscribeToasts,
  toast,
  type ToastEntry,
} from './toast-store'

afterEach(() => {
  __resetToastsForTests()
  vi.useRealTimers()
})

describe('toast-store', () => {
  it('publica mensagem e remove após o timeout', () => {
    vi.useFakeTimers()
    let count = 0
    const unsub = subscribeToasts((entries) => {
      count = entries.length
    })

    toast.success('salvo')
    expect(count).toBe(1)

    vi.advanceTimersByTime(3200)
    expect(count).toBe(0)
    unsub()
  })

  it('confirm resolve true/false', async () => {
    const pending = toast.confirm({
      title: 'encerrar',
      message: 'tem certeza?',
    })
    const id = current()[0]?.id
    expect(id).toBeTruthy()
    resolveConfirm(id!, true)
    await expect(pending).resolves.toBe(true)

    const cancelled = toast.confirm({ title: 'x', message: 'y' })
    resolveConfirm(current()[0]!.id, false)
    await expect(cancelled).resolves.toBe(false)
  })

  it('prompt resolve texto ou null', async () => {
    const pending = toast.prompt({
      title: 'agente',
      message: 'informe',
      defaultValue: 'c.reis',
    })
    resolvePrompt(current()[0]!.id, 'b.alves')
    await expect(pending).resolves.toBe('b.alves')

    const cancelled = toast.prompt({ title: 'a', message: 'b' })
    dismissToast(current()[0]!.id)
    await expect(cancelled).resolves.toBeNull()
  })
})

function current(): ToastEntry[] {
  let snapshot: ToastEntry[] = []
  const unsub = subscribeToasts((entries) => {
    snapshot = entries
  })
  unsub()
  return snapshot
}
