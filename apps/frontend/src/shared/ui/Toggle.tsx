type ToggleProps = {
  on: boolean
  onToggle: () => void
}

export function Toggle({ on, onToggle }: ToggleProps) {
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={(event) => {
        event.stopPropagation()
        onToggle()
      }}
      className={`relative h-[18px] w-8 shrink-0 rounded-full ${on ? 'bg-[#1e3a28]' : 'bg-stroke'}`}
    >
      <span
        className={`absolute top-0.5 left-0.5 h-3.5 w-3.5 rounded-full transition-transform duration-150 ${
          on ? 'translate-x-3.5 bg-green' : 'bg-dim'
        }`}
      />
    </button>
  )
}
