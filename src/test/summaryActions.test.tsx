import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  COACHING_CENTER_CTA,
  COACHING_CENTER_TITLE,
  COACHING_CENTER_URL,
  FEEDBACK_TITLE,
} from '../copy/programCopy.ts'
import { SummaryPage } from '../pages/SummaryPage.tsx'
import { ProgramProvider } from '../state/ProgramProvider.tsx'
import { SaveToastProvider } from '../state/SaveToast.tsx'
import { loadProgramState, saveProgramState } from '../storage/storage.ts'
import { createMemoryStorage } from '../storage/memoryStorage.ts'
import { createReadySummaryState } from './fixtures.ts'

const saveSummaryPdf = vi.hoisted(() => vi.fn())

vi.mock('../pdf/renderSummaryPdf.ts', () => ({
  saveSummaryPdf,
  PDF_ERROR_MESSAGE: 'PDF 파일을 만들지 못했습니다. 잠시 후 다시 시도해 주세요.',
  ANDROID_PDF_TOAST_MS: 4000,
  shouldShowAndroidPdfToast: (result: string, userAgent: string) =>
    result === 'downloaded' && /Android/i.test(userAgent),
}))

function renderSummary(storage = createMemoryStorage()) {
  saveProgramState(createReadySummaryState(), storage)
  render(
    <MemoryRouter initialEntries={['/summary']}>
      <ProgramProvider storage={storage}>
        <SaveToastProvider>
          <SummaryPage />
        </SaveToastProvider>
      </ProgramProvider>
    </MemoryRouter>,
  )
  return storage
}

describe('summary result actions', () => {
  beforeEach(() => {
    saveSummaryPdf.mockReset()
    saveSummaryPdf.mockResolvedValue('downloaded')
  })

  it('explains that the result is saved in the current browser and keeps the stored result', () => {
    const storage = renderSummary()
    expect(screen.queryByRole('button', { name: '결과 저장' })).not.toBeInTheDocument()
    const note = screen.getByText('작성 내용은 현재 브라우저에 자동으로 저장됩니다.')
    expect(note).toHaveClass('result-save-note')
    expect(note.closest('.no-print')).toBeTruthy()
    const loaded = loadProgramState(storage)
    expect(loaded?.goal).toContain('주 3회')
    expect(loaded?.priorityAreaId).toBe('health')
  })

  it('creates a PDF file from the result and keeps printing as a secondary action', async () => {
    const print = vi.spyOn(window, 'print').mockImplementation(() => {})
    let resolvePdf: (value: 'downloaded') => void = () => {}
    saveSummaryPdf.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolvePdf = resolve
        }),
    )
    renderSummary()
    const pdf = screen.getByRole('button', { name: 'PDF 저장·공유' })
    expect(screen.queryByText('인쇄 창에서 ‘PDF로 저장’을 선택해 주세요.')).not.toBeInTheDocument()
    expect(screen.queryByText('결과가 저장되었습니다.')).not.toBeInTheDocument()
    fireEvent.click(pdf)
    expect(pdf).toBeDisabled()
    expect(pdf).toHaveTextContent('PDF 만드는 중…')
    fireEvent.click(pdf)
    expect(saveSummaryPdf).toHaveBeenCalledTimes(1)
    resolvePdf('downloaded')
    await waitFor(() => expect(pdf).not.toBeDisabled())
    expect(screen.queryByText('PDF가 저장되었습니다.')).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: '인쇄하기' }))
    expect(print).toHaveBeenCalledTimes(1)
    print.mockRestore()
  })

  it('shows a visible error when PDF creation fails', async () => {
    saveSummaryPdf.mockRejectedValue(new Error('canvas failed'))
    renderSummary()
    fireEvent.click(screen.getByRole('button', { name: 'PDF 저장·공유' }))
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'PDF 파일을 만들지 못했습니다. 잠시 후 다시 시도해 주세요.',
    )
  })

  it('shows a completion region when 생애설계 완료 is pressed', () => {
    const storage = renderSummary()
    fireEvent.click(screen.getByRole('button', { name: '생애설계 완료' }))
    expect(screen.getByText('자기주도 생애설계를 완료했습니다.')).toBeInTheDocument()
    expect(
      screen.getByText('정한 시점에 첫 행동을 시작하고, 필요할 때 이 계획을 다시 살펴보세요.'),
    ).toBeInTheDocument()
    expect(screen.getByText('자기주도 생애설계를 완료했습니다.').closest('[aria-live="polite"]')).toBeTruthy()
    expect(loadProgramState(storage)?.programCompleted).toBe(true)
  })

  it('shows the stored answers including change ideas, values, self-checks, and actions', () => {
    renderSummary()
    expect(screen.getByText('규칙적으로 걷고 잠을 충분히 자고 싶다.')).toBeInTheDocument()
    expect(screen.getByText(/가치 후보 5개:/)).toHaveTextContent('자율, 성장, 도전, 창의, 성취')
    expect(screen.getByText(/내가 진정으로 원하는 목표인가: 예/)).toBeInTheDocument()
    expect(screen.getByText(/무엇이 달라질지 구체적인가: 아직 보완이 필요함/)).toBeInTheDocument()
    expect(screen.getByText(/행동 1 \(우선 실행행동\): 걷기 일정 만들기/)).toBeInTheDocument()
    expect(screen.getByText(/행동 2: 수면 일기 쓰기/)).toBeInTheDocument()
  })

  it('places feedback after save actions and the coaching invite after feedback', () => {
    renderSummary()
    const inviteTitle = screen.getByRole('heading', { name: COACHING_CENTER_TITLE })
    const inviteLink = screen.getByRole('link', { name: COACHING_CENTER_CTA })
    const firstAction = screen.getByRole('heading', { name: '첫 행동' })
    const note = screen.getByText('작성 내용은 현재 브라우저에 자동으로 저장됩니다.')
    const print = screen.getByRole('button', { name: 'PDF 저장·공유' })
    const complete = screen.getByRole('button', { name: '생애설계 완료' })
    const feedback = screen.getByRole('heading', { name: FEEDBACK_TITLE })

    expect(inviteLink).toHaveAttribute('href', COACHING_CENTER_URL)
    expect(inviteLink).toHaveAttribute('target', '_blank')
    expect(inviteLink).toHaveAttribute('rel', 'noopener noreferrer')
    expect(inviteLink.closest('.no-print')).toBeNull()
    expect(note.closest('.no-print')).toBeTruthy()
    expect(feedback.closest('.no-print')).toBeTruthy()

    expect(firstAction.compareDocumentPosition(note) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(note.compareDocumentPosition(print) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(print.compareDocumentPosition(feedback) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(feedback.compareDocumentPosition(inviteTitle) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(complete).toBeInTheDocument()
  })
})
