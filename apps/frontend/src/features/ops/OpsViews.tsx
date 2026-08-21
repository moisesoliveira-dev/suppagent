import { useState } from 'react'
import { FlapCell } from '../../shared/ui/FlapCell'
import {
  DetailPanel,
  PassLabel,
  PassSub,
  PassTitle,
  PriorityColor,
  StubBar,
} from '../../shared/ui/chrome'

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
