import { useState } from 'react'
import { FlapCell } from '../../shared/ui/FlapCell'
import { Toggle } from '../../shared/ui/Toggle'
import {
  DetailPanel,
  PassLabel,
  PassSub,
  PassTitle,
  PriorityColor,
  RelTicket,
  StubBar,
} from '../../shared/ui/chrome'

const RULES = [
  { id: 'fin', name: 'Atribuir chamados financeiros', meta: 'novo chamado · 214 execuções', on: true, title: 'Atribuir chamados financeiros', sub: 'criada por camila reis · atualizada há 2 semanas', runs: '214', last: 'há 12 min', trigger: 'novo chamado é criado', condition: 'categoria = financeiro', action: 'atribuir para camila reis / prioridade = média', history: [['#4465 — cobrança duplicada — agosto', 'aguardando']] as [string, string][] },
  { id: 'escalar', name: 'Escalar urgentes sem resposta', meta: 'sem resposta 30min · 42 execuções', on: true, title: 'Escalar urgentes sem resposta', sub: 'criada por bruno alves · atualizada há 1 semana', runs: '42', last: 'há 3 horas', trigger: 'chamado sem resposta há 30 minutos', condition: 'prioridade = urgente', action: 'notificar coordenador / marcar tag "escalado"', history: [['#4441 — pagamento não é confirmado', 'andamento']] as [string, string][] },
  { id: 'fechar', name: 'Fechar chamados resolvidos', meta: 'resolvido há 3 dias · 189 execuções', on: true, title: 'Fechar chamados resolvidos', sub: 'criada por camila reis · atualizada há 1 mês', runs: '189', last: 'há 6 horas', trigger: 'status = resolvido há 3 dias', condition: 'sem nova resposta do cliente', action: 'fechar chamado / enviar aviso de encerramento', history: [['#4452 — alterar e-mail de cobrança', 'resolvido']] as [string, string][] },
  { id: 'safari', name: 'Alertar bugs no Safari', meta: 'categoria = bug · 8 execuções', on: false, title: 'Alertar bugs no Safari', sub: 'criada por camila reis · atualizada há 3 dias · inativa', runs: '8', last: 'há 5 horas', trigger: 'novo chamado é criado', condition: 'categoria = bug e menciona "safari"', action: 'marcar tag "safari" / notificar equipe de dev', history: [['#4460 — botão de salvar — safari', 'andamento']] as [string, string][] },
  { id: 'csat', name: 'Enviar pesquisa de satisfação', meta: 'chamado encerrado · 301 execuções', on: true, title: 'Enviar pesquisa de satisfação', sub: 'criada por bruno alves · atualizada há 5 dias', runs: '301', last: 'há 40 min', trigger: 'chamado é encerrado', condition: 'cliente respondeu ao menos 1 vez', action: 'enviar pesquisa de satisfação por e-mail', history: [['#4430 — senha resetada com sucesso', 'resolvido']] as [string, string][] },
]

