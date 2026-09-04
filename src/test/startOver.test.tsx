import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { HomePage } from '../pages/HomePage.tsx'
import { DemographicsPage } from '../pages/DemographicsPage.tsx'
import { Step1AreasPage } from '../pages/Step1AreasPage.tsx'
import { ProgramProvider } from '../state/ProgramProvider.tsx'
import { RESET_CONFIRM_DESCRIPTION, RESET_CONFIRM_LABEL } from '../state/useStartOver.ts'
import { STORAGE_KEY, loadProgramState, saveProgramState } from '../storage/storage.ts'
import { createMemoryStorage } from '../storage/memoryStorage.ts'
import { createReadySummaryState } from './fixtures.ts'

const OLD_REASON = '건강이 다른 삶의 기반이라고 생각한다.'

function renderHome(storage = createMemoryStorage()) {
  saveProgramState(createReadySummaryState(), storage)
  const view = render(
    <MemoryRouter initialEntries={['/']}>
      <ProgramProvider storage={storage}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/info" element={<DemographicsPage />} />
          <Route path="/step/1/:screen" element={<Step1AreasPage />} />
        </Routes>
      </ProgramProvider>
    </MemoryRouter>,
  )
  return { storage, ...view }
}

describe('start over from home', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('shows continue and start-over when saved answers exist', () => {
    renderHome()
    expect(screen.getByRole('button', { name: '이어하기' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '새로 시작하기' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: '생애설계 시작하기' })).not.toBeInTheDocument()
  })

  it('keeps saved answers when the confirm dialog is cancelled', () => {
    const { storage } = renderHome()
    fireEvent.click(screen.getByRole('button', { name: '새로 시작하기' }))
    expect(screen.getByRole('dialog')).toHaveTextContent(RESET_CONFIRM_DESCRIPTION)
    fireEvent.click(screen.getByRole('button', { name: '취소' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: '이어하기' })).toBeInTheDocument()
    expect(loadProgramState(storage)?.priorityReason).toBe(OLD_REASON)
  })

  it('clears storage and state, then opens basic info when confirmed', () => {
    const { storage } = renderHome()
    fireEvent.click(screen.getByRole('button', { name: '새로 시작하기' }))
    fireEvent.click(screen.getByRole('button', { name: RESET_CONFIRM_LABEL }))
    expect(screen.getByRole('heading', { name: '이용정보 안내' })).toBeInTheDocument()
    expect(screen.queryByText(OLD_REASON)).not.toBeInTheDocument()
    expect(storage.getItem(STORAGE_KEY)).toBeNull()
    const loaded = loadProgramState(storage)
    expect(loaded).toBeNull()
    expect(screen.getByLabelText('만 나이')).toHaveValue('')
    expect(screen.getByLabelText('만 나이')).not.toBeDisabled()
    expect(screen.getByRole('radio', { name: '남성' })).not.toBeChecked()
    expect(screen.getByRole('radio', { name: '여성' })).not.toBeChecked()
    fireEvent.click(screen.getByRole('button', { name: '이전' }))
    expect(screen.getByRole('button', { name: '생애설계 시작하기' })).toBeInTheDocument()
  })

  it('does not restore deleted answers after a simulated reload', async () => {
    vi.useFakeTimers()
    const { storage, unmount } = renderHome()
    fireEvent.click(screen.getByRole('button', { name: '새로 시작하기' }))
    fireEvent.click(screen.getByRole('button', { name: RESET_CONFIRM_LABEL }))
    await vi.advanceTimersByTimeAsync(500)
    unmount()

    const reloaded = loadProgramState(storage)
    expect(reloaded?.priorityReason ?? '').toBe('')
    expect(reloaded?.priorityAreaId ?? null).toBeNull()
    expect(reloaded?.goal ?? '').toBe('')
    expect(reloaded?.completedStepIds ?? []).toEqual([])
    expect(reloaded?.lastVisitedStep === 'home' || reloaded?.lastVisitedStep === 'step1-1' || reloaded == null).toBe(
      true,
    )

    render(
      <MemoryRouter initialEntries={['/']}>
        <ProgramProvider storage={storage}>
          <HomePage />
        </ProgramProvider>
      </MemoryRouter>,
    )
    expect(screen.queryByText(OLD_REASON)).not.toBeInTheDocument()
  })
})
