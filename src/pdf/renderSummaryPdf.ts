import {
  ANDROID_PDF_TOAST_MS,
  PDF_ERROR_MESSAGE,
  browserPdfEnv,
  deliverSummaryPdf,
  shouldShowAndroidPdfToast,
  type PdfDelivery,
} from './summaryPdfDelivery.ts'

const EXPORT_WIDTH_PX = 720
const PAGE_MARGIN_MM = 10
const JPEG_QUALITY = 0.96
const CANVAS_SCALE = 1.5

const BREAK_SELECTOR = [
  '.print-banner',
  '.step-heading',
  '.wheel-print-block',
  '.wheel',
  '.index-list',
  '.index-list li',
  '.result-block',
  '.coaching-invite',
  '.print-credit',
].join(', ')

type PdfDocument = {
  internal: { pageSize: { getWidth: () => number; getHeight: () => number } }
  addPage: () => void
  addImage: (data: string, format: string, x: number, y: number, width: number, height: number) => void
  output: (type: 'blob') => Blob
}

function mountExportCopy(source: HTMLElement): { element: HTMLElement; cleanup: () => void } {
  const copy = source.cloneNode(true) as HTMLElement
  copy.classList.add('pdf-export-root')
  copy.setAttribute('aria-hidden', 'true')
  copy.style.position = 'absolute'
  copy.style.left = '0'
  copy.style.top = '0'
  copy.style.width = `${EXPORT_WIDTH_PX}px`
  copy.style.maxWidth = `${EXPORT_WIDTH_PX}px`
  copy.style.height = 'auto'
  copy.style.overflow = 'visible'
  copy.style.zIndex = '5'
  copy.style.background = '#ffffff'
  document.body.appendChild(copy)
  return {
    element: copy,
    cleanup: () => copy.remove(),
  }
}

function blockRegions(root: HTMLElement, scale: number): Array<{ top: number; bottom: number }> {
  const rootTop = root.getBoundingClientRect().top
  return [...root.querySelectorAll<HTMLElement>(BREAK_SELECTOR)].map((element) => {
    const box = element.getBoundingClientRect()
    return {
      top: Math.max(0, (box.top - rootTop) * scale),
      bottom: Math.max(0, (box.bottom - rootTop) * scale),
    }
  })
}

function chooseSliceEnd(
  start: number,
  pageHeight: number,
  canvasHeight: number,
  regions: Array<{ top: number; bottom: number }>,
): number {
  const pageEnd = Math.min(canvasHeight, start + pageHeight)
  if (pageEnd >= canvasHeight - 1) return canvasHeight
  const earliest = start + Math.floor(pageHeight * 0.18)
  const headingBand = 72 * CANVAS_SCALE
  let boundary = pageEnd
  for (const region of regions) {
    const into = pageEnd - region.top
    const continuesPastPage = region.bottom > pageEnd + 4
    if (region.top < earliest || into <= 0 || !continuesPastPage) continue
    const fitsOnNextPage = region.bottom - region.top <= pageHeight
    if (fitsOnNextPage || into < headingBand) {
      boundary = Math.min(boundary, Math.max(earliest, region.top - 18))
    }
  }
  return Math.max(start + 1, Math.floor(boundary))
}

function canvasToPdf(
  canvas: HTMLCanvasElement,
  regions: Array<{ top: number; bottom: number }>,
  createPdf: () => PdfDocument,
): Blob {
  const pdf = createPdf()
  const pageWidth = pdf.internal.pageSize.getWidth()
  const pageHeight = pdf.internal.pageSize.getHeight()
  const printableWidth = pageWidth - PAGE_MARGIN_MM * 2
  const printableHeight = pageHeight - PAGE_MARGIN_MM * 2
  const pageCanvasHeight = Math.floor((printableHeight / printableWidth) * canvas.width)
  let offset = 0
  let page = 0
  while (offset < canvas.height && page < 40) {
    const end = chooseSliceEnd(offset, pageCanvasHeight, canvas.height, regions)
    const sliceHeight = Math.max(1, end - offset)
    const slice = document.createElement('canvas')
    slice.width = canvas.width
    slice.height = sliceHeight
    const context = slice.getContext('2d')
    if (!context) throw new Error('PDF 페이지를 나누지 못했습니다.')
    context.fillStyle = '#ffffff'
    context.fillRect(0, 0, slice.width, slice.height)
    context.drawImage(canvas, 0, offset, canvas.width, sliceHeight, 0, 0, canvas.width, sliceHeight)
    const heightMm = (sliceHeight * printableWidth) / canvas.width
    if (page > 0) pdf.addPage()
    pdf.addImage(slice.toDataURL('image/jpeg', JPEG_QUALITY), 'JPEG', PAGE_MARGIN_MM, PAGE_MARGIN_MM, printableWidth, heightMm)
    offset = end
    page += 1
  }
  const blob = pdf.output('blob')
  if (blob.size < 500) throw new Error('PDF가 비어 있습니다.')
  return blob
}

async function renderCanvas(element: HTMLElement, foreignObjectRendering: boolean): Promise<HTMLCanvasElement> {
  const html2canvas = (await import('html2canvas')).default
  return html2canvas(element, {
    scale: CANVAS_SCALE,
    useCORS: true,
    backgroundColor: '#ffffff',
    foreignObjectRendering,
    scrollX: 0,
    scrollY: 0,
    windowWidth: EXPORT_WIDTH_PX,
    windowHeight: Math.max(element.scrollHeight, element.offsetHeight),
    logging: false,
  })
}

export async function renderSummaryPdf(source: HTMLElement): Promise<Blob> {
  const mounted = mountExportCopy(source)
  try {
    const regions = blockRegions(mounted.element, CANVAS_SCALE)
    const { jsPDF } = await import('jspdf')
    let canvas: HTMLCanvasElement
    try {
      canvas = await renderCanvas(mounted.element, false)
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      if (!/color|unsupported/i.test(message)) throw error
      canvas = await renderCanvas(mounted.element, true)
    }
    return canvasToPdf(canvas, regions, () => new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' }))
  } finally {
    mounted.cleanup()
  }
}

export async function saveSummaryPdf(source: HTMLElement): Promise<PdfDelivery> {
  const blob = await renderSummaryPdf(source)
  return deliverSummaryPdf(blob, browserPdfEnv())
}

export { ANDROID_PDF_TOAST_MS, PDF_ERROR_MESSAGE, shouldShowAndroidPdfToast }