export function AutomationsView() {
  const [selectedId, setSelectedId] = useState('fin')
  const [toggles, setToggles] = useState<Record<string, boolean>>(
    Object.fromEntries(RULES.map((rule) => [rule.id, rule.on])),
  )
  const rule = RULES.find((item) => item.id === selectedId) ?? RULES[0]

  return (
    <div className="flex min-h-0 flex-1">
      <div className="w-[280px] shrink-0 overflow-y-auto border-r border-stroke bg-panel px-4 py-4">
        <div className="mb-3 text-[10px] tracking-widest text-dim uppercase">regras de automação</div>
        {RULES.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setSelectedId(item.id)}
            className={`mb-2 w-full rounded border px-3 py-3 text-left ${
              selectedId === item.id ? 'border-amber bg-tile' : 'border-stroke bg-tile'
            }`}
          >
            <div className="mb-2 flex items-start justify-between gap-2">
              <span className="text-xs font-bold leading-snug">{item.name}</span>
              <Toggle
                on={toggles[item.id]}
                onToggle={() => setToggles((current) => ({ ...current, [item.id]: !current[item.id] }))}
              />
            </div>
            <div className="text-[10.5px] text-dim">{item.meta}</div>
          </button>
        ))}
      </div>
      <div className="min-w-0 flex-1 overflow-y-auto px-7 py-5">
        <p className="mb-1 text-[17px] font-bold tracking-wide text-amber">{rule.title}</p>
        <div className="mb-5 text-[11.5px] text-dim">{rule.sub}</div>
        <div className="mb-6 flex gap-6">
          <div>
            <PassLabel>execuções</PassLabel>
            <div className="text-base font-bold">{rule.runs}</div>
          </div>
          <div>
            <PassLabel>última execução</PassLabel>
            <div className="text-base font-bold">{rule.last}</div>
          </div>
        </div>
        <div className="mb-7 flex flex-wrap items-stretch gap-2.5">
          <div className="min-w-[180px] flex-1 rounded border border-amber bg-board px-4 py-3.5">
            <div className="mb-2 text-[10px] font-bold tracking-widest text-amber uppercase">gatilho</div>
            <div className="text-[12.5px] leading-relaxed">{rule.trigger}</div>
          </div>
          <div className="flex items-center text-base text-dim">→</div>
          <div className="min-w-[180px] flex-1 rounded border border-blue bg-board px-4 py-3.5">
            <div className="mb-2 text-[10px] font-bold tracking-widest text-blue uppercase">condição</div>
            <div className="text-[12.5px] leading-relaxed">{rule.condition}</div>
          </div>
          <div className="flex items-center text-base text-dim">→</div>
          <div className="min-w-[180px] flex-1 rounded border border-green bg-board px-4 py-3.5">
            <div className="mb-2 text-[10px] font-bold tracking-widest text-green uppercase">ação</div>
            <div className="text-[12.5px] leading-relaxed">{rule.action}</div>
          </div>
        </div>
        <div className="mb-2 text-[10.5px] tracking-widest text-dim uppercase">histórico recente</div>
        {rule.history.map(([label, status]) => (
          <RelTicket key={label} label={label} status={status} />
        ))}
      </div>
    </div>
  )
}

const SLA_ROWS = [
  { id: '4448', subject: 'sistema fora do ar — login não abre', prio: 'urgente', resp: 'vencida', resol: 'restam 5min', respTone: 'breach', resolTone: 'breach', meta: 'chamado nº 4448 · urgente', sub: 'política aplicada: urgente · resposta 15min / resolução 4h', respText: 'vencida há 3min', respColor: 'text-red', respSub: 'prazo era 15min · sla de resposta não cumprido', resolText: 'restam 5min', resolColor: 'text-red', resolSub: 'vencimento previsto às 12:55', log: [['12:40', 'chamado aberto — sla iniciado'], ['12:53', 'alerta crítico — restam menos de 10min']] as [string, string][] },
  { id: '4471', subject: 'erro ao gerar relatório mensal', prio: 'urgente', resp: 'cumprida', resol: 'restam 1h48', respTone: 'ok', resolTone: 'warn', meta: 'chamado nº 4471 · urgente', sub: 'política aplicada: urgente · resposta 15min / resolução 4h', respText: 'cumprida em 8min', respColor: 'text-green', respSub: 'prazo era 15min · dentro do sla', resolText: 'restam 1h 48min', resolColor: 'text-amber', resolSub: 'vencimento previsto às 16:04', log: [['12:04', 'chamado aberto — sla iniciado'], ['12:12', 'primeira resposta enviada — dentro do prazo']] as [string, string][] },
  { id: '4441', subject: 'pagamento não é confirmado', prio: 'urgente', resp: 'cumprida', resol: 'vencida há 20min', respTone: 'ok', resolTone: 'breach', meta: 'chamado nº 4441 · urgente', sub: 'política aplicada: urgente · resposta 15min / resolução 4h', respText: 'cumprida em 6min', respColor: 'text-green', respSub: 'prazo era 15min · dentro do sla', resolText: 'vencida há 20min', resolColor: 'text-red', resolSub: 'sla de resolução não cumprido', log: [['11:20', 'chamado aberto — sla iniciado']] as [string, string][] },
  { id: '4438', subject: 'duplicidade de registro', prio: 'alta', resp: 'restam 12min', resol: 'restam 6h40', respTone: 'warn', resolTone: 'ok', meta: 'chamado nº 4438 · alta', sub: 'política aplicada: alta · resposta 30min / resolução 8h', respText: 'restam 12min', respColor: 'text-amber', respSub: 'prazo de 30min ainda em andamento', resolText: 'restam 6h 40min', resolColor: 'text-green', resolSub: 'vencimento previsto às 19:15', log: [['11:35', 'chamado aberto — sla iniciado']] as [string, string][] },
  { id: '4465', subject: 'cobrança duplicada — agosto', prio: 'alta', resp: 'cumprida', resol: 'restam 3h10', respTone: 'ok', resolTone: 'warn', meta: 'chamado nº 4465 · alta', sub: 'política aplicada: alta · resposta 30min / resolução 8h', respText: 'cumprida em 14min', respColor: 'text-green', respSub: 'prazo era 30min · dentro do sla', resolText: 'restam 3h 10min', resolColor: 'text-amber', resolSub: 'vencimento previsto às 15:20', log: [['10:10', 'chamado aberto — sla iniciado']] as [string, string][] },
]

