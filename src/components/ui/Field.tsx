import type { ReactNode, TextareaHTMLAttributes, InputHTMLAttributes } from 'react'

interface FieldProps {
  id: string
  label: string
  hint?: string
  error?: string
  optional?: boolean
  children: ReactNode
}

export function Field({ id, label, hint, error, optional, children }: FieldProps) {
  return (
    <div className="field">
      <label className="field-label" htmlFor={id}>
        {label}
        {optional ? <span className="field-optional">선택</span> : null}
      </label>
      {hint ? (
        <p className="field-hint" id={`${id}-hint`}>
          {hint}
        </p>
      ) : null}
      {children}
      {error ? (
        <p className="field-error" id={`${id}-error`} role="alert" aria-live="assertive">
          {error}
        </p>
      ) : null}
    </div>
  )
}

type TextAreaProps = {
  id: string
  label: string
  hint?: string
  error?: string
  optional?: boolean
} & TextareaHTMLAttributes<HTMLTextAreaElement>

export function TextArea({ id, label, hint, error, optional, ...props }: TextAreaProps) {
  const describedBy = [hint ? `${id}-hint` : null, error ? `${id}-error` : null]
    .filter(Boolean)
    .join(' ')
  return (
    <Field id={id} label={label} hint={hint} error={error} optional={optional}>
      <textarea
        id={id}
        className="input"
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy || undefined}
        {...props}
      />
    </Field>
  )
}

type TextFieldProps = {
  id: string
  label: string
  hint?: string
  error?: string
  optional?: boolean
} & InputHTMLAttributes<HTMLInputElement>

export function TextField({ id, label, hint, error, optional, ...props }: TextFieldProps) {
  const describedBy = [hint ? `${id}-hint` : null, error ? `${id}-error` : null]
    .filter(Boolean)
    .join(' ')
  return (
    <Field id={id} label={label} hint={hint} error={error} optional={optional}>
      <input
        id={id}
        className="input"
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy || undefined}
        {...props}
      />
    </Field>
  )
}
