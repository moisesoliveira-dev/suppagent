import { useEffect, useState, type FormEvent } from 'react'
import { IconButton } from '../../shared/ui/IconButton'
import { TrashIcon } from '../../shared/ui/icons'
import { toast } from '../../shared/ui/toast'
import type { Client, ClientPlan } from './clients'
import { CLIENT_PLAN_OPTIONS } from './clients'
import { createClient, deleteClient, listClients } from './clients-api'
import { notifyClientsChanged, onClientsChanged } from './clients-ui'

const inputClass =
  'w-full rounded-[3px] border border-stroke bg-board px-3 py-2 text-[12.5px] text-ink'

export function ClientsCatalogPanel() {
  const [items, setItems] = useState<Client[]>([])
  const [name, setName] = useState('')
  const [company, setCompany] = useState('')
  const [plan, setPlan] = useState<ClientPlan>('starter')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [tagsText, setTagsText] = useState('')
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const data = await listClients()
      setItems(data.items)
    } catch (err) {
      setItems([])
      setError(err instanceof Error ? err.message : 'falha ao carregar clientes')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
    return onClientsChanged(() => {
      void load()
    })
  }, [])

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    if (busy) return
    setBusy(true)
    setError(null)
    try {
      const tags = tagsText
        .split(/[,;]/)
        .map((tag) => tag.trim())
        .filter(Boolean)
      await createClient({
        name,
        company: company.trim() || null,
        plan,
        email,
        phone: phone.trim() || null,
        tags,
      })
      setName('')
      setCompany('')
      setPlan('starter')
      setEmail('')
      setPhone('')
      setTagsText('')
      setShowForm(false)
      await load()
      notifyClientsChanged()
      toast.success('cliente cadastrado')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'falha ao cadastrar'
      setError(message)
      toast.error(message)
    } finally {
      setBusy(false)
    }
  }

  async function onRemove(client: Client) {
    const ok = await toast.confirm({
      title: 'remover cliente',
      message: `remover ${client.name} do cadastro?`,
      confirmLabel: 'remover',
    })
    if (!ok) return
    setBusy(true)
    setError(null)
    try {
      await deleteClient(client.id)
      await load()
      notifyClientsChanged()
      toast.success('cliente removido')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'falha ao remover'
      setError(message)
      toast.error(message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="max-w-[620px]">
      <p className="mb-1 text-[15px] font-bold">clientes</p>
      <p className="mb-6 text-[11.5px] text-dim">
        cadastre contas e vincule chamados pelo e-mail do solicitante
      </p>

      {error ? (
        <div className="mb-3 rounded-[3px] border border-red/40 bg-tile px-3 py-2 text-xs text-red">
          {error}
        </div>
      ) : null}

      {loading ? (
        <div className="mb-3 text-xs text-dim">carregando…</div>
      ) : null}

      {!loading && items.length === 0 ? (
        <div className="mb-3 text-xs text-dim">nenhum cliente cadastrado</div>
      ) : null}

      {items.map((client) => (
        <div
          key={client.id}
          className="mb-2 flex max-w-[560px] items-center justify-between gap-3 rounded border border-stroke bg-tile px-4 py-3"
        >
          <div className="min-w-0">
            <div className="mb-0.5 text-[12.5px] font-bold">{client.displayName}</div>
            <div className="text-[10.5px] text-dim">
              {client.email} · plano {client.plan}
              {client.openCount > 0 ? ` · ${client.openLabel}` : ''}
            </div>
          </div>
          <IconButton
            label="remover"
            tone="danger"
            disabled={busy}
            onClick={() => void onRemove(client)}
          >
            <TrashIcon />
          </IconButton>
        </div>
      ))}

      {!showForm ? (
        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="mt-4 text-[11px] font-bold tracking-wide text-amber uppercase"
        >
          + novo cliente
        </button>
      ) : (
        <form onSubmit={(event) => void onSubmit(event)} className="mt-4 max-w-[560px] space-y-3">
          <label className="block">
            <span className="mb-1.5 block text-[10px] tracking-widest text-dim uppercase">
              nome
            </span>
            <input
              required
              value={name}
              onChange={(event) => setName(event.target.value)}
              className={inputClass}
              disabled={busy}
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-[10px] tracking-widest text-dim uppercase">
              empresa
            </span>
            <input
              value={company}
              onChange={(event) => setCompany(event.target.value)}
              className={inputClass}
              disabled={busy}
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-[10px] tracking-widest text-dim uppercase">
              plano
            </span>
            <select
              value={plan}
              onChange={(event) => setPlan(event.target.value as ClientPlan)}
              className={inputClass}
              disabled={busy}
            >
              {CLIENT_PLAN_OPTIONS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-1.5 block text-[10px] tracking-widest text-dim uppercase">
              e-mail
            </span>
            <input
              required
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className={inputClass}
              disabled={busy}
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-[10px] tracking-widest text-dim uppercase">
              telefone
            </span>
            <input
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              className={inputClass}
              disabled={busy}
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-[10px] tracking-widest text-dim uppercase">
              tags (vírgula)
            </span>
            <input
              value={tagsText}
              onChange={(event) => setTagsText(event.target.value)}
              className={inputClass}
              disabled={busy}
            />
          </label>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={busy}
              className="rounded-[3px] border border-amber bg-amber px-3 py-2 text-[10.5px] font-bold tracking-widest text-amber-ink uppercase disabled:opacity-50"
            >
              {busy ? 'salvando…' : 'cadastrar'}
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => setShowForm(false)}
              className="rounded-[3px] border border-stroke px-3 py-2 text-[10.5px] tracking-widest text-ink uppercase"
            >
              cancelar
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
