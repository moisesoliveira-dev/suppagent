import type { ReactNode } from 'react'

export function DetailPanel({ children }: { children: ReactNode }) {
  return (
    <aside className="ui-panel h-full w-[340px] shrink-0 overflow-y-auto border-l border-stroke bg-panel p-5">
      {children}
    </aside>
  )
}

export function PassLabel({ children }: { children: ReactNode }) {
  return (
    <div className="mb-1 text-[10px] tracking-widest text-dim uppercase">
      {children}
    </div>
  )
}

export function PassTitle({ children }: { children: ReactNode }) {
  return (
    <p className="mt-0.5 mb-1.5 text-base font-bold tracking-wide text-amber uppercase">
      {children}
    </p>
  )
}

export function PassSub({ children }: { children: ReactNode }) {
  return <p className="mb-4 text-[11.5px] tracking-wide text-dim">{children}</p>
}

export function StubBar() {
  return (
    <div
      className="mb-4 h-[5px]"
      style={{
        background:
          'repeating-linear-gradient(90deg, var(--color-dim) 0 4px, transparent 4px 8px)',
      }}
    />
  )
}

export function RelTicket({
  label,
  status,
}: {
  label: string
  status: string
}) {
  const color =
    status === 'aberto'
      ? 'text-amber'
      : status === 'resolvido'
        ? 'text-green'
        : status === 'andamento'
          ? 'text-blue'
          : 'text-dim'

  return (
    <div className="flex justify-between border-b border-stroke py-2 text-xs transition-colors hover:bg-tile/60">
      <span className="text-dim">{label}</span>
      <span className={`text-[10.5px] font-bold tracking-wide uppercase ${color}`}>
        {status}
      </span>
    </div>
  )
}

export function ActionBar({ children }: { children: ReactNode }) {
  return <div className="mt-3 flex items-center gap-2">{children}</div>
}

export function ActionButton({
  children,
  primary = false,
  onClick,
}: {
  children: ReactNode
  primary?: boolean
  onClick?: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 rounded-[3px] border py-2 text-center text-[10.5px] tracking-widest uppercase active:scale-[0.98] ${
        primary
          ? 'border-amber bg-amber font-bold text-amber-ink hover:brightness-110'
          : 'border-stroke bg-tile text-ink hover:border-amber hover:text-amber'
      }`}
    >
      {children}
    </button>
  )
}

export function StatusColor({
  status,
}: {
  status: 'aberto' | 'andamento' | 'aguardando' | 'resolvido' | string
}) {
  const color =
    status === 'aberto'
      ? 'text-amber'
      : status === 'andamento'
        ? 'text-blue'
        : status === 'resolvido'
          ? 'text-green'
          : 'text-dim'
  return <span className={color}>{status}</span>
}

export function PriorityColor({
  priority,
}: {
  priority: 'urgente' | 'alta' | 'media' | 'baixa' | string
}) {
  const color =
    priority === 'urgente' || priority === 'alta'
      ? 'text-red'
      : priority === 'media' || priority === 'média'
        ? 'text-amber'
        : 'text-dim'
  return <span className={color}>{priority}</span>
}
