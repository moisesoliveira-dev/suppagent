export function Topbar() {
  return (
    <header className="flex shrink-0 items-center gap-3.5 border-b border-stroke bg-panel px-6 py-4">
      <div className="max-w-[280px] flex-1 rounded-[3px] border border-stroke bg-board px-3 py-2 text-[11.5px] tracking-wide text-dim">
        buscar chamado, cliente…
      </div>
      <div className="flex items-baseline gap-1.5 rounded-[3px] border border-stroke bg-board px-3 py-1.5">
        <b className="text-sm text-red">6</b>
        <span className="text-[10.5px] tracking-wide text-dim uppercase">urgentes</span>
      </div>
      <div className="flex items-baseline gap-1.5 rounded-[3px] border border-stroke bg-board px-3 py-1.5">
        <b className="text-sm text-amber">23</b>
        <span className="text-[10.5px] tracking-wide text-dim uppercase">aberto</span>
      </div>
      <div className="flex items-baseline gap-1.5 rounded-[3px] border border-stroke bg-board px-3 py-1.5">
        <b className="text-sm text-amber">4,2h</b>
        <span className="text-[10.5px] tracking-wide text-dim uppercase">t. médio</span>
      </div>
      <button
        type="button"
        className="ml-auto rounded-[3px] bg-amber px-4 py-2 text-[11.5px] font-bold tracking-wide text-amber-ink uppercase"
      >
        abrir chamado
      </button>
    </header>
  )
}
