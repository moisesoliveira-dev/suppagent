import { useState } from 'react'
import { FlapCell } from '../../shared/ui/FlapCell'
import {
  ActionBar,
  ActionButton,
  DetailPanel,
  PassLabel,
  PassTitle,
} from '../../shared/ui/chrome'

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
