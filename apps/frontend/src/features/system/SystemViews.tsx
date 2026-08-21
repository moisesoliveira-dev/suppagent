import { useState, type ReactNode } from 'react'
import { FlapCell } from '../../shared/ui/FlapCell'
import { Toggle } from '../../shared/ui/Toggle'
import {
  ActionBar,
  ActionButton,
  DetailPanel,
  PassLabel,
  PassSub,
  PassTitle,
  StubBar,
} from '../../shared/ui/chrome'
import { AutomationsCatalogPanel } from '../automations/AutomationsCatalogPanel'
import { CannedCatalogPanel } from '../canned/CannedCatalogPanel'
import { SlaPoliciesCatalogPanel } from '../sla/SlaPoliciesCatalogPanel'
import { UsersCatalogPanel } from '../users/UsersCatalogPanel'
import { TeamChatsCatalogPanel } from '../chat/TeamChatsCatalogPanel'
import { NotificationsSettingsPanel } from '../notifications/NotificationsSettingsPanel'

function SettingsShell({
  items,
  children,
}: {
  items: { id: string; label: string }[]
  children: (id: string) => ReactNode
}) {
  const [active, setActive] = useState(items[0]?.id ?? '')
  return (
    <div className="flex min-h-0 flex-1">
      <div className="w-[210px] shrink-0 border-r border-stroke bg-panel px-3 py-4">
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setActive(item.id)}
            className={`mb-0.5 w-full rounded-[3px] px-3 py-2 text-left text-xs tracking-wide ${
              active === item.id ? 'border border-stroke bg-tile text-amber' : 'text-dim hover:bg-tile hover:text-ink'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
      <div className="min-w-0 flex-1 overflow-y-auto px-7 py-6">{children(active)}</div>
    </div>
  )
}

function Panel({ title, sub, children }: { title: string; sub: string; children: ReactNode }) {
  return (
    <div className="max-w-[620px]">
      <p className="mb-1 text-[15px] font-bold">{title}</p>
      <p className="mb-6 text-[11.5px] text-dim">{sub}</p>
      {children}
    </div>
  )
}

export function SettingsView() {
  const [toggles, setToggles] = useState({ tfa: false, audit: true })
  const [cats, setCats] = useState(['financeiro', 'acesso', 'bug', 'suporte técnico', 'sugestão'])

  return (
    <SettingsShell
      items={[
        { id: 'geral', label: 'geral' },
        { id: 'categorias', label: 'categorias de chamados' },
        { id: 'notificacoes', label: 'notificações' },
        { id: 'integracoes', label: 'integrações' },
        { id: 'seguranca', label: 'segurança' },
        { id: 'plano', label: 'plano e faturamento' },
      ]}
    >
      {(id) => {
        if (id === 'geral') {
          return (
            <Panel title="geral" sub="informações básicas da sua central de atendimento">
              {[
                ['nome da empresa', 'Balcão Atendimento Ltda'],
                ['fuso horário', 'américa/são_paulo (gmt-3)'],
                ['idioma padrão', 'português (brasil)'],
                ['horário de atendimento', 'seg a sex, 08:00 às 18:00'],
              ].map(([label, value]) => (
                <div key={label} className="mb-5 max-w-[380px]">
                  <div className="mb-1.5 text-[10px] tracking-widest text-dim uppercase">{label}</div>
                  <div className="rounded-[3px] border border-stroke bg-tile px-3 py-2 text-[12.5px]">{value}</div>
                </div>
              ))}
            </Panel>
          )
        }
        if (id === 'categorias') {
          return (
            <Panel title="categorias de chamados" sub="usadas para classificar e rotear chamados automaticamente">
              <div className="mb-4 flex flex-wrap gap-2">
                {cats.map((cat) => (
                  <span key={cat} className="flex items-center gap-2 rounded-[3px] border border-stroke bg-tile px-2.5 py-1.5 text-[11.5px]">
                    {cat}
                    <button type="button" className="text-dim" onClick={() => setCats((current) => current.filter((item) => item !== cat))}>
                      ✕
                    </button>
                  </span>
                ))}
              </div>
              <button type="button" className="rounded-[3px] border border-dashed border-stroke px-3.5 py-2 text-[11px] text-dim uppercase hover:border-amber hover:text-amber">
                + nova categoria
              </button>
            </Panel>
          )
        }
        if (id === 'notificacoes') {
          return <NotificationsSettingsPanel />
        }
        if (id === 'integracoes') {
          return (
            <Panel title="integrações" sub="conecte outras ferramentas à sua central de atendimento">
              {(
                [
                  ['e-mail (imap/smtp)', 'criação automática de chamados a partir de e-mails', true],
                  ['slack', 'notificações de chamados urgentes em um canal', true],
                  ['webhook', 'enviar eventos de chamados para um sistema externo', false],
                ] as const
              ).map(([name, desc, on]) => (
                <div key={name} className="mb-2 flex max-w-[460px] items-center justify-between rounded border border-stroke bg-tile px-4 py-3">
                  <div>
                    <div className="mb-0.5 text-[12.5px] font-bold">{name}</div>
                    <div className="text-[11px] text-dim">{desc}</div>
                  </div>
                  <span className={`rounded-[3px] px-2.5 py-1 text-[10.5px] uppercase ${on ? 'border border-green text-green' : 'border border-stroke text-dim'}`}>
                    {on ? 'conectado' : 'desconectado'}
                  </span>
                </div>
              ))}
            </Panel>
          )
        }
        if (id === 'seguranca') {
          return (
            <Panel title="segurança" sub="controle de acesso e proteção da conta">
              <div className="flex max-w-[460px] items-start justify-between border-b border-stroke py-3">
                <div>
                  <div className="mb-0.5 text-[12.5px]">autenticação de dois fatores obrigatória</div>
                  <div className="max-w-[340px] text-[11px] text-dim">exigir 2fa para todos os agentes no próximo login.</div>
                </div>
                <Toggle on={toggles.tfa} onToggle={() => setToggles((current) => ({ ...current, tfa: !current.tfa }))} />
              </div>
              <div className="flex max-w-[460px] items-start justify-between border-b border-stroke py-3">
                <div>
                  <div className="mb-0.5 text-[12.5px]">log de auditoria</div>
                  <div className="max-w-[340px] text-[11px] text-dim">registrar todas as alterações feitas em chamados e configurações.</div>
                </div>
                <Toggle on={toggles.audit} onToggle={() => setToggles((current) => ({ ...current, audit: !current.audit }))} />
              </div>
            </Panel>
          )
        }
        return (
          <Panel title="plano e faturamento" sub="detalhes do seu plano atual e histórico de cobrança">
            <div className="mb-5 max-w-[460px] rounded border border-amber bg-tile px-5 py-4">
              <div className="mb-1 text-[15px] font-bold text-amber">plano empresa</div>
              <div className="mb-3.5 text-[11.5px] text-dim">r$ 890/mês · renova em 05/09/2026</div>
              <div className="mb-1 flex justify-between text-[10.5px] text-dim">
                <span>chamados no mês</span>
                <span>842 / 2.000</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-[3px] bg-board">
                <div className="h-full rounded-[3px] bg-amber" style={{ width: '42%' }} />
              </div>
            </div>
            <button type="button" className="max-w-[200px] rounded-[3px] border border-stroke bg-tile px-3 py-2 text-[10.5px] uppercase">
              ver faturas anteriores
            </button>
          </Panel>
        )
      }}
    </SettingsShell>
  )
}

export function CatalogView() {
  return (
    <SettingsShell
      items={[
        { id: 'usuarios', label: 'usuários' },
        { id: 'chats-equipe', label: 'bate-papos da equipe' },
        { id: 'automacoes', label: 'automações' },
        { id: 'respostas-prontas', label: 'respostas prontas' },
        { id: 'setores', label: 'setores' },
        { id: 'cargos', label: 'cargos' },
        { id: 'canais', label: 'canais de atendimento' },
        { id: 'prioridades', label: 'prioridades' },
        { id: 'motivos', label: 'motivos de encerramento' },
      ]}
    >
      {(id) => {
        if (id === 'usuarios') return <UsersCatalogPanel />
        if (id === 'chats-equipe') return <TeamChatsCatalogPanel />
        if (id === 'automacoes') return <AutomationsCatalogPanel />
        if (id === 'prioridades') return <SlaPoliciesCatalogPanel />
        if (id === 'respostas-prontas') return <CannedCatalogPanel />

        const data: Record<string, { title: string; sub: string; rows: { name: string; meta: string }[] }> = {
          setores: {
            title: 'setores',
            sub: 'departamentos para os quais os chamados podem ser roteados',
            rows: [
              { name: 'financeiro', meta: 'responsável: camila reis · 38 chamados vinculados' },
              { name: 'suporte técnico', meta: 'responsável: bruno alves · 24 chamados vinculados' },
              { name: 'produto / desenvolvimento', meta: 'responsável: equipe de dev · 18 chamados vinculados' },
              { name: 'comercial', meta: 'responsável: rafael souza · 9 chamados vinculados' },
            ],
          },
          cargos: {
            title: 'cargos',
            sub: 'funções que definem o nível de permissão de cada pessoa da equipe',
            rows: [
              { name: 'administrador', meta: 'acesso completo, incluindo configurações e faturamento' },
              { name: 'coordenador', meta: 'gerencia equipe, sla e automações · 1 pessoa' },
              { name: 'agente', meta: 'atende e responde chamados · 2 pessoas' },
              { name: 'agente jr', meta: 'acesso limitado a chamados de baixa prioridade · 1 pessoa' },
            ],
          },
          canais: {
            title: 'canais de atendimento',
            sub: 'por onde os clientes podem abrir um chamado',
            rows: [
              { name: 'e-mail', meta: 'suporte@balcao.com · ativo' },
              { name: 'chat do site', meta: 'widget embutido · ativo' },
              { name: 'whatsapp', meta: '(11) 4000-1234 · ativo' },
              { name: 'telefone', meta: '0800 123 4567 · inativo' },
            ],
          },
          motivos: {
            title: 'motivos de encerramento',
            sub: 'usados ao fechar um chamado, para alimentar os relatórios',
            rows: [
              { name: 'resolvido pelo agente', meta: '421 chamados encerrados com este motivo' },
              { name: 'resolvido pela ia', meta: '156 chamados encerrados com este motivo' },
              { name: 'duplicado', meta: '32 chamados encerrados com este motivo' },
              { name: 'cliente não respondeu', meta: '67 chamados encerrados com este motivo' },
              { name: 'cancelado pelo cliente', meta: '14 chamados encerrados com este motivo' },
            ],
          },
        }
        const panel = data[id]
        if (!panel) return null
        return (
          <Panel title={panel.title} sub={panel.sub}>
            {panel.rows.map((row) => (
              <div key={row.name} className="mb-2 flex max-w-[560px] items-center justify-between rounded border border-stroke bg-tile px-4 py-3">
                <div>
                  <div className="mb-0.5 text-[12.5px] font-bold">{row.name}</div>
                  <div className="text-[10.5px] text-dim">{row.meta}</div>
                </div>
                <div className="flex gap-1.5">
                  <button type="button" className="rounded-[3px] border border-stroke px-2.5 py-1.5 text-[10.5px] text-dim uppercase hover:border-amber hover:text-amber">
                    editar
                  </button>
                  <button type="button" className="rounded-[3px] border border-stroke px-2.5 py-1.5 text-[10.5px] text-dim uppercase hover:border-red hover:text-red">
                    remover
                  </button>
                </div>
              </div>
            ))}
            <button type="button" className="mt-1.5 w-full max-w-[560px] rounded-[3px] border border-dashed border-stroke py-2 text-[11px] text-dim uppercase hover:border-amber hover:text-amber">
              + novo
            </button>
          </Panel>
        )
      }}
    </SettingsShell>
  )
}

const IA_ANSWERS: Record<string, string> = {
  'qual o sla da categoria financeiro?':
    'A política de SLA para financeiro segue a prioridade: urgente (15min / 4h), alta (30min / 8h), média (2h / 24h) e baixa (8h / 72h).',
  'resuma o histórico da marina costa':
    'Marina Costa é cliente do plano Empresa desde março de 2023, com 7 chamados. Tem 1 aberto agora (#4471, urgente).',
  'como funciona o roteamento automático?':
    'A IA analisa o texto e o histórico. Confiança ≥ 80% aplica o roteamento; abaixo disso vai para revisão humana.',
  'o que é uma resposta de baixa confiança?':
    'É quando a similaridade fica abaixo de ~70%. A IA sugere a resposta, mas espera aprovação humana.',
}

export function AiChatView() {
  const [messages, setMessages] = useState([
    { role: 'assistant' as const, html: 'Olá! Posso responder perguntas sobre chamados, clientes, SLA e o funcionamento geral do sistema.' },
    { role: 'user' as const, html: 'quantos chamados urgentes estão em aberto agora?' },
    { role: 'assistant' as const, html: 'Há <b>6 chamados urgentes</b> em aberto agora. Três deles (#4471, #4448 e #4441) já estão vencidos ou muito próximos do prazo.' },
  ])
  const [draft, setDraft] = useState('')

  function send(text: string) {
    if (!text.trim()) return
    const key = text.trim().toLowerCase()
    const answer =
      IA_ANSWERS[key] ??
      'Deixa eu verificar isso na base de chamados… (resposta simulada neste protótipo.)'
    setMessages((current) => [...current, { role: 'user', html: text }, { role: 'assistant', html: answer }])
    setDraft('')
  }

  return (
    <div className="flex min-h-0 flex-1">
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          {messages.map((message, index) => (
            <div key={`${message.html}-${index}`} className={`mb-3.5 flex max-w-[80%] gap-2 ${message.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}>
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[3px] border border-stroke bg-board text-[10px] font-bold text-amber">
                {message.role === 'user' ? 'CR' : 'IA'}
              </div>
              <div
                className={`rounded-md px-3 py-2 text-[12.5px] leading-relaxed ${
                  message.role === 'user' ? 'bg-amber text-amber-ink' : 'border border-stroke bg-tile'
                }`}
                dangerouslySetInnerHTML={{ __html: message.html }}
              />
            </div>
          ))}
        </div>
        <div className="flex flex-wrap gap-1.5 px-5 pb-2">
          {Object.keys(IA_ANSWERS).map((chip) => (
            <button
              key={chip}
              type="button"
              onClick={() => send(chip)}
              className="rounded-full border border-stroke px-3 py-1.5 text-[10.5px] text-dim hover:text-ink"
            >
              {chip}
            </button>
          ))}
        </div>
        <div className="flex gap-2 border-t border-stroke px-5 py-3">
          <textarea
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault()
                send(draft)
              }
            }}
            placeholder="pergunte sobre chamados, clientes, o domínio do negócio…"
            className="h-10 flex-1 resize-none rounded border border-stroke bg-tile px-3 py-2 text-[12.5px]"
          />
          <button type="button" onClick={() => send(draft)} className="rounded-[3px] bg-amber px-4 text-[11px] font-bold text-amber-ink uppercase">
            enviar
          </button>
        </div>
      </div>
      <aside className="w-[280px] shrink-0 overflow-y-auto border-l border-stroke bg-panel p-5">
        <PassLabel>domínio conectado</PassLabel>
        <PassSub>fontes que a ia consulta para responder</PassSub>
        {[
          ['base de chamados', '1.284 registros'],
          ['clientes', '312 contas'],
          ['base de conhecimento', '6 artigos'],
          ['políticas de sla', '4 políticas'],
          ['documentação do domínio', 'manual interno'],
        ].map(([name, count]) => (
          <div key={name} className="mb-2 flex justify-between rounded border border-stroke bg-tile px-3 py-2 text-[11.5px]">
            <span>{name}</span>
            <span className="text-dim">{count}</span>
          </div>
        ))}
      </aside>
    </div>
  )
}

