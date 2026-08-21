import type { CSSProperties, ReactNode } from 'react'

type FlapCellProps = {
  children: ReactNode
  delayMs?: number
  className?: string
  selected?: boolean
  align?: 'start' | 'end'
  /** quando false, a célula não roda o split-flap */
  animate?: boolean
}

export function FlapCell({
  children,
  delayMs = 0,
  className = '',
  selected = false,
  align = 'start',
  animate = true,
}: FlapCellProps) {
  const style: CSSProperties | undefined = animate
    ? { animationDelay: `${delayMs}ms` }
    : undefined

  return (
    <div
      className={`${animate ? 'flap-in' : ''} relative flex min-w-0 items-center overflow-hidden rounded-[3px] border bg-tile px-2.5 py-2 text-xs font-bold tracking-wide uppercase transition-[border-color,background-color] duration-200 ${
        selected ? 'border-amber' : 'border-stroke'
      } ${align === 'end' ? 'justify-end' : ''} ${className}`}
      style={style}
    >
      <span className="relative z-10 min-w-0 truncate">{children}</span>
      <span className="pointer-events-none absolute inset-x-0 top-1/2 z-0 h-px bg-seam opacity-70" />
    </div>
  )
}
