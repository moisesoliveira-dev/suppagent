import { useEffect, useState } from 'react'
import { listTickets } from '../tickets/tickets-api'
import { onTicketsChanged, openCreateTicketDialog } from '../tickets/tickets-ui'
import { NAV_GROUPS, type ViewId } from './nav'

type SidebarProps = {
  active: ViewId
  onNavigate: (id: ViewId) => void
}

export function Sidebar({ active, onNavigate }: SidebarProps) {
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
    <aside className="flex h-full min-h-0 w-[220px] shrink-0 flex-col border-r border-stroke bg-panel py-5">
      <div className="mb-3 flex shrink-0 items-center gap-2.5 border-b border-stroke px-[18px] pb-3.5">
        <div className="flex h-7 w-7 items-center justify-center rounded-[3px] bg-amber text-[13px] font-bold text-amber-ink">
          #
        </div>
        <div className="text-sm font-bold tracking-wider uppercase">Balcão</div>
      </div>

      <div className="shrink-0 px-3 pb-3">
        <button
          type="button"
          onClick={() => openCreateTicketDialog()}
          className="w-full rounded-[3px] bg-amber px-3 py-2.5 text-[11px] font-bold tracking-wide text-amber-ink uppercase hover:brightness-110 active:scale-[0.98]"
        >
          abrir chamado
        </button>
      </div>

      <nav className="min-h-0 flex-1 overflow-y-auto px-3" aria-label="menu principal">
        {NAV_GROUPS.map((group, groupIndex) => {
          const isCollapsed = collapsed[group.label] === true
          const hasActiveChild = group.items.some((item) => item.id === active)
          const childCount = group.items.length

          return (
            <section
              key={group.label}
              className={groupIndex === 0 ? 'mb-1' : 'mt-4 mb-1'}
              aria-labelledby={`nav-group-${group.label}`}
            >
              <button
                type="button"
                id={`nav-group-${group.label}`}
                aria-expanded={!isCollapsed}
                onClick={() =>
                  setCollapsed((current) => ({
                    ...current,
                    [group.label]: !isCollapsed,
                  }))
                }
                className={`mb-1.5 flex w-full items-center justify-between rounded-[3px] px-2 py-1.5 text-left ${
                  hasActiveChild ? 'text-amber' : 'text-dim hover:text-ink'
                }`}
              >
                <span className="text-[9px] font-bold tracking-[0.2em] uppercase opacity-80">
                  {group.label}
                </span>
                <span className="flex items-center gap-1.5">
                  {childCount > 1 ? (
                    <span className="rounded-[2px] border border-stroke px-1 text-[8px] tracking-wide text-dim tabular-nums">
                      {childCount}
                    </span>
                  ) : null}
                  <span
                    className={`text-[9px] text-dim transition-transform duration-200 ease-out ${
                      isCollapsed ? '-rotate-90' : ''
                    }`}
                    aria-hidden="true"
                  >
                    ▾
                  </span>
                </span>
              </button>

              {isCollapsed ? null : (
                <div
                  role="group"
                  aria-label={`itens de ${group.label}`}
                  className="ml-1.5 space-y-0.5 border-l border-stroke pl-2"
                >
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
                        aria-current={isActive ? 'page' : undefined}
                        onClick={() => onNavigate(item.id)}
                        className={`relative flex w-full items-center gap-2 rounded-[3px] px-2.5 py-2 text-left text-[11.5px] tracking-wide transition-[color,background-color,border-color,transform] duration-200 active:scale-[0.99] ${
                          isActive
                            ? 'bg-tile font-bold text-amber'
                            : 'text-ink/80 hover:bg-tile hover:text-ink'
                        }`}
                      >
                        {isActive ? (
                          <span
                            className="absolute top-1.5 bottom-1.5 -left-[9px] w-[2px] rounded-full bg-amber"
                            aria-hidden="true"
                          />
                        ) : null}
                        <span className="min-w-0 flex-1 truncate lowercase first-letter:uppercase">
                          {item.label}
                        </span>
                        {count != null ? (
                          <span
                            className={`ml-auto text-[10px] tabular-nums ${
                              isActive ? 'text-amber' : 'text-dim'
                            }`}
                          >
                            {count}
                          </span>
                        ) : null}
                      </button>
                    )
                  })}
                </div>
              )}
            </section>
          )
        })}
      </nav>
    </aside>
  )
}
