import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach, vi } from 'vitest'
import { resetUsageEventLocks } from '../analytics/usage.ts'

vi.mock('@vercel/analytics', () => ({
  track: vi.fn(),
}))

vi.mock('@vercel/analytics/react', () => ({
  Analytics: () => null,
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
