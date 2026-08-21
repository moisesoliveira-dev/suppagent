import { useEffect, useState } from 'react'
import { FlapCell } from '../../shared/ui/FlapCell'
import {
  ActionBar,
  ActionButton,
  DetailPanel,
  PassLabel,
  PassSub,
  PassTitle,
  StubBar,
} from '../../shared/ui/chrome'
import { toast } from '../../shared/ui/toast'
import { notifyTicketsChanged } from '../tickets/tickets-ui'
import {
  applyRouting,
  getRoutingBoard,
  reviewRouting,
} from './routing-api'
import {
  barClass,
  confidenceClass,
  statusClass,
  statusLabel,
  type RoutingBoard,
  type RoutingBoardItem,
} from './routing'

export function AiRoutingView() {
  const [board, setBoard] = useState<RoutingBoard | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [wave, setWave] = useState(0)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function load(preferId?: string | null) {
    setLoading(true)
    setError(null)
    try {
      const data = await getRoutingBoard()
      setBoard(data)
      setSelectedId((current) => {
        const preferred = preferId ?? current
        if (preferred && data.items.some((item) => item.id === preferred)) {
          return preferred
        }
        return data.items[0]?.id ?? null
      })
    } catch (err) {
      setBoard(null)
      setSelectedId(null)
      setError(err instanceof Error ? err.message : 'falha ao carregar roteamento')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  const selected: RoutingBoardItem | null =
    board?.items.find((item) => item.id === selectedId) ??
    board?.items[0] ??
    null

  async function onApply() {
    if (!selected || busy) return
    setBusy(true)
    try {
      await applyRouting(selected.ticketId)
      notifyTicketsChanged()
      await load(selected.id)
      toast.success('roteamento aplicado')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'falha ao aplicar')
    } finally {
      setBusy(false)
    }
  }

  async function onReview() {
    if (!selected || busy) return
    setBusy(true)
    try {
      await reviewRouting(selected.ticketId)
      notifyTicketsChanged()
      await load(selected.id)
      toast.success('enviado para revisão')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'falha ao revisar')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex min-h-0 flex-1">
      <div className="min-w-0 flex-1 overflow-y-auto px-6 py-4">
        {error ? (
          <div className="mb-3 rounded-[3px] border border-red/40 bg-tile px-3 py-2 text-xs text-red">
            {error}
          </div>
        ) : null}

        <div className="mb-2 grid grid-cols-[70px_1fr_110px_130px_90px_110px] px-2.5 text-[10px] tracking-widest text-dim uppercase">
          <span>ticket</span>
          <span>assunto</span>
          <span>categoria (ia)</span>
          <span>destino sugerido</span>
          <span>confiança</span>
          <span>status</span>
        </div>

        {loading && !board ? (
          <div className="text-xs text-dim">carregando…</div>
        ) : null}

        {!loading && board && board.items.length === 0 ? (
          <div className="text-xs text-dim">nenhum chamado aberto para roteamento</div>
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
                className="grid w-full grid-cols-[70px_1fr_110px_130px_90px_110px] gap-1.5 text-left [perspective:700px]"
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
                <FlapCell
                  delayMs={delay}
                  selected={selectedRow}
                  className="font-normal text-dim"
                >
                  {row.suggestion.category}
                </FlapCell>
                <FlapCell
                  delayMs={delay}
                  selected={selectedRow}
                  className="font-normal"
                >
                  {row.suggestion.agentLabel}
                </FlapCell>
                <FlapCell
                  delayMs={delay}
                  selected={selectedRow}
                  className={confidenceClass(row.suggestion.tone)}
                >
                  {row.suggestion.confidenceLabel}
                </FlapCell>
                <FlapCell
                  delayMs={delay}
                  selected={selectedRow}
                  className={statusClass(row.suggestion.status)}
                >
                  {statusLabel(row.suggestion.status)}
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
            <PassTitle>{selected.title}</PassTitle>
            <PassSub>{selected.sub}</PassSub>
            <StubBar />
            <div className="mb-4">
              <div className="mb-1 flex justify-between text-[10px] text-dim">
                <span>confiança da classificação</span>
                <span>{selected.suggestion.confidenceLabel}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-[3px] bg-board">
                <div
                  className={`h-full ${barClass(selected.suggestion.tone)}`}
                  style={{ width: selected.suggestion.confidenceLabel }}
                />
              </div>
            </div>
            {selected.suggestion.signals.map((signal) => (
              <div
                key={signal}
                className="flex gap-2 border-b border-stroke py-1.5 text-xs"
              >
                <span className="text-amber">·</span>
                {signal}
              </div>
            ))}
            <ActionBar>
              <ActionButton primary onClick={() => void onApply()}>
                aplicar roteamento
              </ActionButton>
              <ActionButton onClick={() => void onReview()}>revisar</ActionButton>
            </ActionBar>
          </>
        ) : (
          <div className="text-xs text-dim">selecione um chamado</div>
        )}
      </DetailPanel>
    </div>
  )
}
