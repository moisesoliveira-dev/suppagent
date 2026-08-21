import { useEffect, useState } from 'react'
import { isAuthRequired } from '../auth/auth'
import { clearSession, useAuthSession } from '../auth/auth-session'
import { listTickets } from '../tickets/tickets-api'
import { onTicketsChanged } from '../tickets/tickets-ui'
import { NAV_GROUPS, type ViewId } from './nav'

type SidebarProps = {
  active: ViewId
  onNavigate: (id: ViewId) => void
}

export function Sidebar({ active, onNavigate }: SidebarProps) {
  const session = useAuthSession()
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({})
  const [openCount, setOpenCount] = useState<number | null>(null)

  useEffect(() => {
    async function refresh() {
      try {
        const data = await listTickets('todos')
        setOpenCount(data.counts.abertos)
      } catch {
        setOpenCount(null)
      }
    }
    void refresh()
    return onTicketsChanged(() => {
      void refresh()
    })
  }, [])

  return (
    <aside className="flex h-full min-h-0 w-[210px] shrink-0 flex-col border-r border-stroke bg-panel py-5">
      <div className="mb-4 flex shrink-0 items-center gap-2.5 border-b border-stroke px-[18px] pb-[18px]">
        <div className="flex h-7 w-7 items-center justify-center rounded-[3px] bg-amber text-[13px] font-bold text-amber-ink">
          #
        </div>
        <div className="text-sm font-bold tracking-wider uppercase">Balcão</div>
      </div>

      <nav className="min-h-0 flex-1 overflow-y-auto px-3">
        {NAV_GROUPS.map((group, groupIndex) => {
          const isCollapsed = collapsed[group.label] === true
          return (
            <div key={group.label} className="mb-0.5">
              <button
                type="button"
                onClick={() =>
                  setCollapsed((current) => ({
                    ...current,
                    [group.label]: !isCollapsed,
                  }))
                }
                className={`flex w-full items-center justify-between px-2 py-2 text-[10px] tracking-widest text-dim uppercase hover:text-ink ${
                  groupIndex === 0 ? 'pt-0' : 'pt-3.5'
                }`}
              >
                <span>{group.label}</span>
                <span className={`text-[8px] transition-transform duration-200 ease-out ${isCollapsed ? '-rotate-90' : ''}`}>
                  ▾
                </span>
              </button>
              {isCollapsed ? null : (
                <div>
                  {group.items.map((item) => {
                    const isActive = active === item.id
                    const count =
                      item.id === 'chamados' && openCount != null
                        ? openCount
                        : item.count
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => onNavigate(item.id)}
                        className={`mb-0.5 flex w-full items-center gap-2 rounded-[3px] px-2.5 py-2 text-left text-xs tracking-wide uppercase transition-[color,background-color,border-color,transform] duration-200 active:scale-[0.99] ${
                          isActive
                            ? 'border border-stroke bg-tile text-amber'
                            : 'text-dim hover:bg-tile hover:text-ink'
                        }`}
                      >
                        {item.label}
                        {count != null ? (
                          <span className="ml-auto text-[10.5px] text-dim">{count}</span>
                        ) : null}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </nav>

      <div className="mt-auto shrink-0 border-t border-stroke px-[18px] pt-3.5">
        <div className="flex items-center gap-2 pt-3.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-[3px] border border-stroke bg-tile text-[11px] font-bold text-amber">
            {session?.kind === 'authenticated'
              ? session.user.name
                  .split(/\s+/)
                  .filter(Boolean)
                  .slice(0, 2)
                  .map((part) => part[0]?.toUpperCase() ?? '')
                  .join('') || '?'
              : 'CR'}
          </div>
          <div className="min-w-0">
            <div className="truncate text-[11.5px] font-bold">
              {session?.kind === 'authenticated'
                ? session.user.name
                : 'camila reis'}
            </div>
            <div className="truncate text-[10px] text-dim">
              {session?.kind === 'authenticated'
                ? session.user.email
                : 'c.reis · técnica'}
            </div>
          </div>
        </div>
        {isAuthRequired() ? (
          <button
            type="button"
            onClick={() => clearSession()}
            className="mt-3 w-full rounded-[3px] border border-stroke px-2.5 py-2 text-[10.5px] tracking-wide text-dim uppercase hover:border-amber hover:text-amber"
          >
            sair
          </button>
        ) : null}
      </div>
    </aside>
  )
}
