import { act, fireEvent, render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { Step1ResultPage } from '../pages/Step1ResultPage.tsx'
import { SummaryPage } from '../pages/SummaryPage.tsx'
import { ProgramProvider } from '../state/ProgramProvider.tsx'
import { SAVE_TOAST_DURATION_MS, SAVE_TOAST_MESSAGE, SaveToastProvider } from '../state/SaveToast.tsx'
import { loadProgramState, saveProgramState } from '../storage/storage.ts'
import { createMemoryStorage } from '../storage/memoryStorage.ts'
import { createReadySummaryState } from './fixtures.ts'

function renderWithSaveToast(path: string, page: ReactNode) {
  const storage = createMemoryStorage()
  const prepared = createReadySummaryState()
  prepared.lastVisitedStep = path === '/summary' ? 'summary' : 'step1-result'
  saveProgramState(prepared, storage)
  render(
    <MemoryRouter initialEntries={[path]}>
      <ProgramProvider storage={storage}>
        <SaveToastProvider>{page}</SaveToastProvider>
      </ProgramProvider>
    </MemoryRouter>,
  )
  return storage
}

describe('result save toast', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('shows the toast from the step 1 result save button and writes storage immediately', () => {
    const storage = renderWithSaveToast('/step/1/result', <Step1ResultPage />)
    fireEvent.click(screen.getByRole('button', { name: '결과 저장' }))
    expect(screen.getByText(SAVE_TOAST_MESSAGE)).toBeInTheDocument()
    expect(screen.getByText(SAVE_TOAST_MESSAGE).closest('[aria-live="polite"]')).toBeTruthy()
    expect(loadProgramState(storage)?.priorityAreaId).toBe('health')
  })

  it('shows the toast from the summary save button', () => {
    renderWithSaveToast('/summary', <SummaryPage />)
    fireEvent.click(screen.getByRole('button', { name: '결과 저장' }))
    expect(screen.getByText(SAVE_TOAST_MESSAGE)).toBeInTheDocument()
  })

  it('does not stack toasts when the save button is clicked twice', async () => {
    vi.useFakeTimers()
    renderWithSaveToast('/summary', <SummaryPage />)
    fireEvent.click(screen.getByRole('button', { name: '결과 저장' }))
    fireEvent.click(screen.getByRole('button', { name: '결과 저장' }))
    expect(screen.getAllByText(SAVE_TOAST_MESSAGE)).toHaveLength(1)
    await act(async () => {
      await vi.advanceTimersByTimeAsync(SAVE_TOAST_DURATION_MS)
    })
    expect(screen.queryByText(SAVE_TOAST_MESSAGE)).not.toBeInTheDocument()
  })
})
