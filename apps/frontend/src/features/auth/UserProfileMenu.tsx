import { useEffect, useId, useRef, useState } from 'react'
import { initialsFromName } from '../team/team'
import { isAuthRequired } from './auth'
import { clearSession, useAuthSession } from './auth-session'
import { resolveCurrentUser } from './current-user'
import { navigateTo } from '../shell/shell-nav'

export function UserProfileMenu() {
  const session = useAuthSession()
  const profile = resolveCurrentUser(session)
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const menuId = useId()

  useEffect(() => {
    if (!open) return
    function onPointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div ref={rootRef} className="relative ml-auto">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((value) => !value)}
        className="flex items-center gap-2.5 rounded-[3px] border border-stroke bg-board px-2.5 py-1.5 text-left hover:border-amber"
      >
        <div className="flex h-7 w-7 items-center justify-center rounded-[3px] border border-stroke bg-tile text-[11px] font-bold text-amber">
          {initialsFromName(profile.name)}
        </div>
        <div className="min-w-0 max-w-[140px]">
          <div className="truncate text-[11.5px] font-bold">{profile.name}</div>
          <div className="truncate text-[10px] text-dim">
            {profile.handle} · {profile.roleLabel}
          </div>
        </div>
        <span
          className={`text-[9px] text-dim transition-transform ${open ? 'rotate-180' : ''}`}
          aria-hidden
        >
          ▾
        </span>
      </button>

      {open ? (
        <div
          id={menuId}
          role="menu"
          className="ui-menu absolute top-[calc(100%+6px)] right-0 z-40 min-w-[220px] rounded-[3px] border border-stroke bg-panel py-1 shadow-lg shadow-black/40"
        >
          <div className="border-b border-stroke px-3 py-2.5">
            <div className="text-[12px] font-bold">{profile.name}</div>
            <div className="truncate text-[10.5px] text-dim">{profile.email}</div>
          </div>
          <button
            type="button"
            role="menuitem"
            className="block w-full px-3 py-2 text-left text-[11.5px] tracking-wide text-ink hover:bg-tile"
            onClick={() => {
              setOpen(false)
              navigateTo('configuracoes')
            }}
          >
            configurações
          </button>
          {isAuthRequired() ? (
            <button
              type="button"
              role="menuitem"
              className="block w-full px-3 py-2 text-left text-[11.5px] tracking-wide text-dim uppercase hover:bg-tile hover:text-amber"
              onClick={() => {
                setOpen(false)
                clearSession()
              }}
            >
              sair
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
