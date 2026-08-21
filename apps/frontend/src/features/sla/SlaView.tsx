import { useEffect, useState } from 'react'
import { FlapCell } from '../../shared/ui/FlapCell'
import {
  DetailPanel,
  PassLabel,
  PassSub,
  PassTitle,
  PriorityColor,
  StubBar,
} from '../../shared/ui/chrome'
import { toast } from '../../shared/ui/toast'
import { getSlaBoard } from './sla-api'
import {
  complianceBarClass,
  countdownClass,
  priorityTitleClass,
  type SlaBoard,
  type SlaBoardItem,
} from './sla'

export function SlaView() {
  const [board, setBoard] = useState<SlaBoard | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [wave, setWave] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const data = await getSlaBoard()
      setBoard(data)
      setSelectedId((current) => {
        if (current && data.items.some((item) => item.id === current)) {
          return current
        }
        return data.items[0]?.id ?? null
      })
    } catch (err) {
      setBoard(null)
      setSelectedId(null)
      setError(err instanceof Error ? err.message : 'falha ao carregar sla')
      toast.error(err instanceof Error ? err.message : 'falha ao carregar sla')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  const selected: SlaBoardItem | null =
    board?.items.find((item) => item.id === selectedId) ??
    board?.items[0] ??
    null

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {error ? (
        <div className="mx-6 mt-4 rounded-[3px] border border-red/40 bg-tile px-3 py-2 text-xs text-red">
          {error}
        </div>
      ) : null}

      <div className="grid grid-cols-4 gap-2.5 px-6 pt-4">
        {(board?.policies ?? []).map((policy) => (
          <div
            key={policy.id}
            className="rounded border border-stroke bg-tile px-3.5 py-3"
          >
            <div
              className={`mb-2 text-[11px] font-bold tracking-wide uppercase ${priorityTitleClass(policy.priority)}`}
            >
              {policy.priority}
            </div>
            <div className="mb-2.5 text-[10.5px] leading-relaxed text-dim">
              {policy.targetsLabel}
            </div>
            <div className="mb-1 flex justify-between text-[10px] text-dim">
              <span>cumprimento</span>
              <b className="text-ink">{policy.compliancePercent}%</b>
            </div>
            <div className="h-[5px] overflow-hidden rounded-[3px] bg-board">
              <div
                className={`h-full ${complianceBarClass(policy.compliancePercent)}`}
                style={{ width: `${policy.compliancePercent}%` }}
              />
            </div>
            <div className="mt-1.5 text-[10px] text-dim">
              {policy.openCount} aberto{policy.openCount === 1 ? '' : 's'}
            </div>
          </div>
        ))}
        {loading && !board ? (
          <div className="col-span-4 text-xs text-dim">carregando políticas…</div>
        ) : null}
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

          {loading && !board ? (
            <div className="text-xs text-dim">carregando chamados…</div>
          ) : null}

          {!loading && board && board.items.length === 0 ? (
            <div className="text-xs text-dim">
              nenhum chamado aberto para acompanhar sla
            </div>
          ) : null}

          <div className="flex flex-col gap-1.5" key={wave}>
            {(board?.items ?? []).map((row, index) => {
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
                  <FlapCell
                    delayMs={delay}
                    selected={selectedRow}
                    className="font-normal normal-case"
                  >
                    {row.subject}
                  </FlapCell>
                  <FlapCell delayMs={delay} selected={selectedRow}>
                    <PriorityColor priority={row.priority} />
                  </FlapCell>
                  <FlapCell
                    delayMs={delay}
                    selected={selectedRow}
                    className={countdownClass(row.response.tone)}
                  >
                    {row.response.shortLabel}
                  </FlapCell>
                  <FlapCell
                    delayMs={delay}
                    selected={selectedRow}
                    className={countdownClass(row.resolution.tone)}
                  >
                    {row.resolution.shortLabel}
                  </FlapCell>
                </button>
              )
            })}
          </div>
        </div>

        <DetailPanel>
          {selected ? (
            <>
              <PassLabel>{selected.meta}</PassLabel>
              <PassTitle>{selected.subject}</PassTitle>
              <PassSub>{selected.sub}</PassSub>
              <StubBar />
              <div className="mb-2.5 rounded border border-stroke bg-board px-3.5 py-3">
                <div className="mb-1.5 text-[10px] tracking-widest text-dim uppercase">
                  1ª resposta
                </div>
                <div
                  className={`mb-1 text-[15px] font-bold ${countdownClass(selected.response.tone)}`}
                >
                  {selected.response.detailText}
                </div>
                <div className="text-[11px] text-dim">
                  {selected.response.detailSub}
                </div>
              </div>
              <div className="mb-2.5 rounded border border-stroke bg-board px-3.5 py-3">
                <div className="mb-1.5 text-[10px] tracking-widest text-dim uppercase">
                  resolução
                </div>
                <div
                  className={`mb-1 text-[15px] font-bold ${countdownClass(selected.resolution.tone)}`}
                >
                  {selected.resolution.detailText}
                </div>
                <div className="text-[11px] text-dim">
                  {selected.resolution.detailSub}
                </div>
              </div>
              <div className="mb-2 text-[10.5px] tracking-widest text-dim uppercase">
                linha do tempo do sla
              </div>
              {selected.timeline.map((line) => (
                <div
                  key={`${line.time}-${line.text}`}
                  className="mb-1.5 text-[11.5px] leading-relaxed text-dim"
                >
                  <span className="mr-1.5 text-ink">{line.time}</span>
                  {line.text}
                </div>
              ))}
            </>
          ) : (
            <div className="text-xs text-dim">selecione um chamado</div>
          )}
        </DetailPanel>
      </div>
    </div>
  )
}
