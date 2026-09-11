import type { MissingField } from '../../domain/validation.ts'

const FOCUSABLE =
  'input:not([disabled]):not([type="hidden"]), textarea:not([disabled]), select:not([disabled]), button:not([disabled])'

function isFocusableControl(element: HTMLElement): boolean {
  if (element.matches(FOCUSABLE)) return true
  return element.tabIndex >= 0
}

function firstFocusable(root: HTMLElement | null): HTMLElement | null {
  if (!root) return null
  if (isFocusableControl(root) && !(root instanceof HTMLButtonElement && root.disabled)) {
    return root
  }
  return root.querySelector<HTMLElement>(FOCUSABLE)
}

export function focusMissingField(field: MissingField): void {
  const question = document.getElementById(field.questionId)
  if (question instanceof HTMLElement) {
    question.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const requested = document.getElementById(field.focusId)
  const target =
    firstFocusable(requested instanceof HTMLElement ? requested : null) ??
    firstFocusable(question instanceof HTMLElement ? question : null) ??
    (requested instanceof HTMLElement ? requested : null) ??
    (question instanceof HTMLElement ? question : null)

  if (!(target instanceof HTMLElement)) return
  if (!isFocusableControl(target)) {
    target.tabIndex = -1
  }
  target.focus({ preventScroll: true })
}
