import type { ReactNode, TextareaHTMLAttributes, InputHTMLAttributes } from 'react'
import { OPTIONAL_FIELD_MARK } from '../../copy/programCopy.ts'

interface FieldProps {
  id: string
  label: string
  hint?: string
  error?: string
  optional?: boolean
  questionId?: string
  children: ReactNode
}

export function Field({
  id,
  label,
  hint,
  error,
  optional,
  questionId,
  children,
}: FieldProps) {
  const wrapperId = questionId ?? `question-${id}`
  return (
    <div
      id={wrapperId}
      className={error ? 'field question-block is-error' : 'field question-block'}
    >
      <label className="field-label" htmlFor={id}>
        {label}
        {optional ? <span className="field-optional">{OPTIONAL_FIELD_MARK}</span> : null}
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
  questionId?: string
} & TextareaHTMLAttributes<HTMLTextAreaElement>

export function TextArea({
  id,
  label,
  hint,
  error,
  optional,
  questionId,
  ...props
}: TextAreaProps) {
  const describedBy = [hint ? `${id}-hint` : null, error ? `${id}-error` : null]
    .filter(Boolean)
    .join(' ')
  return (
    <Field
      id={id}
      label={label}
      hint={hint}
      error={error}
      optional={optional}
      questionId={questionId}
    >
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
  questionId?: string
} & InputHTMLAttributes<HTMLInputElement>

export function TextField({
  id,
  label,
  hint,
  error,
  optional,
  questionId,
  ...props
}: TextFieldProps) {
  const describedBy = [hint ? `${id}-hint` : null, error ? `${id}-error` : null]
    .filter(Boolean)
    .join(' ')
  return (
    <Field
      id={id}
      label={label}
      hint={hint}
      error={error}
      optional={optional}
      questionId={questionId}
    >
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
