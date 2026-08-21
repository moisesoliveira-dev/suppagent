import { useEffect, useState } from 'react'
import { Toggle } from '../../shared/ui/Toggle'
import { toast } from '../../shared/ui/toast'
import {
  getNotificationPreferences,
  updateNotificationPreferences,
} from './notifications-api'
import type { NotificationPreferences } from './notifications'
import { notifyNotificationsChanged } from './notifications-ui'

const ROWS: {
  key: keyof Pick<
    NotificationPreferences,
    'assigned' | 'sla' | 'digest' | 'sound'
  >
  name: string
  desc: string
}[] = [
  {
    key: 'assigned',
    name: 'novo chamado atribuído',
    desc: 'avisar quando um chamado for atribuído ou reaberto para você.',
  },
  {
    key: 'sla',
    name: 'fila e urgentes',
    desc: 'alertar sobre novos chamados na fila e chamados urgentes.',
  },
  {
    key: 'digest',
    name: 'resumo diário',
    desc: 'preferência salva para envio futuro de resumo às 08:00 (ainda sem agendador).',
  },
  {
    key: 'sound',
    name: 'som de alerta',
    desc: 'reproduzir som ao receber notificação nova no painel.',
  },
]

export function NotificationsSettingsPanel() {
  const [prefs, setPrefs] = useState<NotificationPreferences | null>(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function load() {
    setLoading(true)
    setError(null)
    try {
      setPrefs(await getNotificationPreferences())
    } catch (err) {
      setPrefs(null)
      setError(err instanceof Error ? err.message : 'falha ao carregar')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  async function toggle(
    key: keyof Pick<
      NotificationPreferences,
      'assigned' | 'sla' | 'digest' | 'sound'
    >,
  ) {
    if (!prefs || busy) return
    setBusy(true)
    setError(null)
    try {
      const updated = await updateNotificationPreferences({
        [key]: !prefs[key],
      })
      setPrefs(updated)
      notifyNotificationsChanged()
      toast.success('preferência salva')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'falha ao salvar'
      setError(message)
      toast.error(message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="max-w-[620px]">
      <p className="mb-1 text-[15px] font-bold">notificações</p>
      <p className="mb-6 text-[11.5px] text-dim">
        como e quando a equipe é avisada sobre eventos de chamados
      </p>

      {error ? (
        <div className="mb-3 rounded-[3px] border border-red/40 bg-tile px-3 py-2 text-xs text-red">
          {error}
        </div>
      ) : null}

      {loading || !prefs ? (
        <div className="text-xs text-dim">carregando preferências…</div>
      ) : (
        ROWS.map((row) => (
          <div
            key={row.key}
            className="flex max-w-[460px] items-start justify-between border-b border-stroke py-3"
          >
            <div>
              <div className="mb-0.5 text-[12.5px]">{row.name}</div>
              <div className="max-w-[340px] text-[11px] text-dim">{row.desc}</div>
            </div>
            <Toggle
              on={prefs[row.key]}
              onToggle={() => {
                void toggle(row.key)
              }}
            />
          </div>
        ))
      )}
    </div>
  )
}
