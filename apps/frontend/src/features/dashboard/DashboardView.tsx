import { useEffect, useState } from 'react'
import { barTone, formatGeneratedAt, type ReportsSummary } from '../reports/reports'
import { getReportsSummary } from '../reports/reports-api'
import { onTicketsChanged } from '../tickets/tickets-ui'

export function DashboardView() {
  const [data, setData] = useState<ReportsSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  async function load() {
    setLoading(true)
    setError(null)
    try {
      setData(await getReportsSummary())
    } catch (err) {
      setData(null)
      setError(err instanceof Error ? err.message : 'falha ao carregar painel')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
    return onTicketsChanged(() => {
      void load()
    })
  }, [])

  const maxAgent = Math.max(1, ...(data?.byAgent.map((row) => row.total) ?? [1]))
  const maxStatus = Math.max(1, ...(data?.byStatus.map((row) => row.count) ?? [1]))

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-7 py-5">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[15px] font-bold">painel</p>
          <p className="text-[11.5px] text-dim">
            visão ao vivo dos chamados
            {data ? ` · atualizado ${formatGeneratedAt(data.generatedAt)}` : null}
          </p>
        </div>
        <button
          type="button"
          disabled={loading}
          onClick={() => void load()}
          className="rounded-[3px] border border-stroke px-3 py-1.5 text-[11px] tracking-wide text-dim uppercase hover:border-amber hover:text-amber disabled:opacity-50"
        >
          atualizar
        </button>
      </div>

      {error ? (
        <div className="mb-4 rounded-[3px] border border-red/40 bg-tile px-3 py-2 text-xs text-red">
          {error}
        </div>
      ) : null}

      {loading && !data ? (
        <div className="text-xs text-dim">carregando painel…</div>
      ) : null}

      {data ? (
        <>
          <div className="ui-stagger ui-stagger-rise mb-6 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
            {[
              { label: 'chamados abertos', value: data.totals.open },
              { label: 'resolvidos', value: data.totals.resolved },
              { label: 'livres', value: data.totals.unassigned },
              { label: 'urgentes abertos', value: data.totals.urgentOpen },
            ].map((kpi) => (
              <div key={kpi.label} className="rounded border border-stroke bg-tile px-4 py-3.5">
                <div className="mb-2 text-[10px] tracking-widest text-dim uppercase">
                  {kpi.label}
                </div>
                <div className="text-2xl font-bold">{kpi.value}</div>
                <div className="mt-1 text-[10.5px] text-dim">
                  de {data.totals.tickets} no total
                </div>
              </div>
            ))}
          </div>

          <div className="mb-3 grid grid-cols-1 gap-3 md:grid-cols-2">
            <div className="rounded border border-stroke bg-tile px-4 py-4">
              <div className="mb-4 text-[10.5px] tracking-widest text-dim uppercase">
                volume por status
              </div>
              {data.byStatus.length === 0 ? (
                <div className="text-xs text-dim">sem chamados</div>
              ) : (
                <div className="flex h-[130px] items-end gap-2.5">
                  {data.byStatus.map((row) => {
                    const height = `${Math.max(8, Math.round((row.count / maxStatus) * 100))}%`
                    return (
                      <div
                        key={row.id}
                        className="flex h-full min-w-0 flex-1 flex-col items-center justify-end"
                      >
                        <div className="mb-1.5 text-[10.5px]">{row.count}</div>
                        <div
                          className={`ui-bar w-full rounded-t-sm ${
                            row.id === 'resolvido' ? 'bg-green' : 'bg-amber'
                          }`}
                          style={{ height }}
                        />
                        <div className="mt-2 truncate text-[10px] tracking-wide text-dim uppercase">
                          {row.label}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            <div className="rounded border border-stroke bg-tile px-4 py-4">
              <div className="mb-4 text-[10.5px] tracking-widest text-dim uppercase">
                chamados por categoria
              </div>
              {data.byCategory.length === 0 ? (
                <div className="text-xs text-dim">sem categorias</div>
              ) : (
                data.byCategory.map((row) => (
                  <div key={row.id} className="mb-3 flex items-center gap-2.5">
                    <span className="w-[110px] shrink-0 truncate text-[11.5px]">
                      {row.label}
                    </span>
                    <div className="h-2 flex-1 overflow-hidden rounded-[3px] bg-board">
                      <div
                        className={`ui-bar h-full rounded-[3px] ${barTone(row.share)}`}
                        style={{ width: `${row.share}%` }}
                      />
                    </div>
                    <span className="w-14 shrink-0 text-right text-[11px] text-dim">
                      {row.count} · {row.share}%
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div className="rounded border border-stroke bg-tile px-4 py-4">
              <div className="mb-4 text-[10.5px] tracking-widest text-dim uppercase">
                por prioridade
              </div>
              {data.byPriority.map((row) => (
                <div key={row.id} className="mb-3 flex items-center gap-2.5">
                  <span className="w-[110px] shrink-0 text-[11.5px]">{row.label}</span>
                  <div className="h-2 flex-1 overflow-hidden rounded-[3px] bg-board">
                    <div
                      className={`ui-bar h-full rounded-[3px] ${
                        row.id === 'urgente' || row.id === 'alta' ? 'bg-red' : 'bg-amber'
                      }`}
                      style={{ width: `${Math.max(row.share, 2)}%` }}
                    />
                  </div>
                  <span className="w-14 shrink-0 text-right text-[11px] text-dim">
                    {row.count}
                  </span>
                </div>
              ))}
            </div>

            <div className="rounded border border-stroke bg-tile px-4 py-4">
              <div className="mb-4 text-[10.5px] tracking-widest text-dim uppercase">
                carga por agente
              </div>
              {data.byAgent.length === 0 ? (
                <div className="text-xs text-dim">nenhum agente com chamados</div>
              ) : (
                data.byAgent.map((row) => {
                  const width = `${Math.max(4, Math.round((row.total / maxAgent) * 100))}%`
                  const color =
                    row.openShare >= 70
                      ? 'bg-red'
                      : row.openShare >= 40
                        ? 'bg-amber'
                        : 'bg-green'
                  return (
                    <div key={row.agentId} className="mb-3 flex items-center gap-2.5">
                      <span className="w-[90px] shrink-0 truncate text-[11.5px]">
                        {row.agentName}
                      </span>
                      <div className="h-2 flex-1 overflow-hidden rounded-[3px] bg-board">
                        <div className={`ui-bar h-full rounded-[3px] ${color}`} style={{ width }} />
                      </div>
                      <span className="w-[52px] shrink-0 text-right text-[11px] text-dim">
                        {row.open}/{row.total}
                      </span>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </>
      ) : null}
    </div>
  )
}
