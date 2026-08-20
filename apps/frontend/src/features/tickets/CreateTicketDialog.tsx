import { useEffect, useState, type FormEvent, type ReactNode } from 'react'
import { toast } from '../../shared/ui/toast'
import { createTicket } from './tickets-api'
import {
  TICKET_CATEGORIES,
  TICKET_PRIORITIES,
  type TicketPriority,
} from './tickets'
import { notifyTicketsChanged, onOpenCreateTicket } from './tickets-ui'

const inputClass =
  'w-full rounded-[3px] border border-stroke bg-board px-3 py-2 text-[12.5px] text-ink'

export function CreateTicketDialog() {
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const [subject, setSubject] = useState('')
  const [priority, setPriority] = useState<TicketPriority>('media')
  const [category, setCategory] = useState(TICKET_CATEGORIES[0] ?? 'suporte técnico')
  const [requester, setRequester] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => onOpenCreateTicket(() => setOpen(true)), [])

  function reset() {
    setSubject('')
    setPriority('media')
    setCategory(TICKET_CATEGORIES[0] ?? 'suporte técnico')
    setRequester('')
    setEmail('')
    setMessage('')
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    if (busy) return
    setBusy(true)
    try {
      const ticket = await createTicket({
        subject,
        priority,
        category,
        requester,
        email,
        message,
      })
      toast.success(`chamado #${ticket.id} aberto`)
      reset()
      setOpen(false)
      notifyTicketsChanged()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'falha ao abrir chamado')
    } finally {
      setBusy(false)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/55 p-4">
      <form
        onSubmit={(event) => void onSubmit(event)}
        className="w-full max-w-md rounded-[3px] border border-stroke bg-panel p-5 shadow-xl shadow-black/50"
      >
        <div className="mb-1 text-[10px] tracking-widest text-amber uppercase">
          novo chamado
        </div>
        <p className="mb-4 text-[13px] text-dim">
          abre um chamado no banco e atualiza a lista
        </p>

        <Field label="assunto">
          <input
            required
            value={subject}
            onChange={(event) => setSubject(event.target.value)}
            className={inputClass}
            placeholder="resuma o problema"
          />
        </Field>
        <div className="mb-3 grid grid-cols-2 gap-3">
          <Field label="prioridade">
            <select
              value={priority}
              onChange={(event) => setPriority(event.target.value as TicketPriority)}
              className={inputClass}
            >
              {TICKET_PRIORITIES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="categoria">
            <select
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              className={inputClass}
            >
              {TICKET_CATEGORIES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </Field>
        </div>
        <Field label="solicitante">
          <input
            required
            value={requester}
            onChange={(event) => setRequester(event.target.value)}
            className={inputClass}
            placeholder="nome"
          />
        </Field>
        <Field label="e-mail">
          <input
            required
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className={inputClass}
            placeholder="email@empresa.com"
          />
        </Field>
        <Field label="mensagem inicial">
          <textarea
            required
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            className={`${inputClass} min-h-20 resize-y`}
            placeholder="descreva o chamado"
          />
        </Field>

        <div className="mt-4 flex gap-2">
          <button
            type="submit"
            disabled={busy}
            className="flex-1 rounded-[3px] border border-amber bg-amber py-2 text-[10.5px] font-bold tracking-widest text-amber-ink uppercase disabled:opacity-50"
          >
            {busy ? 'abrindo…' : 'abrir chamado'}
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => {
              setOpen(false)
              reset()
            }}
            className="flex-1 rounded-[3px] border border-stroke bg-tile py-2 text-[10.5px] tracking-widest text-ink uppercase"
          >
            cancelar
          </button>
        </div>
      </form>
    </div>
  )
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="mb-3 block">
      <span className="mb-1.5 block text-[10px] tracking-widest text-dim uppercase">
        {label}
      </span>
      {children}
    </label>
  )
}
