import { useState } from 'react'
import { FlapCell } from '../../shared/ui/FlapCell'
import {
  ActionBar,
  ActionButton,
  DetailPanel,
  PassLabel,
  PassTitle,
  RelTicket,
} from '../../shared/ui/chrome'

const ARTICLES = [
  { id: 'senha', cat: 'acesso', title: 'Como resetar a senha da sua conta', views: '1.204 vis.', age: '3d', published: true, meta: 'acesso · publicado · bruno alves · atualizado há 3 dias', useful: '91%', saved: '64', body: 'Peça ao cliente para acessar "esqueci minha senha" na tela de login. O link de redefinição expira em 30 minutos.', tags: ['login', 'e-mail', 'segurança'], tickets: [['#4470 — não consigo acessar o painel', 'andamento']] as [string, string][] },
  { id: 'cobranca', cat: 'financeiro', title: 'Entendendo a cobrança recorrente', views: '856 vis.', age: '1sem', published: true, meta: 'financeiro · publicado · camila reis · atualizado há 1 semana', useful: '78%', saved: '31', body: 'A cobrança ocorre sempre no dia 5 de cada mês. Cobranças duplicadas geralmente vêm de troca de cartão no meio do ciclo.', tags: ['fatura', 'cartão', 'reembolso'], tickets: [['#4465 — cobrança duplicada — agosto', 'aguardando']] as [string, string][] },
  { id: 'relatorio', cat: 'relatorios', title: 'Erros comuns ao gerar relatório mensal', views: '340 vis.', age: '1d', published: true, meta: 'relatórios · publicado · camila reis · atualizado há 1 dia', useful: '86%', saved: '27', body: 'Relatórios com mais de 10 mil linhas podem ficar presos em "gerando…" por até 5 minutos.', tags: ['relatório mensal', 'exportação', 'fila'], tickets: [['#4471 — erro ao gerar relatório', 'aberto'], ['#4201 — faturamento', 'resolvido']] as [string, string][] },
  { id: 'csv', cat: 'relatorios', title: 'Exportando relatórios em CSV', views: '0 vis.', age: '2h', published: false, meta: 'relatórios · rascunho · helena duarte · atualizado há 2 horas', useful: '—', saved: '0', body: 'Rascunho: descrever o passo a passo para exportação em CSV.', tags: ['csv', 'exportação'], tickets: [['#4468 — exportar dados em csv', 'aberto']] as [string, string][] },
  { id: 'permissoes', cat: 'acesso', title: 'Configurando permissões de equipe', views: '512 vis.', age: '2sem', published: true, meta: 'acesso · publicado · bruno alves · atualizado há 2 semanas', useful: '88%', saved: '19', body: 'Apenas administradores podem alterar permissões de outros agentes.', tags: ['permissões', 'equipe', 'admin'], tickets: [] as [string, string][] },
  { id: 'safari', cat: 'bug', title: 'Integração com Safari — problemas conhecidos', views: '12 vis.', age: '5h', published: false, meta: 'bug · rascunho · camila reis · atualizado há 5 horas', useful: '—', saved: '2', body: 'O botão de salvar não responde em versões antigas do Safari (< 16).', tags: ['safari', 'bug', 'salvar'], tickets: [['#4460 — botão de salvar — safari', 'andamento']] as [string, string][] },
]

