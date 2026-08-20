import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from 'react'
import {
  ActionBar,
  ActionButton,
  PassLabel,
  RelTicket,
} from '../../shared/ui/chrome'
import { toast } from '../../shared/ui/toast'
import {
  consumeKnowledgeFocus,
  openTicketFocus,
  useShellNav,
} from '../shell/shell-nav'
import {
  createKnowledgeArticle,
  getKnowledgeArticle,
  listKnowledge,
  updateKnowledgeArticle,
} from './knowledge-api'
import {
  CURRENT_KB_AUTHOR,
  KNOWLEDGE_CATEGORIES,
  type KnowledgeArticle,
} from './knowledge'
import { notifyKnowledgeChanged, onKnowledgeChanged } from './knowledge-ui'

const inputClass =
  'w-full rounded-[3px] border border-stroke bg-board px-3 py-2 text-[12.5px] text-ink'

function categoryLabel(category: string) {
  return category === 'relatorios' ? 'relatórios' : category
}

export function KnowledgeView() {
  const { knowledgeFocusId } = useShellNav()
  const [cat, setCat] = useState('todos')
  const [query, setQuery] = useState('')
  const [rows, setRows] = useState<KnowledgeArticle[]>([])
  const [openId, setOpenId] = useState<string | null>(null)
  const [article, setArticle] = useState<KnowledgeArticle | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [createOpen, setCreateOpen] = useState(false)
  const [editing, setEditing] = useState(false)

  const categories = useMemo(() => {
    const fromRows = rows.map((item) => item.category)
    return ['todos', ...Array.from(new Set([...KNOWLEDGE_CATEGORIES, ...fromRows]))]
  }, [rows])

  async function loadList() {
    setLoading(true)
    setError(null)
    try {
      const data = await listKnowledge({
        category: cat === 'todos' ? undefined : cat,
        q: query.trim() || undefined,
      })
      setRows(data.items)
    } catch (err) {
      setRows([])
      setError(err instanceof Error ? err.message : 'falha ao carregar base')
    } finally {
      setLoading(false)
    }
  }

  async function openArticle(id: string) {
    setBusy(true)
    setError(null)
    try {
      const item = await getKnowledgeArticle(id)
      setArticle(item)
      setOpenId(id)
      setEditing(false)
      setRows((current) =>
        current.map((row) => (row.id === item.id ? item : row)),
      )
    } catch (err) {
      const message = err instanceof Error ? err.message : 'falha ao abrir artigo'
      setError(message)
      toast.error(message)
    } finally {
      setBusy(false)
    }
  }

  useEffect(() => {
    void loadList()
    return onKnowledgeChanged(() => {
      void loadList()
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cat])

  useEffect(() => {
    if (!knowledgeFocusId) return
    const id = consumeKnowledgeFocus()
    if (!id) return
    void openArticle(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [knowledgeFocusId])

  async function onTogglePublish() {
    if (!article || busy) return
    setBusy(true)
    try {
      const updated = await updateKnowledgeArticle(article.id, {
        published: !article.published,
      })
      setArticle(updated)
      notifyKnowledgeChanged()
      toast.success(updated.published ? 'artigo publicado' : 'artigo em rascunho')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'falha ao atualizar')
    } finally {
      setBusy(false)
    }
  }

  async function onSaveEdit(input: {
    title: string
    category: string
    body: string
    tags: string[]
  }) {
    if (!article || busy) return
    setBusy(true)
    try {
      const updated = await updateKnowledgeArticle(article.id, input)
      setArticle(updated)
      setEditing(false)
      notifyKnowledgeChanged()
      toast.success('artigo atualizado')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'falha ao salvar')
    } finally {
      setBusy(false)
    }
  }

  if (article && openId) {
    return (
      <div className="min-h-0 flex-1 overflow-y-auto px-7 py-6">
        <button
          type="button"
          onClick={() => {
            setOpenId(null)
            setArticle(null)
            setEditing(false)
            void loadList()
          }}
          className="mb-4 text-[11px] tracking-wide text-dim uppercase hover:text-amber"
        >
          ← voltar para a base
        </button>
        {editing ? (
          <ArticleEditor
            initial={article}
            busy={busy}
            onCancel={() => setEditing(false)}
            onSave={(input) => void onSaveEdit(input)}
          />
        ) : (
          <>
            <p className="mb-1.5 text-[19px] font-bold tracking-wide text-amber">
              {article.title}
            </p>
            <div className="mb-5 text-[11.5px] text-dim">{article.meta}</div>
            <div className="mb-4 flex gap-5">
              <div>
                <PassLabel>visualizações</PassLabel>
                <div className="text-sm font-bold">{article.views}</div>
              </div>
              <div>
                <PassLabel>útil</PassLabel>
                <div className="text-sm font-bold text-green">{article.useful}</div>
              </div>
              <div>
                <PassLabel>chamados evitados</PassLabel>
                <div className="text-sm font-bold text-amber">{article.saved}</div>
              </div>
            </div>
            <div className="mb-4 border-l-2 border-stroke pl-3 text-[12.5px] leading-relaxed whitespace-pre-wrap">
              {article.body}
            </div>
            <div className="mb-4 flex flex-wrap gap-1.5">
              {article.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-[3px] border border-stroke bg-tile px-2 py-1 text-[10px] text-dim uppercase"
                >
                  {tag}
                </span>
              ))}
            </div>
            {article.sourceTicketId ? (
              <RelTicket
                label={`#${article.sourceTicketId} — origem`}
                status="resolvido"
              />
            ) : null}
            <ActionBar>
              <ActionButton primary onClick={() => setEditing(true)}>
                editar artigo
              </ActionButton>
              <ActionButton onClick={() => void onTogglePublish()}>
                {article.published ? 'despublicar' : 'publicar'}
              </ActionButton>
              {article.sourceTicketId ? (
                <ActionButton onClick={() => openTicketFocus(article.sourceTicketId!)}>
                  ver chamado
                </ActionButton>
              ) : null}
            </ActionBar>
          </>
        )}
      </div>
    )
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-7 py-6">
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') void loadList()
          }}
          placeholder="buscar artigos…"
          className="max-w-xs flex-1 rounded-[3px] border border-stroke bg-board px-3 py-2 text-[11.5px] text-ink placeholder:text-dim"
        />
        <button
          type="button"
          onClick={() => void loadList()}
          className="rounded-[3px] border border-stroke px-3 py-2 text-[10.5px] tracking-wide text-dim uppercase hover:border-amber hover:text-amber"
        >
          buscar
        </button>
        <button
          type="button"
          onClick={() => setCreateOpen(true)}
          className="ml-auto rounded-[3px] bg-amber px-3 py-2 text-[10.5px] font-bold tracking-wide text-amber-ink uppercase"
        >
          novo artigo
        </button>
      </div>
      <div className="mb-4 flex flex-wrap gap-1.5">
        {categories.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setCat(item)}
            className={`rounded-full border px-3 py-1.5 text-[10.5px] tracking-wide uppercase ${
              cat === item ? 'border-amber text-amber' : 'border-stroke bg-tile text-dim'
            }`}
          >
            {categoryLabel(item)}
          </button>
        ))}
      </div>
      {loading ? <div className="text-[12px] text-dim">carregando…</div> : null}
      {error ? <div className="mb-3 text-[12px] text-red">{error}</div> : null}
      {!loading && rows.length === 0 ? (
        <div className="text-[12px] text-dim">nenhum artigo encontrado</div>
      ) : null}
      <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-3">
        {rows.map((card) => (
          <button
            key={card.id}
            type="button"
            onClick={() => void openArticle(card.id)}
            className="rounded border border-stroke bg-tile px-4 py-3.5 text-left hover:border-dim"
          >
            <div className="mb-2.5 flex items-center justify-between">
              <span className="text-[9.5px] tracking-widest text-dim uppercase">
                {categoryLabel(card.category)}
              </span>
              <span
                className={`h-1.5 w-1.5 rounded-full ${card.published ? 'bg-green' : 'bg-dim'}`}
              />
            </div>
            <div className="mb-3.5 text-[13px] font-bold leading-snug">{card.title}</div>
            <div className="flex justify-between text-[10.5px] text-dim">
              <span>{card.viewsLabel}</span>
              <span>{card.age}</span>
            </div>
          </button>
        ))}
      </div>
      {createOpen ? (
        <CreateArticleDialog
          onClose={() => setCreateOpen(false)}
          onCreated={(created) => {
            setCreateOpen(false)
            notifyKnowledgeChanged()
            void openArticle(created.id)
          }}
        />
      ) : null}
    </div>
  )
}

