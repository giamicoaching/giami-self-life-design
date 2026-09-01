interface ScaleProps {
  id: string
  name: string
  label: string
  value: number | null
  onChange: (value: number) => void
  lowLabel?: string
  highLabel?: string
}

export function Scale({
  id,
  name,
  label,
  value,
  onChange,
  lowLabel = '낮음',
  highLabel = '높음',
}: ScaleProps) {
  return (
    <fieldset className="scale" id={id}>
      <legend className="scale-legend">{label}</legend>
      <div className="scale-ends">
        <span>{lowLabel} 1</span>
        <span>{highLabel} 7</span>
      </div>
      <div className="scale-options" role="radiogroup" aria-label={label}>
        {[1, 2, 3, 4, 5, 6, 7].map((score) => {
          const optionId = `${name}-${score}`
          return (
            <label key={score} className={value === score ? 'scale-option is-selected' : 'scale-option'}>
              <input
                id={optionId}
                type="radio"
                name={name}
                value={score}
                checked={value === score}
                onChange={() => onChange(score)}
              />
              <span>{score}</span>
            </label>
          )
        })}
      </div>
    </fieldset>
  )
}
