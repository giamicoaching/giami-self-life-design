interface ChipProps {
  selected: boolean
  disabled?: boolean
  onToggle: () => void
  children: string
  title?: string
}

export function Chip({ selected, disabled, onToggle, children, title }: ChipProps) {
  return (
    <button
      type="button"
      className={selected ? 'chip is-selected' : 'chip'}
      aria-pressed={selected}
      disabled={disabled && !selected}
      title={title}
      onClick={onToggle}
    >
      {children}
    </button>
  )
}