function CreateArticleDialog({
  onClose,
  onCreated,
}: {
  onClose: () => void
  onCreated: (article: KnowledgeArticle) => void
}) {
  const [busy, setBusy] = useState(false)
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState(KNOWLEDGE_CATEGORIES[0] ?? 'acesso')
  const [body, setBody] = useState('')
  const [tags, setTags] = useState('')
  const [published, setPublished] = useState(false)

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    if (busy) return
    setBusy(true)
    try {
      const article = await createKnowledgeArticle({
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
      toast.success('artigo criado')
      onCreated(article)
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
          novo artigo
        </div>
        <p className="mb-4 text-[13px] text-dim">cria um artigo na base de conhecimento</p>
        <Field label="título">
          <input required value={title} onChange={(e) => setTitle(e.target.value)} className={inputClass} />
        </Field>
        <Field label="categoria">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className={inputClass}
          >
            {KNOWLEDGE_CATEGORIES.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </Field>
        <Field label="conteúdo">
          <textarea
            required
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className={`${inputClass} h-28 resize-y`}
          />
        </Field>
        <Field label="tags (separadas por vírgula)">
          <input value={tags} onChange={(e) => setTags(e.target.value)} className={inputClass} />
        </Field>
        <label className="mb-4 flex items-center gap-2 text-[10.5px] tracking-wide text-dim uppercase">
          <input
            type="checkbox"
            checked={published}
            onChange={(e) => setPublished(e.target.checked)}
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
            {busy ? '…' : 'criar'}
          </button>
        </div>
      </form>
    </div>
  )
}

function ArticleEditor({
  initial,
  busy,
  onCancel,
  onSave,
}: {
  initial: KnowledgeArticle
  busy: boolean
  onCancel: () => void
  onSave: (input: {
    title: string
    category: string
    body: string
    tags: string[]
  }) => void
}) {
  const [title, setTitle] = useState(initial.title)
  const [category, setCategory] = useState(initial.category)
  const [body, setBody] = useState(initial.body)
  const [tags, setTags] = useState(initial.tags.join(', '))

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        onSave({
          title,
          category,
          body,
          tags: tags
            .split(',')
            .map((item) => item.trim())
            .filter(Boolean),
        })
      }}
      className="max-w-2xl"
    >
      <Field label="título">
        <input required value={title} onChange={(e) => setTitle(e.target.value)} className={inputClass} />
      </Field>
      <Field label="categoria">
        <input required value={category} onChange={(e) => setCategory(e.target.value)} className={inputClass} />
      </Field>
      <Field label="conteúdo">
        <textarea
          required
          value={body}
          onChange={(e) => setBody(e.target.value)}
          className={`${inputClass} h-40 resize-y`}
        />
      </Field>
      <Field label="tags">
        <input value={tags} onChange={(e) => setTags(e.target.value)} className={inputClass} />
      </Field>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-[3px] border border-stroke px-4 py-2 text-[10.5px] tracking-widest text-dim uppercase"
        >
          cancelar
        </button>
        <button
          type="submit"
          disabled={busy}
          className="rounded-[3px] bg-amber px-4 py-2 text-[10.5px] font-bold tracking-widest text-amber-ink uppercase disabled:opacity-50"
        >
          salvar
        </button>
      </div>
    </form>
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
