import { useEffect, useRef, useState } from 'react'
import { openTicketFocus } from '../shell/shell-nav'
import {
  getNotificationPreferences,
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from './notifications-api'
import {
  formatNotificationTime,
  shouldPlaySound,
  type AppNotification,
  type NotificationPreferences,
} from './notifications'
import {
  notifyNotificationsChanged,
  onNotificationsChanged,
  playNotificationBeep,
} from './notifications-ui'

const POLL_MS = 12_000

export function NotificationsBell() {
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState<AppNotification[]>([])
  const [unread, setUnread] = useState(0)
  const [prefs, setPrefs] = useState<NotificationPreferences | null>(null)
  const [error, setError] = useState<string | null>(null)
  const previousUnread = useRef(0)
  const rootRef = useRef<HTMLDivElement>(null)

  async function refresh(options?: { play?: boolean }) {
    try {
      const [list, preferences] = await Promise.all([
        listNotifications(),
        getNotificationPreferences(),
      ])
      if (
        options?.play !== false &&
        shouldPlaySound(preferences, list.items, previousUnread.current)
      ) {
        playNotificationBeep()
      }
      previousUnread.current = list.unread
      setItems(list.items)
      setUnread(list.unread)
      setPrefs(preferences)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'falha ao carregar')
    }
  }

  useEffect(() => {
    void refresh({ play: false })
    const timer = window.setInterval(() => {
      void refresh()
    }, POLL_MS)
    const off = onNotificationsChanged(() => {
      void refresh({ play: false })
    })
    return () => {
      window.clearInterval(timer)
      off()
    }
  }, [])

  useEffect(() => {
    if (!open) return
    function onDoc(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [open])

  async function onOpenItem(item: AppNotification) {
    try {
      if (!item.read) {
        await markNotificationRead(item.id)
        notifyNotificationsChanged()
      }
      if (item.ticketId) openTicketFocus(item.ticketId)
      setOpen(false)
      await refresh({ play: false })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'falha ao abrir')
    }
  }

  async function onMarkAll() {
    try {
      await markAllNotificationsRead()
      notifyNotificationsChanged()
      await refresh({ play: false })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'falha ao marcar')
    }
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-label="notificações"
        onClick={() => setOpen((current) => !current)}
        className={`relative rounded-[3px] border px-3 py-1.5 text-[10.5px] tracking-wide uppercase ${
          open ? 'border-amber text-amber' : 'border-stroke bg-board text-dim'
        }`}
      >
        alertas
        {unread > 0 ? (
          <span className="absolute -top-1.5 -right-1.5 min-w-[16px] rounded-full bg-red px-1 text-center text-[9px] font-bold text-white">
            {unread > 9 ? '9+' : unread}
          </span>
        ) : null}
      </button>

      {open ? (
        <div className="ui-popover absolute top-[calc(100%+8px)] right-0 z-40 w-[340px] rounded border border-stroke bg-panel shadow-xl shadow-black/40">
          <div className="flex items-center justify-between border-b border-stroke px-3 py-2.5">
            <div className="text-[11px] font-bold tracking-wide uppercase">
              notificações
            </div>
            <button
              type="button"
              disabled={unread === 0}
              onClick={() => void onMarkAll()}
              className="text-[10px] tracking-wide text-dim uppercase hover:text-amber disabled:opacity-40"
            >
              marcar todas
            </button>
          </div>
          {error ? (
            <div className="px-3 py-2 text-[11px] text-red">{error}</div>
          ) : null}
          <div className="max-h-[360px] overflow-y-auto">
            {items.length === 0 ? (
              <div className="px-3 py-6 text-center text-[11.5px] text-dim">
                nenhuma notificação
              </div>
            ) : (
              items.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => void onOpenItem(item)}
                  className={`block w-full border-b border-stroke px-3 py-3 text-left hover:bg-tile ${
                    item.read ? 'opacity-70' : ''
                  }`}
                >
                  <div className="mb-1 flex items-start justify-between gap-2">
                    <span className="text-[12px] font-bold">{item.title}</span>
                    <span className="shrink-0 text-[10px] text-dim">
                      {formatNotificationTime(item.createdAt)}
                    </span>
                  </div>
                  <div className="text-[11px] leading-relaxed text-dim">
                    {item.body}
                  </div>
                  {!item.read ? (
                    <div className="mt-1.5 text-[9px] tracking-widest text-amber uppercase">
                      nova
                    </div>
                  ) : null}
                </button>
              ))
            )}
          </div>
          {prefs ? (
            <div className="border-t border-stroke px-3 py-2 text-[10px] text-dim">
              som {prefs.sound ? 'ligado' : 'desligado'} · agente @{prefs.agent}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
