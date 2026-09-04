import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const css = readFileSync(join(dirname(fileURLToPath(import.meta.url)), '../index.css'), 'utf8')

describe('print layout rules', () => {
  it('keeps the life wheel title, description, chart, and legend together', () => {
    expect(css).toContain('.wheel-print-block')
    expect(css).toMatch(/\.wheel-print-block[\s\S]*break-inside:\s*avoid/)
    expect(css).toMatch(/\.wheel-print-block[\s\S]*page-break-inside:\s*avoid/)
    expect(css).toContain('.wheel-print-title')
    expect(css).toMatch(/\.wheel-print-title[\s\S]*break-after:\s*avoid/)
    expect(css).toMatch(/\.wheel-print-block \.wheel[\s\S]*max-height:\s*118mm/)
  })

  it('avoids splitting summary sections and hides on-screen controls', () => {
    expect(css).toMatch(/\.result-block[\s\S]*break-inside:\s*avoid/)
    expect(css).toContain('.no-print')
    expect(css).toMatch(/@media print[\s\S]*\.progress-header[\s\S]*display:\s*none/)
    expect(css).toMatch(/@page[\s\S]*size:\s*A4 portrait/)
    expect(css).toContain("font-family: var(--font)")
    expect(css).toContain("'Malgun Gothic'")
    expect(css).toContain('print-color-adjust: exact')
    expect(css).toContain('stroke-dasharray: 6 5')
  })

  it('keeps the coaching center invite in printed summary results', () => {
    expect(css).toMatch(/\.coaching-invite[\s\S]*break-inside:\s*avoid/)
    expect(css).toMatch(/\.coaching-invite[\s\S]*page-break-inside:\s*avoid/)
    expect(css).toMatch(/@media print[\s\S]*\.coaching-invite/)
    expect(css).not.toMatch(/\.no-print[^{]*\.coaching-invite/)
    expect(css).not.toMatch(/\.coaching-invite[^{]*\.no-print/)
  })

  it('prints the summary copyright credit and hides the on-screen footer', () => {
    expect(css).toContain('.print-credit')
    expect(css).toMatch(/@media print[\s\S]*\.print-credit/)
    expect(css).toContain('.site-footer')
    expect(css).not.toMatch(/\.no-print[^{]*\.print-credit/)
    expect(css).not.toMatch(/\.print-credit[^{]*\.no-print/)
  })
})
