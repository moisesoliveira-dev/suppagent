import { useState } from 'react'
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

const CLIENTS = [
  {
    id: 'marina',
    name: 'marina costa — vertex corp',
    short: 'marina costa',
    plan: 'empresa',
    openLabel: '1 aberto',
    open: 1,
    last: '12m atrás',
    since: 'mar/23',
    sinceLong: 'desde mar/2023',
    email: 'marina.costa@vertexcorp.com',
    phone: '(11) 98421-0092',
    total: 7,
    tags: ['conta empresa', 'relatórios', 'prioritário'],
    tickets: [
      { label: '#4471 — erro ao gerar relatório', status: 'aberto' },
      { label: '#4390 — acesso a api', status: 'resolvido' },
      { label: '#4201 — faturamento', status: 'resolvido' },
    ],
  },
  {
    id: 'rafael',
    name: 'rafael nunes',
    short: 'rafael nunes',
    plan: 'pro',
    openLabel: '1 aberto',
    open: 1,
    last: '34m atrás',
    since: 'jun/24',
    sinceLong: 'desde jun/2024',
    email: 'rafael.nunes@email.com',
    phone: '(11) 90000-0000',
    total: 2,
    tags: ['acesso'],
    tickets: [{ label: '#4470 — não consigo acessar o painel', status: 'andamento' }],
  },
  {
    id: 'helena',
    name: 'helena duarte',
    short: 'helena duarte',
    plan: 'starter',
    openLabel: '1 aberto',
    open: 1,
    last: '1h atrás',
    since: 'jan/25',
    sinceLong: 'desde jan/2025',
    email: 'helena.duarte@email.com',
    phone: '—',
    total: 1,
    tags: ['csv'],
    tickets: [{ label: '#4468 — exportar dados em csv', status: 'aberto' }],
  },
  {
    id: 'joao',
    name: 'joão pedro lima',
    short: 'joão pedro lima',
    plan: 'pro',
    openLabel: '1 aguardando',
    open: 1,
    last: '2h atrás',
    since: 'out/22',
    sinceLong: 'desde out/2022',
    email: 'joao.lima@email.com',
    phone: '—',
    total: 3,
    tags: ['financeiro'],
    tickets: [{ label: '#4465 — cobrança duplicada — agosto', status: 'aguardando' }],
  },
  {
    id: 'studio',
    name: 'studio verde design',
    short: 'studio verde design',
    plan: 'empresa',
    openLabel: '1 andamento',
    open: 1,
    last: '3h atrás',
    since: 'fev/24',
    sinceLong: 'desde fev/2024',
    email: 'contato@studioverde.com',
    phone: '—',
    total: 4,
    tags: ['bug'],
    tickets: [{ label: '#4460 — botão de salvar — safari', status: 'andamento' }],
  },
  {
    id: 'diego',
    name: 'diego martins',
    short: 'diego martins',
    plan: 'starter',
    openLabel: '0 aberto',
    open: 0,
    last: '1d atrás',
    since: 'mai/25',
    sinceLong: 'desde mai/2025',
    email: 'diego@email.com',
    phone: '—',
    total: 1,
    tags: [],
    tickets: [{ label: '#4452 — alterar e-mail de cobrança', status: 'resolvido' }],
  },
]

export function ClientsView() {
  const [selectedId, setSelectedId] = useState('marina')
  const [wave, setWave] = useState(0)
  const selected = CLIENTS.find((client) => client.id === selectedId) ?? CLIENTS[0]

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
        <div className="flex flex-col gap-1.5" key={wave}>
          {CLIENTS.map((client, index) => {
            const selectedRow = client.id === selectedId
            const delay = Math.min(index, 30) * 45
            return (
              <button
                key={client.id}
                type="button"
                onClick={() => {
                  setSelectedId(client.id)
                  setWave((value) => value + 1)
                }}
                className="grid w-full grid-cols-[1fr_130px_100px_110px_90px] gap-1.5 text-left [perspective:700px]"
              >
                <FlapCell delayMs={delay} selected={selectedRow}>
                  {client.name}
                </FlapCell>
                <FlapCell delayMs={delay} selected={selectedRow} className="font-normal text-dim">
                  {client.plan}
                </FlapCell>
                <FlapCell
                  delayMs={delay}
                  selected={selectedRow}
                  className={client.open === 0 ? 'text-dim' : 'text-amber'}
                >
                  {client.openLabel}
                </FlapCell>
                <FlapCell delayMs={delay} selected={selectedRow}>
                  {client.last}
                </FlapCell>
                <FlapCell delayMs={delay} selected={selectedRow} align="end" className="font-normal text-dim">
                  {client.since}
                </FlapCell>
              </button>
            )
          })}
        </div>
      </div>
      <DetailPanel>
        <PassLabel>cliente · plano {selected.plan}</PassLabel>
        <PassTitle>{selected.short}</PassTitle>
        <PassSub>
          {selected.id === 'marina' ? 'vertex corp' : selected.plan} · {selected.sinceLong}
        </PassSub>
        <StubBar />
        <div className="mb-5 grid grid-cols-2 gap-3">
          <div>
            <PassLabel>e-mail</PassLabel>
            <div className="text-[12.5px]">{selected.email}</div>
          </div>
          <div>
            <PassLabel>telefone</PassLabel>
            <div className="text-[12.5px]">{selected.phone}</div>
          </div>
          <div>
            <PassLabel>chamados abertos</PassLabel>
            <div className="text-[12.5px] text-amber">{selected.open}</div>
          </div>
          <div>
            <PassLabel>total de chamados</PassLabel>
            <div className="text-[12.5px]">{selected.total}</div>
          </div>
        </div>
        <div className="mb-4 flex flex-wrap gap-1.5">
          {selected.tags.map((tag) => (
            <span key={tag} className="rounded-[3px] border border-stroke bg-tile px-2 py-1 text-[10px] tracking-wide text-dim uppercase">
              {tag}
            </span>
          ))}
        </div>
        <div className="mb-2 text-[10.5px] tracking-widest text-dim uppercase">chamados relacionados</div>
        {selected.tickets.map((ticket) => (
          <RelTicket key={ticket.label} label={ticket.label} status={ticket.status} />
        ))}
        <ActionBar>
          <ActionButton primary>novo chamado</ActionButton>
          <IconButton label="editar cliente" tone="accent">
            <PencilIcon />
          </IconButton>
        </ActionBar>
      </DetailPanel>
    </div>
  )
}
