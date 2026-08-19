import { useState } from 'react'

const BARS = [
  { label: 'seg', value: 18, height: '58%' },
  { label: 'ter', value: 22, height: '71%' },
  { label: 'qua', value: 15, height: '48%' },
  { label: 'qui', value: 27, height: '87%' },
  { label: 'sex', value: 31, height: '100%', hot: true },
  { label: 'sáb', value: 9, height: '29%' },
  { label: 'dom', value: 6, height: '19%' },
]

export function DashboardView() {
  const [range, setRange] = useState('7 dias')

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-7 py-5">
      <div className="mb-4 flex justify-end">
        {['hoje', '7 dias', '30 dias', '90 dias'].map((item, index) => (
          <button
            key={item}
            type="button"
            onClick={() => setRange(item)}
            className={`border px-3 py-1.5 text-[11px] tracking-wide uppercase ${
              index === 0 ? 'rounded-l-[3px]' : ''
            } ${index === 3 ? 'rounded-r-[3px]' : ''} ${
              range === item ? 'border-amber bg-tile text-amber' : 'border-stroke bg-tile text-dim'
            }`}
          >
            {item}
          </button>
        ))}
      </div>
      <div className="mb-6 grid grid-cols-4 gap-2.5">
        {[
          { label: 'chamados abertos', value: '128', delta: '↑ 12% vs período anterior', up: true },
          { label: 'resolvidos no período', value: '98', delta: '↑ 6% vs período anterior', up: true },
          { label: 'tempo médio de resolução', value: '6h 40m', delta: '↓ 9% vs período anterior', up: false },
          { label: 'csat médio', value: '93%', delta: '↑ 2pts vs período anterior', up: true },
        ].map((kpi) => (
          <div key={kpi.label} className="rounded border border-stroke bg-tile px-4 py-3.5">
            <div className="mb-2 text-[10px] tracking-widest text-dim uppercase">{kpi.label}</div>
            <div className="mb-1.5 text-2xl font-bold">{kpi.value}</div>
            <div className={`text-[10.5px] ${kpi.up ? 'text-green' : 'text-red'}`}>{kpi.delta}</div>
          </div>
        ))}
      </div>
      <div className="mb-3 grid grid-cols-2 gap-3">
        <div className="rounded border border-stroke bg-tile px-4 py-4">
          <div className="mb-4 text-[10.5px] tracking-widest text-dim uppercase">
            volume de chamados — últimos 7 dias
          </div>
          <div className="flex h-[130px] items-end gap-2.5">
            {BARS.map((bar) => (
              <div key={bar.label} className="flex h-full flex-1 flex-col items-center justify-end">
                <div className="mb-1.5 text-[10.5px]">{bar.value}</div>
                <div
                  className={`w-full rounded-t-sm ${bar.hot ? 'bg-red' : 'bg-amber'}`}
                  style={{ height: bar.height }}
                />
                <div className="mt-2 text-[10px] tracking-wide text-dim uppercase">{bar.label}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded border border-stroke bg-tile px-4 py-4">
          <div className="mb-4 text-[10.5px] tracking-widest text-dim uppercase">chamados por categoria</div>
          {[
            ['financeiro', '38%'],
            ['acesso', '24%'],
            ['bug', '18%'],
            ['suporte técnico', '12%'],
            ['sugestão', '8%'],
          ].map(([label, val]) => (
            <div key={label} className="mb-3 flex items-center gap-2.5">
              <span className="w-[110px] shrink-0 text-[11.5px]">{label}</span>
              <div className="h-2 flex-1 overflow-hidden rounded-[3px] bg-board">
                <div className="h-full rounded-[3px] bg-amber" style={{ width: val }} />
              </div>
              <span className="w-9 shrink-0 text-right text-[11px] text-dim">{val}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded border border-stroke bg-tile px-4 py-4">
          <div className="mb-4 text-[10.5px] tracking-widest text-dim uppercase">
            tempo médio de resolução por prioridade
          </div>
          {(
            [
              ['urgente', '12%', '2h10', true],
              ['alta', '32%', '5h40', true],
              ['média', '60%', '14h20', false],
              ['baixa', '100%', '38h', false],
            ] as const
          ).map(([label, width, val, hot]) => (
            <div key={label} className="mb-3 flex items-center gap-2.5">
              <span className="w-[110px] shrink-0 text-[11.5px]">{label}</span>
              <div className="h-2 flex-1 overflow-hidden rounded-[3px] bg-board">
                <div
                  className={`h-full rounded-[3px] ${hot ? 'bg-red' : label === 'baixa' ? 'bg-dim' : 'bg-amber'}`}
                  style={{ width }}
                />
              </div>
              <span className="w-9 shrink-0 text-right text-[11px] text-dim">{val}</span>
            </div>
          ))}
        </div>
        <div className="rounded border border-stroke bg-tile px-4 py-4">
          <div className="mb-4 text-[10.5px] tracking-widest text-dim uppercase">
            chamados resolvidos por agente — semana
          </div>
          {[
            ['camila reis', '100%', '58', 'bg-green'],
            ['bruno alves', '71%', '41', 'bg-green'],
            ['rafael souza', '38%', '22', 'bg-amber'],
            ['fernanda lima', '5%', '3', 'bg-dim'],
          ].map(([name, width, val, color]) => (
            <div key={name} className="mb-3 flex items-center gap-2.5">
              <span className="w-[90px] shrink-0 text-[11.5px]">{name}</span>
              <div className="h-2 flex-1 overflow-hidden rounded-[3px] bg-board">
                <div className={`h-full rounded-[3px] ${color}`} style={{ width }} />
              </div>
              <span className="w-[30px] shrink-0 text-right text-[11px] text-dim">{val}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
