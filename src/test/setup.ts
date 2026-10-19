import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach, vi } from 'vitest'
import { resetUsageEventLocks } from '../analytics/usage.ts'
import { resetFeedbackSubmitLock } from '../analytics/submitFeedback.ts'

vi.mock('@vercel/analytics/react', () => ({
  Analytics: () => null,
}))

vi.mock('../supabase/client.ts', () => ({
  SELF_LIFE_DESIGN_USAGE_TABLE: 'self_life_design_usage',
  COMPLETE_SELF_LIFE_DESIGN_USAGE: 'complete_self_life_design_usage',
  SAVE_SELF_LIFE_DESIGN_USAGE: 'save_self_life_design_usage',
  SUBMIT_SELF_LIFE_DESIGN_FEEDBACK: 'submit_self_life_design_feedback',
  getSupabaseClient: vi.fn(() => null),
  resetSupabaseClientCache: vi.fn(),
}))

afterEach(() => {
  cleanup()
  resetUsageEventLocks()
  resetFeedbackSubmitLock()
})

if (typeof HTMLDialogElement !== 'undefined') {
  if (!HTMLDialogElement.prototype.showModal) {
    HTMLDialogElement.prototype.showModal = function showModal() {
      this.setAttribute('open', '')
    }
  }
  if (!HTMLDialogElement.prototype.close) {
    HTMLDialogElement.prototype.close = function close() {
      this.removeAttribute('open')
    }
  }
}