function countdownClass(tone: string) {
  if (tone === 'ok') return 'text-green'
  if (tone === 'warn') return 'text-amber'
  return 'text-red'
}

export function SlaView() {
  const [selectedId, setSelectedId] = useState('4471')
  const [wave, setWave] = useState(0)
  const selected = SLA_ROWS.find((row) => row.id === selectedId) ?? SLA_ROWS[1]

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="grid grid-cols-4 gap-2.5 px-6 pt-4">
        {[
          { name: 'urgente', targets: 'resposta: 15min · resolução: 4h', pct: '92%', color: 'text-red', bar: 'bg-green', width: '92%' },
          { name: 'alta', targets: 'resposta: 30min · resolução: 8h', pct: '87%', color: 'text-red', bar: 'bg-amber', width: '87%' },
          { name: 'média', targets: 'resposta: 2h · resolução: 24h', pct: '95%', color: 'text-amber', bar: 'bg-green', width: '95%' },
          { name: 'baixa', targets: 'resposta: 8h · resolução: 72h', pct: '98%', color: 'text-dim', bar: 'bg-green', width: '98%' },
        ].map((policy) => (
          <div key={policy.name} className="rounded border border-stroke bg-tile px-3.5 py-3">
            <div className={`mb-2 text-[11px] font-bold tracking-wide uppercase ${policy.color}`}>{policy.name}</div>
            <div className="mb-2.5 text-[10.5px] leading-relaxed text-dim">{policy.targets}</div>
            <div className="mb-1 flex justify-between text-[10px] text-dim">
              <span>cumprimento</span>
              <b className="text-ink">{policy.pct}</b>
            </div>
            <div className="h-[5px] overflow-hidden rounded-[3px] bg-board">
              <div className={`h-full ${policy.bar}`} style={{ width: policy.width }} />
            </div>
          </div>
        ))}
      </div>
      <div className="flex min-h-0 flex-1">
        <div className="min-w-0 flex-1 overflow-y-auto px-6 py-4">
          <div className="mb-2 grid grid-cols-[70px_1fr_90px_130px_130px] px-2.5 text-[10px] tracking-widest text-dim uppercase">
            <span>ticket</span>
            <span>assunto</span>
            <span>prioridade</span>
            <span>1ª resposta</span>
            <span>resolução</span>
          </div>
          <div className="flex flex-col gap-1.5" key={wave}>
            {SLA_ROWS.map((row, index) => {
              const selectedRow = row.id === selectedId
              const delay = Math.min(index, 30) * 45
              return (
                <button
                  key={row.id}
                  type="button"
                  onClick={() => {
                    setSelectedId(row.id)
                    setWave((value) => value + 1)
                  }}
                  className="grid w-full grid-cols-[70px_1fr_90px_130px_130px] gap-1.5 text-left [perspective:700px]"
                >
                  <FlapCell delayMs={delay} selected={selectedRow}>
                    #{row.id}
                  </FlapCell>
                  <FlapCell delayMs={delay} selected={selectedRow} className="font-normal normal-case">
                    {row.subject}
                  </FlapCell>
                  <FlapCell delayMs={delay} selected={selectedRow}>
                    <PriorityColor priority={row.prio} />
                  </FlapCell>
                  <FlapCell delayMs={delay} selected={selectedRow} className={countdownClass(row.respTone)}>
                    {row.resp}
                  </FlapCell>
                  <FlapCell delayMs={delay} selected={selectedRow} className={countdownClass(row.resolTone)}>
                    {row.resol}
                  </FlapCell>
                </button>
              )
            })}
          </div>
        </div>
        <DetailPanel>
          <PassLabel>{selected.meta}</PassLabel>
          <PassTitle>{selected.subject}</PassTitle>
          <PassSub>{selected.sub}</PassSub>
          <StubBar />
          <div className="mb-2.5 rounded border border-stroke bg-board px-3.5 py-3">
            <div className="mb-1.5 text-[10px] tracking-widest text-dim uppercase">1ª resposta</div>
            <div className={`mb-1 text-[15px] font-bold ${selected.respColor}`}>{selected.respText}</div>
            <div className="text-[11px] text-dim">{selected.respSub}</div>
          </div>
          <div className="mb-2.5 rounded border border-stroke bg-board px-3.5 py-3">
            <div className="mb-1.5 text-[10px] tracking-widest text-dim uppercase">resolução</div>
            <div className={`mb-1 text-[15px] font-bold ${selected.resolColor}`}>{selected.resolText}</div>
            <div className="text-[11px] text-dim">{selected.resolSub}</div>
          </div>
          <div className="mb-2 text-[10.5px] tracking-widest text-dim uppercase">linha do tempo do sla</div>
          {selected.log.map(([time, text]) => (
            <div key={`${time}-${text}`} className="mb-1.5 text-[11.5px] leading-relaxed text-dim">
              <span className="mr-1.5 text-ink">{time}</span>
              {text}
            </div>
          ))}
        </DetailPanel>
      </div>
    </div>
  )
}