const ROUTES = [
  { id: '4482', subject: 'não recebi o reembolso do mês passado', cat: 'financeiro', dest: 'camila reis', conf: '94%', status: 'aplicado', tone: 'high', meta: 'chamado nº 4482 · financeiro', title: 'não recebi o reembolso do mês passado', sub: 'marina costa · cliente com histórico de 7 chamados', signals: ['palavra-chave detectada: "reembolso"', 'cliente com histórico em chamados financeiros'] },
  { id: '4474', subject: 'dúvida sobre cancelamento do plano', cat: 'indefinido', dest: '— revisar —', conf: '62%', status: 'revisão', tone: 'low', meta: 'chamado nº 4474 · classificação incerta', title: 'dúvida sobre cancelamento do plano', sub: 'pedro alves · sem histórico anterior de chamados', signals: ['palavras-chave: "cancelar", "dúvida", "plano"', 'cliente sem chamados anteriores'] },
  { id: '4481', subject: 'erro ao fazer login pelo aplicativo', cat: 'acesso', dest: 'bruno alves', conf: '88%', status: 'aplicado', tone: 'high', meta: 'chamado nº 4481 · acesso', title: 'erro ao fazer login pelo aplicativo', sub: 'rafael nunes · 2 chamados', signals: ['palavras-chave: "login", "erro"', 'chamado semelhante resolvido por bruno'] },
]

