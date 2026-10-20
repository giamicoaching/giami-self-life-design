import { describe, expect, it, vi } from 'vitest'
import {
  SUMMARY_PDF_FILENAME,
  deliverSummaryPdf,
  isAndroidDevice,
  isAppleMobile,
  shouldShowAndroidPdfToast,
  type PdfDeliveryEnv,
} from './summaryPdfDelivery.ts'

function env(overrides: Partial<PdfDeliveryEnv> = {}): PdfDeliveryEnv {
  return {
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    platform: 'Win32',
    maxTouchPoints: 0,
    download: vi.fn(),
    open: vi.fn(() => false),
    ...overrides,
  }
}

const blob = new Blob(['%PDF-1.4'], { type: 'application/pdf' })

describe('summary PDF delivery', () => {
  it('recognizes Apple mobile and Android devices', () => {
    expect(isAppleMobile('Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)', 'iPhone', 5)).toBe(
      true,
    )
    expect(isAppleMobile('Mozilla/5.0 (Macintosh; Intel Mac OS X)', 'MacIntel', 5)).toBe(true)
    expect(isAppleMobile('Mozilla/5.0 (Windows NT 10.0)', 'Win32', 0)).toBe(false)
    expect(isAndroidDevice('Mozilla/5.0 (Linux; Android 14; SM-S911N) Mobile')).toBe(true)
    expect(isAndroidDevice('Mozilla/5.0 (Windows NT 10.0)')).toBe(false)
  })

  it('downloads on PC and does not ask for a completion toast', async () => {
    const download = vi.fn()
    const result = await deliverSummaryPdf(blob, env({ download }))
    expect(result).toBe('downloaded')
    expect(download).toHaveBeenCalledWith(blob, SUMMARY_PDF_FILENAME)
    expect(shouldShowAndroidPdfToast(result, 'Mozilla/5.0 (Windows NT 10.0)')).toBe(false)
  })

  it('downloads on Android and shows the save toast only there', async () => {
    const userAgent = 'Mozilla/5.0 (Linux; Android 14; SM-S911N) AppleWebKit Mobile Chrome/120.0.0.0'
    const download = vi.fn()
    const result = await deliverSummaryPdf(blob, env({ userAgent, download }))
    expect(result).toBe('downloaded')
    expect(download).toHaveBeenCalledWith(blob, SUMMARY_PDF_FILENAME)
    expect(shouldShowAndroidPdfToast(result, userAgent)).toBe(true)
  })

  it('opens the iOS share sheet and skips the toast', async () => {
    const share = vi.fn(async () => undefined)
    const download = vi.fn()
    const result = await deliverSummaryPdf(
      blob,
      env({
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)',
        platform: 'iPhone',
        maxTouchPoints: 5,
        share,
        canShare: () => true,
        download,
      }),
    )
    expect(result).toBe('shared')
    expect(share).toHaveBeenCalledTimes(1)
    expect(download).not.toHaveBeenCalled()
    expect(shouldShowAndroidPdfToast(result, 'iPhone')).toBe(false)
  })

  it('treats a cancelled iOS share as cancelled', async () => {
    const share = vi.fn(async () => {
      throw new DOMException('cancelled', 'AbortError')
    })
    const download = vi.fn()
    const result = await deliverSummaryPdf(
      blob,
      env({
        userAgent: 'Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X)',
        platform: 'iPad',
        maxTouchPoints: 5,
        share,
        canShare: () => true,
        download,
      }),
    )
    expect(result).toBe('cancelled')
    expect(download).not.toHaveBeenCalled()
  })

  it('opens a new tab when iOS cannot share the file', async () => {
    const open = vi.fn(() => true)
    const download = vi.fn()
    const result = await deliverSummaryPdf(
      blob,
      env({
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)',
        platform: 'iPhone',
        maxTouchPoints: 5,
        canShare: () => false,
        open,
        download,
      }),
    )
    expect(result).toBe('opened')
    expect(open).toHaveBeenCalledWith(blob)
    expect(download).not.toHaveBeenCalled()
  })
})
