import { fireEvent, render, screen, within } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ProgramShell } from '../components/layout/ProgramShell.tsx'
import { ProgramProvider } from '../state/ProgramProvider.tsx'
import { SaveToastProvider } from '../state/SaveToast.tsx'
import { Step1AreasPage } from '../pages/Step1AreasPage.tsx'
import { Step2PriorityPage } from '../pages/Step2PriorityPage.tsx'
import { Step5ActionPage } from '../pages/Step5ActionPage.tsx'
import { SummaryPage } from '../pages/SummaryPage.tsx'
import {
  INCOMPLETE_STEP_BANNER,
  MISSING_RESPONSE_BANNER_ONE,
  MISSING_RESPONSE_LABEL,
  missingResponseBanner,
} from '../domain/validation.ts'
import { createInitialState } from '../domain/initialState.ts'
import { loadProgramState, saveProgramState } from '../storage/storage.ts'
import { createMemoryStorage } from '../storage/memoryStorage.ts'
import type { ProgramState } from '../domain/types.ts'
import { createReadySummaryState, createStateThroughGoal } from './fixtures.ts'

function renderProgram(path: string, state: ProgramState) {
  const storage = createMemoryStorage()
  saveProgramState(state, storage)
  render(
    <MemoryRouter initialEntries={[path]}>
      <ProgramProvider storage={storage}>
        <SaveToastProvider>
          <Routes>
            <Route element={<ProgramShell />}>
              <Route path="/step/1/:screen" element={<Step1AreasPage />} />
              <Route path="/step/2" element={<Step2PriorityPage />} />
              <Route path="/step/5" element={<Step5ActionPage />} />
              <Route path="/summary" element={<SummaryPage />} />
            </Route>
          </Routes>
        </SaveToastProvider>
      </ProgramProvider>
    </MemoryRouter>,
  )
  return storage
}

function chooseScore(label: string, score: number) {
  const group = screen.getByRole('radiogroup', { name: label })
  fireEvent.click(within(group).getByRole('radio', { name: String(score) }))
}

function bannerAlert() {
  return screen.getByText(MISSING_RESPONSE_LABEL).closest('[role="alert"]')
}