export function AiRoutingView() {
  const [selectedId, setSelectedId] = useState('4474')
  const [wave, setWave] = useState(0)
  const selected = ROUTES.find((row) => row.id === selectedId) ?? ROUTES[1]

  return (
    <div className="flex min-h-0 flex-1">
      <div className="min-w-0 flex-1 overflow-y-auto px-6 py-4">
        <div className="mb-2 grid grid-cols-[70px_1fr_110px_130px_90px_110px] px-2.5 text-[10px] tracking-widest text-dim uppercase">
          <span>ticket</span>
          <span>assunto</span>
          <span>categoria (ia)</span>
          <span>destino sugerido</span>
          <span>confiança</span>
          <span>status</span>
        </div>
        <div className="flex flex-col gap-1.5" key={wave}>
          {ROUTES.map((row, index) => {
            const selectedRow = row.id === selectedId
            const delay = Math.min(index, 30) * 45
            const confColor = row.tone === 'high' ? 'text-green' : row.tone === 'low' ? 'text-red' : 'text-amber'
            return (
              <button
                key={row.id}
                type="button"
                onClick={() => {
                  setSelectedId(row.id)
                  setWave((value) => value + 1)
                }}
                className="grid w-full grid-cols-[70px_1fr_110px_130px_90px_110px] gap-1.5 text-left [perspective:700px]"
              >
                <FlapCell delayMs={delay} selected={selectedRow}>
                  #{row.id}
                </FlapCell>
                <FlapCell delayMs={delay} selected={selectedRow} className="font-normal normal-case">
                  {row.subject}
                </FlapCell>
                <FlapCell delayMs={delay} selected={selectedRow} className="font-normal text-dim">
                  {row.cat}
                </FlapCell>
                <FlapCell delayMs={delay} selected={selectedRow} className="font-normal">
                  {row.dest}
                </FlapCell>
                <FlapCell delayMs={delay} selected={selectedRow} className={confColor}>
                  {row.conf}
                </FlapCell>
                <FlapCell delayMs={delay} selected={selectedRow} className={row.status === 'aplicado' ? 'text-green' : 'text-amber'}>
                  {row.status}
                </FlapCell>
              </button>
            )
          })}
        </div>
      </div>
      <DetailPanel>
        <PassLabel>{selected.meta}</PassLabel>
        <PassTitle>{selected.title}</PassTitle>
        <PassSub>{selected.sub}</PassSub>
        <StubBar />
        <div className="mb-4">
          <div className="mb-1 flex justify-between text-[10px] text-dim">
            <span>confiança da classificação</span>
            <span>{selected.conf}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-[3px] bg-board">
            <div className={`h-full ${selected.tone === 'high' ? 'bg-green' : selected.tone === 'low' ? 'bg-red' : 'bg-amber'}`} style={{ width: selected.conf }} />
          </div>
        </div>
        {selected.signals.map((signal) => (
          <div key={signal} className="flex gap-2 border-b border-stroke py-1.5 text-xs">
            <span className="text-amber">·</span>
            {signal}
          </div>
        ))}
        <ActionBar>
          <ActionButton primary>aplicar roteamento</ActionButton>
          <ActionButton>revisar</ActionButton>
        </ActionBar>
      </DetailPanel>
    </div>
  )
}

