import type { ButtonHTMLAttributes, ReactNode } from 'react'

type IconButtonTone = 'default' | 'danger' | 'accent'

const TONE_CLASS: Record<IconButtonTone, string> = {
  default:
    'border-stroke text-dim hover:border-amber hover:text-amber',
  accent: 'border-stroke text-amber hover:border-amber hover:bg-tile',
  danger: 'border-stroke text-dim hover:border-red hover:text-red',
}

export function IconButton({
  label,
  tone = 'default',
  children,
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  label: string
  tone?: IconButtonTone
  children: ReactNode
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-[3px] border transition-colors disabled:opacity-50 ${TONE_CLASS[tone]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