export function ReportsView() {
  const [active, setActive] = useState<Record<string, boolean>>({
    volume: true,
    team: true,
    sla: false,
  })

  return (
    <div className="min-h-0 flex-1 overflow-y-auto px-7 py-5">
      <div className="mb-3 text-[10.5px] tracking-widest text-dim uppercase">modelos de relatório</div>
      <div className="mb-7 grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-3">
        {[
          ['volume de chamados', 'total de chamados abertos, resolvidos e por categoria em um período.', 'último: hoje, 08:00'],
          ['desempenho da equipe', 'chamados resolvidos, tempo médio e csat por agente.', 'último: ontem, 18:00'],
          ['cumprimento de sla', 'taxa de cumprimento de resposta e resolução por prioridade.', 'último: 3d atrás'],
          ['satisfação do cliente', 'notas de csat, comentários e tendência ao longo do tempo.', 'último: 1sem atrás'],
          ['chamados por cliente', 'histórico e frequência de chamados agrupados por conta.', 'nunca gerado'],
          ['uso da base de conhecimento', 'artigos mais acessados e chamados evitados por autoatendimento.', 'último: 4d atrás'],
        ].map(([title, desc, meta]) => (
          <div key={title} className="rounded border border-stroke bg-tile px-4 py-4">
            <div className="mb-1.5 text-[13px] font-bold">{title}</div>
            <div className="mb-3.5 text-[11.5px] leading-relaxed text-dim">{desc}</div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-dim">{meta}</span>
              <button type="button" className="rounded-[3px] border border-amber px-3 py-1.5 text-[10.5px] tracking-wide text-amber uppercase hover:bg-amber hover:text-amber-ink">
                gerar
              </button>
            </div>
          </div>
        ))}
      </div>
      <div className="mb-3 text-[10.5px] tracking-widest text-dim uppercase">relatórios agendados</div>
      <div className="mb-2 grid grid-cols-[1fr_110px_130px_150px_70px] px-2.5 text-[10px] tracking-widest text-dim uppercase">
        <span>relatório</span>
        <span>frequência</span>
        <span>próximo envio</span>
        <span>destinatários</span>
        <span className="text-center">ativo</span>
      </div>
      {[
        { id: 'volume', name: 'volume de chamados — semanal', freq: 'toda segunda, 08:00', next: '25/08, 08:00', recip: 'camila.reis@balcao.com' },
        { id: 'team', name: 'desempenho da equipe — mensal', freq: 'todo dia 1, 09:00', next: '01/09, 09:00', recip: 'coordenação' },
        { id: 'sla', name: 'cumprimento de sla — diário', freq: 'todos os dias, 07:00', next: '20/08, 07:00', recip: 'camila.reis@balcao.com' },
      ].map((row) => (
        <div key={row.id} className="mb-1.5 grid grid-cols-[1fr_110px_130px_150px_70px] items-center gap-1.5">
          <FlapCell>{row.name}</FlapCell>
          <FlapCell className="font-normal text-dim">{row.freq}</FlapCell>
          <FlapCell className="font-normal text-amber">{row.next}</FlapCell>
          <FlapCell className="font-normal text-dim">{row.recip}</FlapCell>
          <div className="flex justify-center">
            <Toggle on={active[row.id]} onToggle={() => setActive((current) => ({ ...current, [row.id]: !current[row.id] }))} />
          </div>
        </div>
      ))}
      <button type="button" className="mt-3 w-full rounded-[3px] border border-dashed border-stroke py-2.5 text-[11px] tracking-wide text-dim uppercase hover:border-amber hover:text-amber">
        + novo agendamento
      </button>
    </div>
  )
}