describe('missing response guidance', () => {
  beforeEach(() => {
    Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', {
      configurable: true,
      writable: true,
      value: vi.fn(),
    })
    window.scrollTo = vi.fn()
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('blocks next, shows a count banner, scrolls, and focuses the first missing control', () => {
    renderProgram('/step/1/1', createInitialState())
    fireEvent.click(screen.getByRole('button', { name: '다음 화면' }))

    expect(screen.getByRole('heading', { name: '삶의 영역 평가' })).toBeInTheDocument()
    const alert = bannerAlert()
    expect(alert).toHaveAttribute('aria-live', 'assertive')
    expect(alert).toHaveTextContent(missingResponseBanner(6))
    expect(screen.getByText('자아·성장의 중요도를 1점부터 7점 사이에서 선택해 주세요.')).toBeInTheDocument()
    expect(document.getElementById('selfGrowth-importance')?.scrollIntoView).toHaveBeenCalled()
    expect(document.activeElement).toBe(document.getElementById('selfGrowth-importance-1'))
  })

  it('clears only the answered error and moves to the next gap on another next click', () => {
    renderProgram('/step/1/1', createInitialState())
    fireEvent.click(screen.getByRole('button', { name: '다음 화면' }))
    chooseScore('자아·성장 중요도', 5)

    expect(
      screen.queryByText('자아·성장의 중요도를 1점부터 7점 사이에서 선택해 주세요.'),
    ).not.toBeInTheDocument()
    expect(screen.getByText('자아·성장의 만족도를 1점부터 7점 사이에서 선택해 주세요.')).toBeInTheDocument()
    expect(screen.getByText('일·커리어의 중요도를 1점부터 7점 사이에서 선택해 주세요.')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: '다음 화면' }))
    expect(bannerAlert()).toHaveTextContent(missingResponseBanner(5))
    expect(document.getElementById('selfGrowth-satisfaction')?.scrollIntoView).toHaveBeenCalled()
    expect(document.activeElement).toBe(document.getElementById('selfGrowth-satisfaction-1'))
  })

  it('shows a single-item banner when only one required answer is missing', () => {
    const state = createReadySummaryState()
    state.priorityReason = ''
    state.lastVisitedStep = 'step2'
    renderProgram('/step/2', state)

    fireEvent.click(screen.getByRole('button', { name: '다음 단계' }))
    expect(bannerAlert()).toHaveTextContent(MISSING_RESPONSE_BANNER_ONE)
    expect(screen.getByText('선택한 이유를 작성해 주세요.')).toBeInTheDocument()
    expect(document.activeElement).toBe(screen.getByLabelText('이 영역을 선택한 이유'))
  })

  it('validates every required action-plan field in screen order', () => {
    renderProgram('/step/5', createStateThroughGoal())
    const next = () => fireEvent.click(screen.getByRole('button', { name: '나의 첫 행동으로 확정' }))

    next()
    expect(bannerAlert()).toHaveTextContent(missingResponseBanner(8))
    expect(screen.getByText('할 수 있는 행동을 한 가지 이상 작성해 주세요.')).toBeInTheDocument()
    expect(document.activeElement).toBe(screen.getByLabelText('할 수 있는 행동 1'))

    fireEvent.change(screen.getByLabelText('할 수 있는 행동 1'), {
      target: { value: '공원에서 걷는다' },
    })
    expect(screen.queryByText('할 수 있는 행동을 한 가지 이상 작성해 주세요.')).not.toBeInTheDocument()
    next()
    expect(screen.getByText('가장 먼저 실행할 행동을 선택해 주세요.')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('radio', { name: /행동 1/ }))

    next()
    expect(screen.getByText('행동유형을 선택해 주세요.')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('radio', { name: '한 번 완료하는 행동' }))

    next()
    expect(screen.getByText('실행할 시기를 입력해 주세요.')).toBeInTheDocument()
    expect(screen.getByLabelText('무엇을')).toHaveValue('공원에서 걷는다')
    fireEvent.change(screen.getByLabelText('언제 (날짜·시간·상황)'), { target: { value: '토요일 아침' } })

    next()
    expect(screen.getByText('실행할 장소를 입력해 주세요.')).toBeInTheDocument()
    fireEvent.change(screen.getByLabelText('어디서'), { target: { value: '집 근처 공원' } })

    next()
    expect(screen.getByText('예상되는 장애물을 입력하거나 ‘없음’ 또는 ‘모름’을 선택해 주세요.')).toBeInTheDocument()
    fireEvent.change(screen.getByLabelText('가장 가능성 높은 장애물 1개'), { target: { value: '비' } })

    next()
    expect(screen.getByText('장애물에 대한 대안행동을 작성해 주세요.')).toBeInTheDocument()
    fireEvent.change(screen.getByLabelText('대안행동'), { target: { value: '실내에서 스트레칭한다' } })

    next()
    expect(screen.getByText('실행 가능성을 1점부터 7점 사이에서 선택해 주세요.')).toBeInTheDocument()
    chooseScore('첫 행동 실행 가능성', 6)

    next()
    expect(screen.getByRole('heading', { name: '나의 생애설계' })).toBeInTheDocument()
  })

  it('does not require hidden duration for a one-time action and accepts 없음', () => {
    const state = createStateThroughGoal()
    state.actions = ['공원에서 걷는다', '', '']
    state.primaryActionIndex = 0
    state.actionType = 'once'
    state.actionWhat = '걷기'
    state.actionWhen = '토요일'
    state.actionWhere = '공원'
    state.actionFrequencyOrDuration = ''
    state.obstacle = '없음'
    state.alternativeAction = ''
    state.firstActionFeasibility = 6
    renderProgram('/step/5', state)

    fireEvent.click(screen.getByRole('button', { name: '나의 첫 행동으로 확정' }))
    expect(screen.queryByText(MISSING_RESPONSE_LABEL)).not.toBeInTheDocument()
    expect(screen.getByRole('heading', { name: '나의 생애설계' })).toBeInTheDocument()
  })

  it('requires frequency for a repeating action and accepts 모름 as the obstacle', () => {
    const state = createStateThroughGoal()
    state.actions = ['공원에서 걷는다', '', '']
    state.primaryActionIndex = 0
    state.actionType = 'repeat'
    state.actionWhat = '걷기'
    state.actionWhen = '화요일 저녁'
    state.actionWhere = '공원'
    state.actionFrequencyOrDuration = ''
    state.obstacle = '모름'
    state.alternativeAction = ''
    state.firstActionFeasibility = 6
    renderProgram('/step/5', state)

    fireEvent.click(screen.getByRole('button', { name: '나의 첫 행동으로 확정' }))
    expect(screen.getByText('실행 빈도를 입력해 주세요.')).toBeInTheDocument()
    expect(screen.queryByText('장애물에 대한 대안행동을 작성해 주세요.')).not.toBeInTheDocument()
    fireEvent.change(screen.getByLabelText('얼마나 자주'), { target: { value: '주 3회' } })
    fireEvent.click(screen.getByRole('button', { name: '나의 첫 행동으로 확정' }))
    expect(screen.getByRole('heading', { name: '나의 생애설계' })).toBeInTheDocument()
  })

  it('keeps autosave working after a validation error is shown', async () => {
    vi.useFakeTimers()
    const storage = renderProgram('/step/5', createStateThroughGoal())
    fireEvent.click(screen.getByRole('button', { name: '나의 첫 행동으로 확정' }))
    fireEvent.change(screen.getByLabelText('할 수 있는 행동 1'), {
      target: { value: '저장될 행동' },
    })
    await vi.advanceTimersByTimeAsync(500)
    expect(loadProgramState(storage)?.actions[0]).toBe('저장될 행동')
    expect(loadProgramState(storage)?.goal).toContain('주 3회')
  })

  it('moves from an incomplete later step back to the first unfinished question', () => {
    const state = createReadySummaryState()
    state.priorityAreaId = null
    state.priorityReason = ''
    renderProgram('/summary', state)

    expect(screen.getByRole('heading', { name: '우선 삶의 영역 선택' })).toBeInTheDocument()
    expect(screen.getByText(INCOMPLETE_STEP_BANNER)).toBeInTheDocument()
    expect(screen.getByText('우선적으로 다루고 싶은 삶의 영역 1개를 선택해 주세요.')).toBeInTheDocument()
    expect(document.activeElement).toBe(document.getElementById('first-field'))
  })
})
