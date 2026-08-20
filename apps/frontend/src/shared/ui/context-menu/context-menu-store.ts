import { useSyncExternalStore } from 'react'

export type ContextMenuItem = {
  id: string
  label: string
  danger?: boolean
  disabled?: boolean
  onSelect: () => void
}

export type ContextMenuState = {
  x: number
  y: number
  items: ContextMenuItem[]
} | null

let menu: ContextMenuState = null
let lastGateAt = 0
const listeners = new Set<() => void>()
const DOUBLE_RIGHT_MS = 450

function emit() {
  for (const listener of listeners) listener()
}

export function getContextMenu(): ContextMenuState {
  return menu
}

export function subscribeContextMenu(listener: () => void): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function useContextMenuState(): ContextMenuState {
  return useSyncExternalStore(subscribeContextMenu, getContextMenu, getContextMenu)
}

export function closeContextMenu() {
  if (!menu) return
  menu = null
  emit()
}

export function openContextMenu(x: number, y: number, items: ContextMenuItem[]) {
  if (items.length === 0) return
  menu = { x, y, items }
  emit()
}

/** Primeiro botão direito: menu do Balcão. Dois cliques seguidos: menu nativo do browser. */
export function gateNativeContextMenu(event: MouseEvent): boolean {
  const now = Date.now()
  if (now - lastGateAt < DOUBLE_RIGHT_MS) {
    lastGateAt = 0
    closeContextMenu()
    return true
  }
  event.preventDefault()
  lastGateAt = now
  return false
}

export function showContextMenu(
  event: { clientX: number; clientY: number; preventDefault(): void; stopPropagation(): void },
  items: ContextMenuItem[],
) {
  const now = Date.now()
  if (now - lastGateAt < DOUBLE_RIGHT_MS) {
    lastGateAt = 0
    closeContextMenu()
    return
  }
  event.preventDefault()
  event.stopPropagation()
  lastGateAt = now
  openContextMenu(event.clientX, event.clientY, items)
}

/** só para testes */
export function resetContextMenu() {
  menu = null
  lastGateAt = 0
  emit()
}