export function KnowledgeView() {
  const [cat, setCat] = useState('todos')
  const [openId, setOpenId] = useState<string | null>(null)
  const article = ARTICLES.find((item) => item.id === openId)
  const cards = ARTICLES.filter((item) => cat === 'todos' || item.cat === cat)

  if (article) {
    return (
      <div className="min-h-0 flex-1 overflow-y-auto px-7 py-6">
        <button type="button" onClick={() => setOpenId(null)} className="mb-4 text-[11px] tracking-wide text-dim uppercase hover:text-amber">
          ← voltar para a base
        </button>
        <p className="mb-1.5 text-[19px] font-bold tracking-wide text-amber">{article.title}</p>
        <div className="mb-5 text-[11.5px] text-dim">{article.meta}</div>
        <div className="mb-4 flex gap-5">
          <div>
            <PassLabel>visualizações</PassLabel>
            <div className="text-sm font-bold">{article.views.replace(' vis.', '')}</div>
          </div>
          <div>
            <PassLabel>útil</PassLabel>
            <div className="text-sm font-bold text-green">{article.useful}</div>
          </div>
          <div>
            <PassLabel>chamados evitados</PassLabel>
            <div className="text-sm font-bold text-amber">{article.saved}</div>
          </div>
        </div>
        <div className="mb-4 border-l-2 border-stroke pl-3 text-[12.5px] leading-relaxed">{article.body}</div>
        <div className="mb-4 flex flex-wrap gap-1.5">
          {article.tags.map((tag) => (
            <span key={tag} className="rounded-[3px] border border-stroke bg-tile px-2 py-1 text-[10px] text-dim uppercase">
              {tag}
            </span>
          ))}
        </div>
        {article.tickets.map(([label, status]) => (
          <RelTicket key={label} label={label} status={status} />
        ))}
        <ActionBar>
          <ActionButton primary>editar artigo</ActionButton>
          <ActionButton>enviar ao cliente</ActionButton>
        </ActionBar>
      </div>
    )
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-7 py-6">
      <div className="mb-4 flex items-center gap-3">
        <div className="max-w-xs flex-1 rounded-[3px] border border-stroke bg-board px-3 py-2 text-[11.5px] text-dim">
          buscar artigos…
        </div>
        <div className="flex gap-1.5">
          {['todos', 'acesso', 'financeiro', 'relatorios', 'bug'].map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setCat(item)}
              className={`rounded-full border px-3 py-1.5 text-[10.5px] tracking-wide uppercase ${
                cat === item ? 'border-amber text-amber' : 'border-stroke bg-tile text-dim'
              }`}
            >
              {item === 'relatorios' ? 'relatórios' : item}
            </button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-3">
        {cards.map((card) => (
          <button
            key={card.id}
            type="button"
            onClick={() => setOpenId(card.id)}
            className="rounded border border-stroke bg-tile px-4 py-3.5 text-left hover:border-dim"
          >
            <div className="mb-2.5 flex items-center justify-between">
              <span className="text-[9.5px] tracking-widest text-dim uppercase">{card.cat}</span>
              <span className={`h-1.5 w-1.5 rounded-full ${card.published ? 'bg-green' : 'bg-dim'}`} />
            </div>
            <div className="mb-3.5 text-[13px] font-bold leading-snug">{card.title}</div>
            <div className="flex justify-between text-[10.5px] text-dim">
              <span>{card.views}</span>
              <span>{card.age}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

const CANNED = [
  { id: 'ola', cat: 'saudacao', title: 'saudação inicial', shortcut: '/ola', uses: '342', meta: 'saudação · usado 342 vezes', preview: 'Olá {{nome_cliente}}! Meu nome é {{agente}} e vou te ajudar com isso.', vars: ['{{nome_cliente}} — preenchido com o nome cadastrado do cliente'] },
  { id: 'detalhes', cat: 'acesso', title: 'solicitar mais informações', shortcut: '/detalhes', uses: '128', meta: 'acesso · usado 128 vezes', preview: 'Para te ajudar melhor, você pode enviar um print da tela?', vars: ['nenhuma variável usada neste modelo'] },
  { id: 'reembolso', cat: 'financeiro', title: 'reembolso solicitado', shortcut: '/reembolso', uses: '89', meta: 'financeiro · usado 89 vezes', preview: 'Solicitei o reembolso. O valor deve cair em até {{prazo_reembolso}} dias úteis.', vars: ['{{prazo_reembolso}} — prazo padrão da política financeira'] },
  { id: 'senha', cat: 'acesso', title: 'como resetar a senha', shortcut: '/senha', uses: '214', meta: 'acesso · usado 214 vezes', preview: 'Você pode resetar sua senha em "esqueci minha senha". O link expira em {{tempo_expiracao}} minutos.', vars: ['{{tempo_expiracao}} — política de segurança'] },
  { id: 'encerrar', cat: 'encerramento', title: 'encerramento padrão', shortcut: '/encerrar', uses: '401', meta: 'encerramento · usado 401 vezes', preview: 'Ficamos felizes em ajudar, {{nome_cliente}}!', vars: ['{{nome_cliente}} — nome cadastrado'] },
  { id: 'escalar', cat: 'escalonamento', title: 'escalonamento para especialista', shortcut: '/escalar', uses: '47', meta: 'escalonamento · usado 47 vezes', preview: 'Vou transferir seu chamado para um especialista em {{categoria}}.', vars: ['{{categoria}} — categoria do chamado'] },
]

export function CannedView() {
  const [cat, setCat] = useState('todas')
  const [selectedId, setSelectedId] = useState('senha')
  const [wave, setWave] = useState(0)
  const rows = CANNED.filter((item) => cat === 'todas' || item.cat === cat)
  const selected = rows.find((item) => item.id === selectedId) ?? rows[0]

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex flex-wrap gap-1.5 px-6 pt-4">
        {['todas', 'saudacao', 'financeiro', 'acesso', 'encerramento', 'escalonamento'].map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => {
              setCat(item)
              setWave((value) => value + 1)
            }}
            className={`rounded-full border px-3 py-1.5 text-[10.5px] tracking-wide uppercase ${
              cat === item ? 'border-amber text-amber' : 'border-stroke bg-tile text-dim'
            }`}
          >
            {item === 'saudacao' ? 'saudação' : item}
          </button>
        ))}
      </div>
      <div className="flex min-h-0 flex-1">
        <div className="min-w-0 flex-1 overflow-y-auto px-6 py-4">
          <div className="mb-2 grid grid-cols-[1fr_90px_110px_90px] px-2.5 text-[10px] tracking-widest text-dim uppercase">
            <span>modelo</span>
            <span>atalho</span>
            <span>categoria</span>
            <span className="text-right">usos</span>
          </div>
          <div className="flex flex-col gap-1.5" key={`${cat}-${wave}`}>
            {rows.map((row, index) => {
              const selectedRow = row.id === selected?.id
              const delay = Math.min(index, 30) * 45
              return (
                <button
                  key={row.id}
                  type="button"
                  onClick={() => {
                    setSelectedId(row.id)
                    setWave((value) => value + 1)
                  }}
                  className="grid w-full grid-cols-[1fr_90px_110px_90px] gap-1.5 text-left [perspective:700px]"
                >
                  <FlapCell delayMs={delay} selected={selectedRow}>
                    {row.title}
                  </FlapCell>
                  <FlapCell delayMs={delay} selected={selectedRow} className="font-normal text-amber">
                    {row.shortcut}
                  </FlapCell>
                  <FlapCell delayMs={delay} selected={selectedRow} className="font-normal text-dim">
                    {row.cat}
                  </FlapCell>
                  <FlapCell delayMs={delay} selected={selectedRow} align="end" className="font-normal">
                    {row.uses}
                  </FlapCell>
                </button>
              )
            })}
          </div>
        </div>
        {selected ? (
          <DetailPanel>
            <PassLabel>{selected.meta}</PassLabel>
            <PassTitle>{selected.title}</PassTitle>
            <span className="mb-3.5 inline-block rounded-[3px] border border-amber px-2 py-0.5 text-[11px] text-amber">
              {selected.shortcut}
            </span>
            <div className="mb-4 rounded border border-stroke bg-board px-4 py-3.5 text-[12.5px] leading-relaxed">
              {selected.preview}
            </div>
            <div className="mb-2 text-[10.5px] tracking-widest text-dim uppercase">variáveis usadas</div>
            {selected.vars.map((item) => (
              <div key={item} className="flex gap-2 border-b border-stroke py-1.5 text-xs">
                <span className="text-amber">·</span>
                {item}
              </div>
            ))}
            <ActionBar>
              <ActionButton primary>usar na conversa</ActionButton>
              <ActionButton>editar</ActionButton>
              <ActionButton>duplicar</ActionButton>
            </ActionBar>
          </DetailPanel>
        ) : null}
      </div>
    </div>
  )
}
