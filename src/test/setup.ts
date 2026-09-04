import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach, vi } from 'vitest'
import { resetUsageEventLocks } from '../analytics/usage.ts'

vi.mock('@vercel/analytics/react', () => ({
  Analytics: () => null,
}))

vi.mock('../supabase/client.ts', () => ({
  LIFE_DESIGN_EVENTS_TABLE: 'life_design_events',
  getSupabaseClient: vi.fn(() => null),
  resetSupabaseClientCache: vi.fn(),
}))

afterEach(() => {
  cleanup()
  resetUsageEventLocks()
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