const REPLIES = [
  { id: '4479', label: '#4479 — exportar meus dados', client: 'joão paulo', conf: '91%', status: 'enviada automaticamente', tone: 'high', meta: 'chamado nº 4479 · joão paulo', title: 'como faço para exportar meus dados?', sub: 'confiança da resposta: 91% · enviada automaticamente', question: 'quero fazer um backup de todos os meus dados…', answer: 'Você pode exportar em CSV pelo menu Relatórios → Exportar.', sources: [['#4468 — exportar dados em csv', '91%']] as [string, string][] },
  { id: '4474', label: '#4474 — dúvida sobre cancelamento', client: 'pedro alves', conf: '62%', status: 'aguardando aprovação', tone: 'low', meta: 'chamado nº 4474 · pedro alves', title: 'dúvida sobre cancelamento do plano', sub: 'confiança da resposta: 62% · aguardando aprovação humana', question: 'quero cancelar minha assinatura, o que acontece com meus dados?', answer: 'Ao cancelar, seus dados ficam guardados por 90 dias antes de serem removidos.', sources: [['#4123 — cancelamento e retenção de dados', '85%']] as [string, string][] },
]

export function AiRepliesView() {
  const [selectedId, setSelectedId] = useState('4474')
  const selected = REPLIES.find((row) => row.id === selectedId) ?? REPLIES[1]

  return (
    <div className="flex min-h-0 flex-1">
      <div className="min-w-0 flex-1 overflow-y-auto px-6 py-4">
        <div className="mb-2 grid grid-cols-[1fr_130px_110px_1fr] px-2.5 text-[10px] tracking-widest text-dim uppercase">
          <span>chamado</span>
          <span>cliente</span>
          <span>similaridade</span>
          <span>status</span>
        </div>
        <div className="flex flex-col gap-1.5">
          {REPLIES.map((row, index) => {
            const selectedRow = row.id === selectedId
            const delay = Math.min(index, 30) * 45
            return (
              <button
                key={row.id}
                type="button"
                onClick={() => setSelectedId(row.id)}
                className="grid w-full grid-cols-[1fr_130px_110px_1fr] gap-1.5 text-left [perspective:700px]"
              >
                <FlapCell delayMs={delay} selected={selectedRow}>
                  {row.label}
                </FlapCell>
                <FlapCell delayMs={delay} selected={selectedRow}>
                  {row.client}
                </FlapCell>
                <FlapCell delayMs={delay} selected={selectedRow} className={row.tone === 'high' ? 'text-green' : 'text-red'}>
                  {row.conf}
                </FlapCell>
                <FlapCell delayMs={delay} selected={selectedRow} className={row.tone === 'high' ? 'text-green' : 'text-amber'}>
                  {row.status}
                </FlapCell>
              </button>
            )
          })}
        </div>
      </div>
      <DetailPanel>
        <PassLabel>{selected.meta}</PassLabel>
        <PassTitle>{selected.title}</PassTitle>
        <PassSub>{selected.sub}</PassSub>
        <StubBar />
        <div className="mb-3 rounded border border-stroke bg-board px-3 py-3">
          <div className="mb-1 text-[10px] tracking-widest text-dim uppercase">pergunta do cliente</div>
          <div className="text-[12.5px] leading-relaxed">{selected.question}</div>
        </div>
        <div className="mb-3 rounded border border-amber bg-board px-3 py-3">
          <div className="mb-1 text-[10px] tracking-widest text-dim uppercase">resposta gerada pela ia</div>
          <div className="text-[12.5px] leading-relaxed">{selected.answer}</div>
        </div>
        {selected.sources.map(([label, pct]) => (
          <div key={label} className="flex justify-between border-b border-stroke py-2 text-xs">
            <span>{label}</span>
            <span className="text-amber">{pct}</span>
          </div>
        ))}
        <ActionBar>
          <ActionButton primary>aprovar e enviar</ActionButton>
          <ActionButton>editar resposta</ActionButton>
        </ActionBar>
      </DetailPanel>
    </div>
  )
}

