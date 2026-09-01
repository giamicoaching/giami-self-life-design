import { fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createInitialState } from '../domain/initialState.ts'
import { LIFE_AREA_IDS } from '../domain/types.ts'
import { ProgramProvider, useProgram } from '../state/ProgramProvider.tsx'
import { loadProgramState, saveProgramState } from '../storage/storage.ts'
import { createMemoryStorage } from '../storage/memoryStorage.ts'

function Probe() {
  const { state, dispatch, saveNow } = useProgram()
  return (
    <div>
      <p data-testid="reason">{state.priorityReason}</p>
      <p data-testid="step">{state.lastVisitedStep}</p>
      <p data-testid="health-importance">{state.areaScores.health.importance ?? ''}</p>
      <textarea
        aria-label="이유"
        value={state.priorityReason}
        onChange={(event) => dispatch({ type: 'SET_PRIORITY_REASON', reason: event.target.value })}
      />
      <button type="button" onClick={() => dispatch({ type: 'SET_LAST_VISITED', step: 'step2' })}>
        방문
      </button>
      <button
        type="button"
        onClick={() =>
          dispatch({ type: 'SET_AREA_SCORE', areaId: 'health', field: 'importance', value: 7 })
        }
      >
        점수
      </button>
      <button type="button" onClick={() => saveNow()}>
        즉시저장
      </button>
    </div>
  )
}

describe('autosave and restore', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('restores previously saved answers on a new provider mount', () => {
    const memory = createMemoryStorage()
    const prepared = createInitialState()
    prepared.priorityReason = '가족과 시간을 늘리고 싶다.'
    prepared.lastVisitedStep = 'step2'
    for (const id of LIFE_AREA_IDS) {
      prepared.areaScores[id] = { importance: 5, satisfaction: 4 }
    }
    saveProgramState(prepared, memory)

    render(
      <ProgramProvider storage={memory}>
        <Probe />
      </ProgramProvider>,
    )

    expect(screen.getByTestId('reason').textContent).toBe('가족과 시간을 늘리고 싶다.')
    expect(screen.getByTestId('step').textContent).toBe('step2')
  })

  it('writes typed input to storage and restores it after remount', async () => {
    vi.useFakeTimers()
    const memory = createMemoryStorage()

    const first = render(
      <ProgramProvider storage={memory}>
        <Probe />
      </ProgramProvider>,
    )

    fireEvent.change(first.getByLabelText('이유'), { target: { value: '다시 접속해도 남는다' } })
    fireEvent.click(first.getByText('방문'))
    fireEvent.click(first.getByText('점수'))
    await vi.advanceTimersByTimeAsync(500)
    first.unmount()

    const loaded = loadProgramState(memory)
    expect(loaded?.priorityReason).toBe('다시 접속해도 남는다')
    expect(loaded?.lastVisitedStep).toBe('step2')
    expect(loaded?.areaScores.health.importance).toBe(7)

    const second = render(
      <ProgramProvider storage={memory}>
        <Probe />
      </ProgramProvider>,
    )
    expect(second.getByTestId('reason').textContent).toBe('다시 접속해도 남는다')
    expect(second.getByTestId('health-importance').textContent).toBe('7')
  })
})
