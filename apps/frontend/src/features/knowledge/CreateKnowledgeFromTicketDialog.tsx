import { useEffect, useState, type FormEvent, type ReactNode } from 'react'
import { toast } from '../../shared/ui/toast'
import { openKnowledgeFocus } from '../shell/shell-nav'
import type { Ticket } from '../tickets/tickets'
import { createKnowledgeFromTicket } from './knowledge-api'
import { CURRENT_KB_AUTHOR, KNOWLEDGE_CATEGORIES } from './knowledge'
import { notifyKnowledgeChanged } from './knowledge-ui'

const inputClass =
  'w-full rounded-[3px] border border-stroke bg-board px-3 py-2 text-[12.5px] text-ink'

function draftBody(ticket: Ticket) {
  const lines = ticket.history
    .filter((entry) => !entry.note)
    .map((entry) => {
      const who = entry.author === 'agent' ? 'agente' : 'cliente'
      return `${who}: ${entry.text}`
    })
  return lines.join('\n\n') || ticket.subject
}

export function CreateKnowledgeFromTicketDialog({
  ticket,
  onClose,
}: {
  ticket: Ticket
  onClose: () => void
}) {
  const [busy, setBusy] = useState(false)
  const [title, setTitle] = useState(ticket.subject)
  const [category, setCategory] = useState(
    ticket.category || KNOWLEDGE_CATEGORIES[0] || 'acesso',
  )
  const [body, setBody] = useState(() => draftBody(ticket))
  const [tags, setTags] = useState(ticket.category)
  const [published, setPublished] = useState(true)

  useEffect(() => {
    setTitle(ticket.subject)
    setCategory(ticket.category || KNOWLEDGE_CATEGORIES[0] || 'acesso')
    setBody(draftBody(ticket))
    setTags(ticket.category)
  }, [ticket])

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    if (busy) return
    if (ticket.status !== 'resolvido') {
      toast.error('só é possível criar artigo com o chamado encerrado')
      return
    }
    setBusy(true)
    try {
      const article = await createKnowledgeFromTicket({
        ticketId: ticket.id,
        title,
        category,
        body,
        tags: tags
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean),
        published,
        author: CURRENT_KB_AUTHOR,
      })
      toast.success('artigo criado na base')
      notifyKnowledgeChanged()
      onClose()
      openKnowledgeFocus(article.id)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'falha ao criar artigo')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/55 p-4">
      <form
        onSubmit={(event) => void onSubmit(event)}
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-[3px] border border-stroke bg-panel p-5 shadow-xl shadow-black/50"
      >
        <div className="mb-1 text-[10px] tracking-widest text-amber uppercase">
          base de conhecimento
        </div>
        <p className="mb-4 text-[13px] text-dim">
          cria artigo a partir do chamado #{ticket.id} (encerrado)
        </p>
        <Field label="título">
          <input
            required
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label="categoria">
          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            className={inputClass}
          >
            {[category, ...KNOWLEDGE_CATEGORIES.filter((item) => item !== category)].map(
              (item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ),
            )}
          </select>
        </Field>
        <Field label="conteúdo">
          <textarea
            required
            value={body}
            onChange={(event) => setBody(event.target.value)}
            className={`${inputClass} h-36 resize-y`}
          />
        </Field>
        <Field label="tags (separadas por vírgula)">
          <input
            value={tags}
            onChange={(event) => setTags(event.target.value)}
            className={inputClass}
          />
        </Field>
        <label className="mb-4 flex items-center gap-2 text-[10.5px] tracking-wide text-dim uppercase">
          <input
            type="checkbox"
            checked={published}
            onChange={(event) => setPublished(event.target.checked)}
          />
          publicar agora
        </label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-[3px] border border-stroke py-2 text-[10.5px] tracking-widest text-dim uppercase"
          >
            cancelar
          </button>
          <button
            type="submit"
            disabled={busy}
            className="flex-1 rounded-[3px] bg-amber py-2 text-[10.5px] font-bold tracking-widest text-amber-ink uppercase disabled:opacity-50"
          >
            {busy ? '…' : 'criar artigo'}
          </button>
        </div>
      </form>
    </div>
  )
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="mb-3 block">
      <span className="mb-1 block text-[10px] tracking-widest text-dim uppercase">
        {label}
      </span>
      {children}
    </label>
  )
}
