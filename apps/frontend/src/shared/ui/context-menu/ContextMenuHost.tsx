import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import {
  closeContextMenu,
  gateNativeContextMenu,
  useContextMenuState,
  type ContextMenuItem,
  showContextMenu,
} from './context-menu-store'

export function ContextMenuHost() {
  const menu = useContextMenuState()
  const ref = useRef<HTMLDivElement>(null)
  const [pos, setPos] = useState({ x: 0, y: 0 })

  useEffect(() => {
    function onContextMenu(event: MouseEvent) {
      const target = event.target as HTMLElement | null
      if (target?.closest?.('[data-ctx]')) return
      if (gateNativeContextMenu(event)) return
      closeContextMenu()
    }
    document.addEventListener('contextmenu', onContextMenu, true)
    return () => document.removeEventListener('contextmenu', onContextMenu, true)
  }, [])

  useEffect(() => {
    if (!menu) return
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') closeContextMenu()
    }
    function onPointer() {
      closeContextMenu()
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('mousedown', onPointer)
    document.addEventListener('scroll', onPointer, true)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('mousedown', onPointer)
      document.removeEventListener('scroll', onPointer, true)
    }
  }, [menu])

  useLayoutEffect(() => {
    if (!menu || !ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const x = Math.min(menu.x, window.innerWidth - rect.width - 8)
    const y = Math.min(menu.y, window.innerHeight - rect.height - 8)
    setPos({ x: Math.max(8, x), y: Math.max(8, y) })
  }, [menu])

  if (!menu) return null

  return (
    <div
      ref={ref}
      role="menu"
      className="fixed z-[80] min-w-[180px] rounded-[3px] border border-stroke bg-panel py-1 shadow-lg shadow-black/50"
      style={{ left: pos.x || menu.x, top: pos.y || menu.y }}
      onMouseDown={(event) => event.stopPropagation()}
    >
      {menu.items.map((item) => (
        <button
          key={item.id}
          type="button"
          role="menuitem"
          disabled={item.disabled}
          onClick={() => {
            if (item.disabled) return
            closeContextMenu()
            item.onSelect()
          }}
          className={`block w-full px-3.5 py-2.5 text-left text-[12px] disabled:opacity-40 ${
            item.danger ? 'text-red hover:bg-tile' : 'text-ink hover:bg-tile'
          }`}
        >
          {item.label}
        </button>
      ))}
    </div>
  )
}

export function ContextMenuArea({
  items,
  children,
  className,
}: {
  items: ContextMenuItem[]
  children: ReactNode
  className?: string
}) {
  return (
    <div
      className={className}
      data-ctx="1"
      onContextMenu={(event) => {
        showContextMenu(event, items)
      }}
    >
      {children}
    </div>
  )
}
