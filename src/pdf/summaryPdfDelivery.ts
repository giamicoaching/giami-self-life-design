export const SUMMARY_PDF_FILENAME = '지아미_자기주도생애설계_결과.pdf'
export const PDF_ERROR_MESSAGE =
  'PDF 파일을 만들지 못했습니다. 잠시 후 다시 시도해 주세요.'
export const ANDROID_PDF_TOAST_MS = 4000

export type PdfDelivery = 'shared' | 'downloaded' | 'opened' | 'cancelled'

export interface PdfDeliveryEnv {
  userAgent: string
  platform: string
  maxTouchPoints: number
  share?: (data: ShareData) => Promise<void>
  canShare?: (data: ShareData) => boolean
  download: (blob: Blob, filename: string) => void
  open: (blob: Blob) => boolean
}

export function isAppleMobile(userAgent: string, platform: string, maxTouchPoints: number): boolean {
  return /iPad|iPhone|iPod/.test(userAgent) || (platform === 'MacIntel' && maxTouchPoints > 1)
}

export function isAndroidDevice(userAgent: string): boolean {
  return /Android/i.test(userAgent)
}

export function shouldShowAndroidPdfToast(result: PdfDelivery, userAgent: string): boolean {
  return result === 'downloaded' && isAndroidDevice(userAgent)
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.rel = 'noopener'
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export function openBlob(blob: Blob): boolean {
  const url = URL.createObjectURL(blob)
  const opened = window.open(url, '_blank', 'noopener')
  window.setTimeout(() => URL.revokeObjectURL(url), 60_000)
  return opened !== null
}

export function browserPdfEnv(): PdfDeliveryEnv {
  const nav = navigator as Navigator & { canShare?: (data: ShareData) => boolean }
  return {
    userAgent: nav.userAgent,
    platform: nav.platform,
    maxTouchPoints: nav.maxTouchPoints ?? 0,
    share: typeof nav.share === 'function' ? (data) => nav.share!(data) : undefined,
    canShare: typeof nav.canShare === 'function' ? (data) => nav.canShare!(data) : undefined,
    download: downloadBlob,
    open: openBlob,
  }
}

export async function deliverSummaryPdf(
  blob: Blob,
  env: PdfDeliveryEnv = browserPdfEnv(),
): Promise<PdfDelivery> {
  const file = new File([blob], SUMMARY_PDF_FILENAME, { type: 'application/pdf' })
  const apple = isAppleMobile(env.userAgent, env.platform, env.maxTouchPoints)
  const shareData: ShareData = { files: [file], title: '지아미 자기주도 생애설계 결과' }
  const canTryShare =
    apple &&
    typeof env.share === 'function' &&
    (typeof env.canShare !== 'function' || env.canShare(shareData))

  if (canTryShare && env.share) {
    try {
      await env.share(shareData)
      return 'shared'
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return 'cancelled'
    }
  }

  if (!apple) {
    env.download(blob, SUMMARY_PDF_FILENAME)
    return 'downloaded'
  }

  if (env.open(blob)) return 'opened'
  env.download(blob, SUMMARY_PDF_FILENAME)
  return 'downloaded'
}