export function AiConfigView() {
  const [route, setRoute] = useState(80)
  const [resp, setResp] = useState(70)
  const [caps, setCaps] = useState({ route: true, reply: true, chat: true, close: false })

  return (
    <SettingsShell
      items={[
        { id: 'capacidades', label: 'capacidades' },
        { id: 'limites', label: 'limites de confiança' },
        { id: 'modelos', label: 'modelos e chaves de api' },
        { id: 'guardrails', label: 'guardrails' },
        { id: 'tom', label: 'personalidade e tom' },
      ]}
    >
      {(id) => {
        if (id === 'capacidades') {
          return (
            <Panel title="capacidades do agente" sub="o que a ia pode fazer sozinha, sem intervenção humana">
              {(
                [
                  ['route', 'roteamento automático', 'classificar e atribuir chamados ao setor e responsável certos.'],
                  ['reply', 'respostas automáticas', 'responder clientes com base em chamados e artigos já resolvidos.'],
                  ['chat', 'chat interno com a ia', 'permitir que a equipe pergunte sobre dados e o domínio do negócio.'],
                  ['close', 'fechamento automático', 'encerrar chamados resolvidos sem retorno do cliente após 3 dias.'],
                ] as const
              ).map(([key, name, desc]) => (
                <div key={key} className="flex max-w-[520px] items-start justify-between border-b border-stroke py-3">
                  <div>
                    <div className="mb-0.5 text-[12.5px]">{name}</div>
                    <div className="max-w-[380px] text-[11px] text-dim">{desc}</div>
                  </div>
                  <Toggle on={caps[key]} onToggle={() => setCaps((current) => ({ ...current, [key]: !current[key] }))} />
                </div>
              ))}
            </Panel>
          )
        }
        if (id === 'limites') {
          return (
            <Panel title="limites de confiança" sub="abaixo desses valores, a ia envia o chamado para revisão humana">
              <div className="mb-6 max-w-[460px]">
                <div className="mb-1 flex justify-between text-[12px]">
                  <span>roteamento automático</span>
                  <b>{route}%</b>
                </div>
                <input type="range" min={50} max={99} value={route} onChange={(event) => setRoute(Number(event.target.value))} className="w-full" />
                <div className="mt-1 text-[11px] text-dim">
                  chamados abaixo de <b>{route}%</b> vão para revisão.
                </div>
              </div>
              <div className="max-w-[460px]">
                <div className="mb-1 flex justify-between text-[12px]">
                  <span>resposta automática ao cliente</span>
                  <b>{resp}%</b>
                </div>
                <input type="range" min={50} max={99} value={resp} onChange={(event) => setResp(Number(event.target.value))} className="w-full" />
                <div className="mt-1 text-[11px] text-dim">
                  respostas abaixo de <b>{resp}%</b> aguardam aprovação.
                </div>
              </div>
            </Panel>
          )
        }
        if (id === 'modelos') {
          return (
            <Panel title="modelos e chaves de api" sub="provedores de ia conectados">
              <div className="mb-3 max-w-[460px] rounded border border-amber bg-tile px-4 py-4">
                <div className="mb-2 flex justify-between">
                  <div>
                    <div className="font-bold">claude sonnet 4.5</div>
                    <div className="text-[11px] text-dim">anthropic</div>
                  </div>
                  <span className="rounded-[3px] border border-green px-2 py-1 text-[10.5px] text-green uppercase">ativo</span>
                </div>
                <div className="text-[11px] text-dim">chave de api sk-ant-••••••••••1a4f</div>
              </div>
            </Panel>
          )
        }
        if (id === 'tom') {
          return (
            <Panel title="personalidade e tom" sub="como a ia se comunica com os clientes">
              <div className="mb-5 max-w-[380px]">
                <div className="mb-1.5 text-[10px] tracking-widest text-dim uppercase">tom de resposta</div>
                <div className="rounded-[3px] border border-stroke bg-tile px-3 py-2 text-[12.5px]">amigável e direto</div>
              </div>
            </Panel>
          )
        }
        return (
          <Panel title="guardrails" sub="limites de segurança que a ia nunca deve ultrapassar">
            <div className="text-[12.5px] text-dim">nunca solicitar dados de pagamento · não dar aconselhamento jurídico · restringir respostas ao domínio</div>
          </Panel>
        )
      }}
    </SettingsShell>
  )
}
