import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { SummaryPage } from '../pages/SummaryPage.tsx'
import { ProgramProvider } from '../state/ProgramProvider.tsx'
import { SaveToastProvider, SAVE_TOAST_MESSAGE } from '../state/SaveToast.tsx'
import { loadProgramState, saveProgramState } from '../storage/storage.ts'
import { createMemoryStorage } from '../storage/memoryStorage.ts'
import { createReadySummaryState } from './fixtures.ts'

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
  it('saves the current result and shows the shared save toast', () => {
    const storage = renderSummary()
    fireEvent.click(screen.getByRole('button', { name: '결과 저장' }))
    expect(screen.getByText(SAVE_TOAST_MESSAGE)).toBeInTheDocument()
    expect(screen.getByText(SAVE_TOAST_MESSAGE).closest('[aria-live="polite"]')).toBeTruthy()
    const loaded = loadProgramState(storage)
    expect(loaded?.goal).toContain('주 3회')
    expect(loaded?.priorityAreaId).toBe('health')
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
})
