import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  closeContextMenu,
  getContextMenu,
  resetContextMenu,
  showContextMenu,
} from './context-menu-store'

beforeEach(() => {
  resetContextMenu()
})

describe('context-menu-store', () => {
  it('abre menu no primeiro botão direito', () => {
    const event = {
      clientX: 40,
      clientY: 80,
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
    }
    showContextMenu(event, [
      { id: 'a', label: 'ação', onSelect: vi.fn() },
    ])
    expect(event.preventDefault).toHaveBeenCalled()
    expect(getContextMenu()?.items).toHaveLength(1)
    expect(getContextMenu()?.x).toBe(40)
  })

  it('segundo botão direito seguido libera menu nativo', () => {
    const first = {
      clientX: 10,
      clientY: 10,
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
    }
    const second = {
      clientX: 12,
      clientY: 12,
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
    }
    showContextMenu(first, [{ id: 'a', label: 'a', onSelect: vi.fn() }])
    showContextMenu(second, [{ id: 'b', label: 'b', onSelect: vi.fn() }])
    expect(second.preventDefault).not.toHaveBeenCalled()
    expect(getContextMenu()).toBeNull()
  })

  it('fecha menu', () => {
    showContextMenu(
      {
        clientX: 1,
        clientY: 1,
        preventDefault: vi.fn(),
        stopPropagation: vi.fn(),
      },
      [{ id: 'a', label: 'a', onSelect: vi.fn() }],
    )
    closeContextMenu()
    expect(getContextMenu()).toBeNull()
  })
})
