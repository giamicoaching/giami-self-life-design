import type { ReactNode } from 'react'

function questionClassName(error?: string, extra = ''): string {
  return ['question-block', error ? 'is-error' : '', extra].filter(Boolean).join(' ')
}

export function FieldErrorText({ id, error }: { id: string; error?: string }) {
  if (!error) return null
  return (
    <p className="field-error" id={`${id}-error`} role="alert" aria-live="assertive">
      {error}
    </p>
  )
}

export function QuestionBlock({
  id,
  error,
  className = '',
  as = 'div',
  tabIndex,
  children,
}: {
  id: string
  error?: string
  className?: string
  as?: 'div' | 'fieldset'
  tabIndex?: number
  children: ReactNode
}) {
  const Component = as
  return (
    <Component
      id={id}
      className={questionClassName(error, className)}
      aria-invalid={error ? true : undefined}
      tabIndex={tabIndex}
    >
      {children}
      <FieldErrorText id={id} error={error} />
    </Component>
  )
}
