import { fireEvent, render, screen, within } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ProgramShell } from '../components/layout/ProgramShell.tsx'
import { Step4GoalPage } from '../pages/Step4GoalPage.tsx'
import { Step5ActionPage } from '../pages/Step5ActionPage.tsx'
import { ProgramProvider } from '../state/ProgramProvider.tsx'
import { SaveToastProvider } from '../state/SaveToast.tsx'
import { saveProgramState } from '../storage/storage.ts'
import { createMemoryStorage } from '../storage/memoryStorage.ts'
import type { ProgramState } from '../domain/types.ts'
import { createReadySummaryState, createStateThroughGoal } from './fixtures.ts'

function renderStep(path: string, state: ProgramState) {
  const storage = createMemoryStorage()
  saveProgramState(state, storage)
  render(
    <MemoryRouter initialEntries={[path]}>
      <ProgramProvider storage={storage}>
        <SaveToastProvider>
          <Routes>
            <Route element={<ProgramShell />}>
              <Route path="/step/4" element={<Step4GoalPage />} />
              <Route path="/step/5" element={<Step5ActionPage />} />
              <Route path="/summary" element={<div>종합 결과</div>} />
            </Route>
          </Routes>
        </SaveToastProvider>
      </ProgramProvider>
    </MemoryRouter>,
  )
}

function expectOptionalLabel(label: string) {
  expect(screen.getByLabelText(new RegExp(`${label}.*\\(선택\\)`))).toBeInTheDocument()
}

describe('optional field marks', () => {
  beforeEach(() => {
    window.scrollTo = vi.fn()
  })
  it('marks only optional goal fields and does not add 필수 to required ones', () => {
    const state = createReadySummaryState()
    state.lastVisitedStep = 'step4'
    renderStep('/step/4', state)

    expectOptionalLabel('목표 기간')
    expectOptionalLabel('목표 달성 확인 기준')
    expect(screen.getByRole('heading', { name: /자기점검.*\(선택\)/ })).toBeInTheDocument()
    expect(screen.getByLabelText('나의 목표')).toBeInTheDocument()
    expect(screen.queryByLabelText(/나의 목표.*선택/)).not.toBeInTheDocument()
    expect(screen.queryByText('필수')).not.toBeInTheDocument()
  })

  it('marks optional action-plan fields, including help resources, and skips them in validation', () => {
    renderStep('/step/5', createStateThroughGoal())

    expectOptionalLabel('할 수 있는 행동 2')
    expectOptionalLabel('할 수 있는 행동 3')
    expect(screen.getByLabelText('할 수 있는 행동 1')).toBeInTheDocument()
    expect(screen.queryByLabelText(/할 수 있는 행동 1.*선택/)).not.toBeInTheDocument()
    expect(
      screen.getByRole('group', { name: /도움이 될 사람·정보·자료·도구.*\(선택\)/ }),
    ).toBeInTheDocument()
    expectOptionalLabel('도움·자원에 대한 메모')
    expectOptionalLabel('자기격려나 다짐')
    expect(screen.queryByText('필수')).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('radio', { name: '한 번 완료하는 행동' }))
    expectOptionalLabel('얼마 동안')

    fireEvent.change(screen.getByLabelText('할 수 있는 행동 1'), {
      target: { value: '공원에서 걷는다' },
    })
    fireEvent.click(screen.getByRole('radio', { name: /행동 1/ }))
    fireEvent.change(screen.getByLabelText('언제 (날짜·시간·상황)'), { target: { value: '토요일' } })
    fireEvent.change(screen.getByLabelText('어디서'), { target: { value: '공원' } })
    fireEvent.change(screen.getByLabelText('가장 가능성 높은 장애물 1개'), { target: { value: '없음' } })
    const feasibility = screen.getByRole('radiogroup', { name: '첫 행동 실행 가능성' })
    fireEvent.click(within(feasibility).getByRole('radio', { name: '6' }))
    fireEvent.click(screen.getByRole('button', { name: '나의 첫 행동으로 확정' }))
    expect(screen.getByText('종합 결과')).toBeInTheDocument()
  })
})
