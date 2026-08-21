import { useEffect, useRef, useState } from 'react'
import { PassLabel, PassSub } from '../../shared/ui/chrome'

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

const STARTERS = Object.keys(IA_ANSWERS)

type ChatMessage = {
  role: 'assistant' | 'user'
  html: string
}

const DOMAIN_SOURCES = [
  ['base de chamados', '1.284 registros'],
  ['clientes', '312 contas'],
  ['base de conhecimento', '6 artigos'],
  ['políticas de sla', '4 políticas'],
  ['documentação do domínio', 'manual interno'],
] as const

export function AiChatView() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      html: 'Olá! Posso responder perguntas sobre chamados, clientes, SLA e o funcionamento geral do sistema.',
    },
    { role: 'user', html: 'quantos chamados urgentes estão em aberto agora?' },
    {
      role: 'assistant',
      html: 'Há <b>6 chamados urgentes</b> em aberto agora. Três deles (#4471, #4448 e #4441) já estão vencidos ou muito próximos do prazo.',
    },
  ])
  const [draft, setDraft] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages.length])

  function send(text: string) {
    const trimmed = text.trim()
    if (!trimmed) return
    const key = trimmed.toLowerCase()
    const answer =
      IA_ANSWERS[key] ??
      'Deixa eu verificar isso na base de chamados… (resposta simulada neste protótipo.)'
    setMessages((current) => [
      ...current,
      { role: 'user', html: trimmed },
      { role: 'assistant', html: answer },
    ])
    setDraft('')
  }

  return (
    <div className="flex min-h-0 flex-1">
      {/* coluna principal — layout tipo ChatGPT */}
      <div className="relative flex min-w-0 flex-1 flex-col bg-bg">
        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="mx-auto flex w-full max-w-[48rem] flex-col gap-6 px-5 py-8">
            {messages.map((message, index) =>
              message.role === 'assistant' ? (
                <div
                  key={`${index}-${message.role}`}
                  className="ui-rise flex gap-3.5"
                >
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-stroke bg-tile text-[10px] font-bold tracking-wide text-amber">
                    IA
                  </div>
                  <div
                    className="min-w-0 flex-1 pt-1 text-[14px] leading-[1.65] text-ink [&_b]:font-bold"
                    dangerouslySetInnerHTML={{ __html: message.html }}
                  />
                </div>
              ) : (
                <div
                  key={`${index}-${message.role}`}
                  className="ui-rise flex justify-end"
                >
                  <div
                    className="max-w-[85%] rounded-[1.35rem] bg-amber px-4 py-2.5 text-[14px] leading-[1.55] text-amber-ink"
                    dangerouslySetInnerHTML={{ __html: message.html }}
                  />
                </div>
              ),
            )}
            <div ref={bottomRef} />
          </div>
        </div>

        <div className="shrink-0 border-t border-stroke/60 bg-bg/95 px-5 pt-3 pb-4 backdrop-blur-sm">
          <div className="mx-auto w-full max-w-[48rem]">
            <div className="mb-2.5 flex flex-wrap gap-1.5">
              {STARTERS.map((chip) => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => send(chip)}
                  className="rounded-full border border-stroke bg-tile px-3 py-1.5 text-[11px] text-dim transition-colors hover:border-amber/50 hover:text-ink"
                >
                  {chip}
                </button>
              ))}
            </div>
            <div className="flex items-end gap-2 rounded-[1.75rem] border border-stroke bg-tile px-3 py-2 shadow-[0_8px_30px_rgba(0,0,0,0.18)] focus-within:border-amber/50">
              <textarea
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && !event.shiftKey) {
                    event.preventDefault()
                    send(draft)
                  }
                }}
                rows={1}
                placeholder="Pergunte qualquer coisa sobre o Balcão…"
                className="max-h-32 min-h-[2.5rem] flex-1 resize-none bg-transparent px-2 py-2 text-[14px] leading-relaxed text-ink outline-none placeholder:text-dim"
              />
              <button
                type="button"
                onClick={() => send(draft)}
                disabled={!draft.trim()}
                className="mb-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber text-[13px] font-bold text-amber-ink transition enabled:hover:brightness-110 disabled:opacity-35"
                aria-label="enviar"
              >
                ↑
              </button>
            </div>
            <p className="mt-2 text-center text-[10.5px] text-dim">
              a ia pode errar — confira dados críticos nos chamados e na base
            </p>
          </div>
        </div>
      </div>

      {/* painel direito — fontes / domínio (mantido) */}
      <aside className="hidden w-[280px] shrink-0 overflow-y-auto border-l border-stroke bg-panel p-5 lg:block">
        <PassLabel>domínio conectado</PassLabel>
        <PassSub>fontes que a ia consulta para responder</PassSub>
        {DOMAIN_SOURCES.map(([name, count]) => (
          <div
            key={name}
            className="mb-2 flex justify-between rounded border border-stroke bg-tile px-3 py-2 text-[11.5px]"
          >
            <span>{name}</span>
            <span className="text-dim">{count}</span>
          </div>
        ))}
      </aside>
    </div>
  )
}
