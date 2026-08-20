import { useEffect, useState } from 'react'
import { PassLabel } from '../../shared/ui/chrome'
import { toast } from '../../shared/ui/toast'
import { getReportsSummary } from './reports-api'
import {
  REPORT_MODELS,
  barTone,
  formatGeneratedAt,
  type ReportBucket,
  type ReportKind,
  type ReportsSummary,
} from './reports'

function ShareRows({
  rows,
  empty,
}: {
  rows: ReportBucket[]
  empty: string
}) {
  if (rows.length === 0) {
    return <div className="text-xs text-dim">{empty}</div>
  }
  return (
    <>
      {rows.map((row) => (
        <div key={row.id} className="mb-3 flex items-center gap-2.5">
          <span className="w-[120px] shrink-0 truncate text-[11.5px]">{row.label}</span>
          <div className="h-2 flex-1 overflow-hidden rounded-[3px] bg-board">
            <div
              className={`h-full rounded-[3px] ${barTone(row.share)}`}
              style={{ width: `${row.share}%` }}
            />
          </div>
          <span className="w-14 shrink-0 text-right text-[11px] text-dim">
            {row.count} · {row.share}%
          </span>
        </div>
      ))}
    </>
  )
}

export function ReportsView() {
  const [data, setData] = useState<ReportsSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [active, setActive] = useState<ReportKind>('volume')
  const [busy, setBusy] = useState(false)

  async function load(kind?: ReportKind) {
    setLoading(true)
    setError(null)
    try {
      const summary = await getReportsSummary()
      setData(summary)
      if (kind) setActive(kind)
    } catch (err) {
      setData(null)
      setError(err instanceof Error ? err.message : 'falha ao carregar relatórios')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  async function onGenerate(kind: ReportKind) {
    if (busy) return
    setBusy(true)
    try {
      await load(kind)
      toast.success('relatório atualizado')
    } finally {
      setBusy(false)
    }
  }

  const generatedLabel = data
    ? formatGeneratedAt(data.generatedAt)
    : loading
      ? 'carregando…'
      : '—'

  return (
    <div className="min-h-0 flex-1 overflow-y-auto px-7 py-5">
      <div className="mb-1 text-[15px] font-bold">relatórios</div>
      <p className="mb-5 text-[11.5px] text-dim">
        resumo ao vivo com base nos chamados e na base de conhecimento.
        agendamento de envio ainda não está disponível.
      </p>

      {error ? (
        <div className="mb-4 rounded-[3px] border border-red/40 bg-tile px-3 py-2 text-xs text-red">
          {error}
        </div>
      ) : null}

      <div className="mb-3 text-[10.5px] tracking-widest text-dim uppercase">
        modelos de relatório
      </div>
      <div className="mb-7 grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-3">
        {REPORT_MODELS.map((model) => (
          <div
            key={model.id}
            className={`rounded border bg-tile px-4 py-4 ${
              active === model.id ? 'border-amber' : 'border-stroke'
            }`}
          >
            <div className="mb-1.5 text-[13px] font-bold">{model.title}</div>
            <div className="mb-3.5 text-[11.5px] leading-relaxed text-dim">
              {model.description}
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] text-dim">último: {generatedLabel}</span>
              <button
                type="button"
                disabled={busy || loading}
                onClick={() => void onGenerate(model.id)}
                className="rounded-[3px] border border-amber px-3 py-1.5 text-[10.5px] tracking-wide text-amber uppercase hover:bg-amber hover:text-amber-ink disabled:opacity-50"
              >
                gerar
              </button>
            </div>
          </div>
        ))}
      </div>

      {loading && !data ? (
        <div className="text-xs text-dim">carregando resumo…</div>
      ) : null}

      {data ? (
        <>
          <div className="mb-6 grid grid-cols-2 gap-2.5 sm:grid-cols-5">
            {[
              ['chamados', data.totals.tickets],
              ['abertos', data.totals.open],
              ['resolvidos', data.totals.resolved],
              ['livres', data.totals.unassigned],
              ['urgentes abertos', data.totals.urgentOpen],
            ].map(([label, value]) => (
              <div key={label} className="rounded border border-stroke bg-tile px-4 py-3.5">
                <PassLabel>{label}</PassLabel>
                <div className="text-2xl font-bold">{value}</div>
              </div>
            ))}
          </div>

          {active === 'volume' ? (
            <div className="mb-3 grid grid-cols-1 gap-3 md:grid-cols-2">
              <section className="rounded border border-stroke bg-tile px-4 py-4">
                <div className="mb-4 text-[10.5px] tracking-widest text-dim uppercase">
                  por status
                </div>
                <ShareRows rows={data.byStatus} empty="sem chamados" />
              </section>
              <section className="rounded border border-stroke bg-tile px-4 py-4">
                <div className="mb-4 text-[10.5px] tracking-widest text-dim uppercase">
                  por categoria
                </div>
                <ShareRows rows={data.byCategory} empty="sem categorias" />
              </section>
            </div>
          ) : null}

          {active === 'equipe' ? (
            <section className="mb-3 rounded border border-stroke bg-tile px-4 py-4">
              <div className="mb-4 text-[10.5px] tracking-widest text-dim uppercase">
                por agente
              </div>
              {data.byAgent.length === 0 ? (
                <div className="text-xs text-dim">nenhum chamado atribuído</div>
              ) : (
                data.byAgent.map((row) => (
                  <div key={row.agentId} className="mb-3">
                    <div className="mb-1 flex justify-between text-[11.5px]">
                      <span className="font-bold">{row.agentName}</span>
                      <span className="text-dim">
                        {row.open} abertos · {row.resolved} resolvidos · {row.total} total
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-[3px] bg-board">
                      <div
                        className={`h-full rounded-[3px] ${barTone(row.openShare)}`}
                        style={{ width: `${Math.max(row.openShare, 4)}%` }}
                      />
                    </div>
                  </div>
                ))
              )}
            </section>
          ) : null}

          {active === 'prioridade' ? (
            <section className="mb-3 rounded border border-stroke bg-tile px-4 py-4">
              <div className="mb-4 text-[10.5px] tracking-widest text-dim uppercase">
                por prioridade
              </div>
              <ShareRows rows={data.byPriority} empty="sem chamados" />
            </section>
          ) : null}

          {active === 'conhecimento' ? (
            <section className="mb-3 grid grid-cols-2 gap-2.5 md:grid-cols-4">
              {[
                ['artigos', data.knowledge.articles],
                ['publicados', data.knowledge.published],
                ['visualizações', data.knowledge.views],
                ['chamados evitados', data.knowledge.ticketsAvoided],
              ].map(([label, value]) => (
                <div key={label} className="rounded border border-stroke bg-tile px-4 py-3.5">
                  <PassLabel>{label}</PassLabel>
                  <div className="text-2xl font-bold">{value}</div>
                </div>
              ))}
            </section>
          ) : null}
        </>
      ) : null}
    </div>
  )
}
