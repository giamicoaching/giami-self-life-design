interface ScaleProps {
  id: string
  name: string
  label: string
  value: number | null
  onChange: (value: number) => void
  lowLabel?: string
  highLabel?: string
  error?: string
}

export function Scale({
  id,
  name,
  label,
  value,
  onChange,
  lowLabel = '낮음',
  highLabel = '높음',
  error,
}: ScaleProps) {
  const describedBy = error ? `${id}-error` : undefined
  return (
    <fieldset
      className={error ? 'scale question-block is-error' : 'scale question-block'}
      id={id}
      aria-invalid={error ? true : undefined}
    >
      <legend className="scale-legend">{label}</legend>
      <div className="scale-ends">
        <span>{lowLabel} 1</span>
        <span>{highLabel} 7</span>
      </div>
      <div
        className="scale-options"
        role="radiogroup"
        aria-label={label}
        aria-describedby={describedBy}
      >
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
      {error ? (
        <p className="field-error" id={`${id}-error`} role="alert" aria-live="assertive">
          {error}
        </p>
      ) : null}
    </fieldset>
  )
}
