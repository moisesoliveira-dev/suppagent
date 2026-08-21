import { useEffect, useState, type FormEvent } from 'react'
import { FlapCell } from '../../shared/ui/FlapCell'
import {
  ActionBar,
  ActionButton,
  DetailPanel,
  PassLabel,
  PassSub,
  PassTitle,
  RelTicket,
  StubBar,
} from '../../shared/ui/chrome'
import { IconButton } from '../../shared/ui/IconButton'
import { PencilIcon } from '../../shared/ui/icons'
import { toast } from '../../shared/ui/toast'
import { openTicketFocus } from '../shell/shell-nav'
import { openCreateTicketDialog } from '../tickets/tickets-ui'
import type { Client, ClientPlan } from './clients'
import { CLIENT_PLAN_OPTIONS } from './clients'
import { listClients, updateClient } from './clients-api'
import { notifyClientsChanged, onClientsChanged } from './clients-ui'

const inputClass =
  'w-full rounded-[3px] border border-stroke bg-board px-3 py-2 text-[12.5px] text-ink'

export function ClientsView() {
  const [items, setItems] = useState<Client[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [wave, setWave] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editing, setEditing] = useState(false)
  const [busy, setBusy] = useState(false)
  const [name, setName] = useState('')
  const [company, setCompany] = useState('')
  const [plan, setPlan] = useState<ClientPlan>('starter')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [tagsText, setTagsText] = useState('')

  async function load(preferId?: string | null) {
    setLoading(true)
    setError(null)
    try {
      const data = await listClients()
      setItems(data.items)
      setSelectedId((current) => {
        const next = preferId ?? current
        if (next && data.items.some((item) => item.id === next)) return next
        return data.items[0]?.id ?? null
      })
    } catch (err) {
      setItems([])
      setSelectedId(null)
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

  const selected =
    items.find((client) => client.id === selectedId) ?? items[0] ?? null

  function startEdit() {
    if (!selected) return
    setName(selected.name)
    setCompany(selected.company ?? '')
    setPlan(selected.plan)
    setEmail(selected.email)
    setPhone(selected.phone ?? '')
    setTagsText(selected.tags.join(', '))
    setEditing(true)
  }

  async function onSave(event: FormEvent) {
    event.preventDefault()
    if (!selected || busy) return
    setBusy(true)
    try {
      const tags = tagsText
        .split(/[,;]/)
        .map((tag) => tag.trim())
        .filter(Boolean)
      await updateClient(selected.id, {
        name,
        company: company.trim() || null,
        plan,
        email,
        phone: phone.trim() || null,
        tags,
      })
      setEditing(false)
      await load(selected.id)
      notifyClientsChanged()
      toast.success('cliente atualizado')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'falha ao salvar')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex min-h-0 flex-1">
      <div className="min-w-0 flex-1 overflow-y-auto px-6 py-4">
        <div className="mb-2.5 grid grid-cols-[1fr_130px_100px_110px_90px] px-2.5 text-[10px] tracking-widest text-dim uppercase">
          <span>cliente</span>
          <span>plano</span>
          <span>chamados</span>
          <span>último contato</span>
          <span className="text-right">desde</span>
        </div>

        {error ? (
          <div className="mb-3 rounded-[3px] border border-red/40 bg-tile px-3 py-2 text-xs text-red">
            {error}
          </div>
        ) : null}

        {loading ? (
          <div className="px-2.5 text-xs text-dim">carregando…</div>
        ) : null}

        {!loading && items.length === 0 ? (
          <div className="px-2.5 text-xs text-dim">
            nenhum cliente cadastrado — use Cadastros → clientes
          </div>
        ) : null}

        <div className="flex flex-col gap-1.5" key={wave}>
          {items.map((client, index) => {
            const selectedRow = client.id === selected?.id
            const delay = Math.min(index, 30) * 45
            return (
              <button
                key={client.id}
                type="button"
                onClick={() => {
                  setSelectedId(client.id)
                  setEditing(false)
                  setWave((value) => value + 1)
                }}
                className="grid w-full grid-cols-[1fr_130px_100px_110px_90px] gap-1.5 text-left [perspective:700px]"
              >
                <FlapCell delayMs={delay} selected={selectedRow}>
                  {client.displayName}
                </FlapCell>
                <FlapCell delayMs={delay} selected={selectedRow} className="font-normal text-dim">
                  {client.plan}
                </FlapCell>
                <FlapCell
                  delayMs={delay}
                  selected={selectedRow}
                  className={client.openCount === 0 ? 'text-dim' : 'text-amber'}
                >
                  {client.openLabel}
                </FlapCell>
                <FlapCell delayMs={delay} selected={selectedRow}>
                  {client.lastContact}
                </FlapCell>
                <FlapCell
                  delayMs={delay}
                  selected={selectedRow}
                  align="end"
                  className="font-normal text-dim"
                >
                  {client.since}
                </FlapCell>
              </button>
            )
          })}
        </div>
      </div>

      <DetailPanel>
        {!selected ? (
          <div className="text-xs text-dim">selecione um cliente</div>
        ) : editing ? (
          <form onSubmit={(event) => void onSave(event)}>
            <PassLabel>editar cliente</PassLabel>
            <PassTitle>{selected.name}</PassTitle>
            <label className="mb-3 block">
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
            <label className="mb-3 block">
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
            <label className="mb-3 block">
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
            <label className="mb-3 block">
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
            <label className="mb-3 block">
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
            <label className="mb-3 block">
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
            <ActionBar>
              <button
                type="submit"
                disabled={busy}
                className="flex-1 rounded-[3px] border border-amber bg-amber py-2 text-center text-[10.5px] font-bold tracking-widest text-amber-ink uppercase disabled:opacity-50"
              >
                {busy ? 'salvando…' : 'salvar'}
              </button>
              <ActionButton
                onClick={() => {
                  if (!busy) setEditing(false)
                }}
              >
                cancelar
              </ActionButton>
            </ActionBar>
          </form>
        ) : (
          <>
            <PassLabel>cliente · plano {selected.plan}</PassLabel>
            <PassTitle>{selected.name}</PassTitle>
            <PassSub>
              {selected.company ?? selected.plan} · {selected.sinceLong}
            </PassSub>
            <StubBar />
            <div className="mb-5 grid grid-cols-2 gap-3">
              <div>
                <PassLabel>e-mail</PassLabel>
                <div className="text-[12.5px]">{selected.email}</div>
              </div>
              <div>
                <PassLabel>telefone</PassLabel>
                <div className="text-[12.5px]">{selected.phone ?? '—'}</div>
              </div>
              <div>
                <PassLabel>chamados abertos</PassLabel>
                <div className="text-[12.5px] text-amber">{selected.openCount}</div>
              </div>
              <div>
                <PassLabel>total de chamados</PassLabel>
                <div className="text-[12.5px]">{selected.totalTickets}</div>
              </div>
            </div>
            {selected.tags.length > 0 ? (
              <div className="mb-4 flex flex-wrap gap-1.5">
                {selected.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-[3px] border border-stroke bg-tile px-2 py-1 text-[10px] tracking-wide text-dim uppercase"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            ) : null}
            <div className="mb-2 text-[10.5px] tracking-widest text-dim uppercase">
              chamados relacionados
            </div>
            {selected.tickets.length === 0 ? (
              <div className="mb-3 text-xs text-dim">nenhum chamado vinculado</div>
            ) : (
              selected.tickets.map((ticket) => (
                <button
                  key={ticket.id}
                  type="button"
                  onClick={() => openTicketFocus(ticket.id)}
                  className="block w-full text-left"
                >
                  <RelTicket label={ticket.label} status={ticket.status} />
                </button>
              ))
            )}
            <ActionBar>
              <ActionButton
                primary
                onClick={() =>
                  openCreateTicketDialog({
                    requester: selected.name,
                    email: selected.email,
                  })
                }
              >
                novo chamado
              </ActionButton>
              <IconButton label="editar cliente" tone="accent" onClick={startEdit}>
                <PencilIcon />
              </IconButton>
            </ActionBar>
          </>
        )}
      </DetailPanel>
    </div>
  )
}
