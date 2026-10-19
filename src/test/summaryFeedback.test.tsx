import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  FEEDBACK_COMMENT_LABEL,
  FEEDBACK_ERROR,
  FEEDBACK_HELPFULNESS_LABEL,
  FEEDBACK_STAGE_LABEL,
  FEEDBACK_STAGES,
  FEEDBACK_SUBMIT_LABEL,
  FEEDBACK_SUCCESS,
  FEEDBACK_TITLE,
  OPTIONAL_FIELD_MARK,
} from '../copy/programCopy.ts'
import { SummaryPage } from '../pages/SummaryPage.tsx'
import { ProgramProvider } from '../state/ProgramProvider.tsx'
import { SaveToastProvider, SAVE_TOAST_MESSAGE } from '../state/SaveToast.tsx'
import { getSupabaseClient } from '../supabase/client.ts'
import { loadProgramState, saveProgramState } from '../storage/storage.ts'
import { createMemoryStorage } from '../storage/memoryStorage.ts'
import { createReadySummaryState } from './fixtures.ts'

const rpcMock = vi.fn()
const getSupabaseClientMock = vi.mocked(getSupabaseClient)

function mockRpc(result: unknown = { data: 'updated', error: null }) {
  rpcMock.mockReset()
  if (result instanceof Error) {
    rpcMock.mockRejectedValue(result)
  } else if (typeof result === 'function') {
    rpcMock.mockImplementation(result as never)
  } else {
    rpcMock.mockResolvedValue(result)
  }
  getSupabaseClientMock.mockReturnValue({ rpc: rpcMock } as never)
}

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

describe('summary anonymous feedback', () => {
  beforeEach(() => {
    mockRpc()
  })

  afterEach(() => {
    getSupabaseClientMock.mockReturnValue(null)
  })

  it('keeps submit disabled until at least one answer is given', () => {
    renderSummary()
    const submit = screen.getByRole('button', { name: FEEDBACK_SUBMIT_LABEL })
    expect(submit).toBeDisabled()
    fireEvent.click(screen.getByRole('radio', { name: /4점/ }))
    expect(submit).toBeEnabled()
  })

  it('submits a score and stage without the written comment', async () => {
    renderSummary()
    fireEvent.click(screen.getByRole('radio', { name: /5점/ }))
    fireEvent.change(screen.getByLabelText(new RegExp(FEEDBACK_COMMENT_LABEL)), {
      target: { value: '이름은 홍길동입니다.' },
    })
    fireEvent.click(screen.getByRole('button', { name: FEEDBACK_SUBMIT_LABEL }))
    await waitFor(() => expect(rpcMock).toHaveBeenCalledTimes(1))
    expect(rpcMock.mock.calls[0]?.[0]).toBe('submit_self_life_design_feedback')
    expect(rpcMock.mock.calls[0]?.[1]).toEqual({
      p_run_id: expect.any(String),
      p_helpfulness: 5,
      p_helpful_stage: null,
    })
    expect(JSON.stringify(rpcMock.mock.calls[0]?.[1])).not.toContain('홍길동')
    expect(rpcMock.mock.calls[0]?.[1]).not.toHaveProperty('comment')
    expect(rpcMock.mock.calls[0]?.[1]).not.toHaveProperty('p_comment')
    expect(screen.getByText(FEEDBACK_SUCCESS)).toBeInTheDocument()
    expect(screen.getByText(FEEDBACK_SUCCESS).closest('[aria-live="polite"]')).toBeTruthy()
  })

  it('submits without a score when a stage or comment is present', async () => {
    renderSummary()
    fireEvent.click(screen.getByRole('radio', { name: FEEDBACK_STAGES[0] }))
    fireEvent.click(screen.getByRole('button', { name: FEEDBACK_SUBMIT_LABEL }))
    await waitFor(() => expect(rpcMock).toHaveBeenCalledTimes(1))
    expect(rpcMock.mock.calls[0]?.[1]).toEqual({
      p_run_id: expect.any(String),
      p_helpfulness: null,
      p_helpful_stage: FEEDBACK_STAGES[0],
    })
    expect(rpcMock.mock.calls[0]?.[1]).not.toHaveProperty('p_comment')
  })

  it('does not enable submit for a blank or whitespace-only form', () => {
    renderSummary()
    const submit = screen.getByRole('button', { name: FEEDBACK_SUBMIT_LABEL })
    const input = screen.getByLabelText(new RegExp(FEEDBACK_COMMENT_LABEL))
    fireEvent.change(input, { target: { value: '   ' } })
    expect(submit).toBeDisabled()
  })

  it('does not let the comment exceed 300 characters and has no placeholder', () => {
    renderSummary()
    const input = screen.getByLabelText(new RegExp(FEEDBACK_COMMENT_LABEL))
    expect(input).not.toHaveAttribute('placeholder')
    fireEvent.change(input, { target: { value: '가'.repeat(301) } })
    expect(input).toHaveValue('가'.repeat(300))
    expect(screen.getByText('300 / 300')).toBeInTheDocument()
  })

  it('prevents a second click while the first request is in flight', async () => {
    let finish: ((value: { data: string; error: null }) => void) | undefined
    mockRpc(() => new Promise((resolve) => {
      finish = resolve
    }))
    renderSummary()
    fireEvent.click(screen.getByRole('radio', { name: /3점/ }))
    const submit = screen.getByRole('button', { name: FEEDBACK_SUBMIT_LABEL })
    fireEvent.click(submit)
    await waitFor(() => expect(submit).toBeDisabled())
    fireEvent.click(submit)
    expect(rpcMock).toHaveBeenCalledTimes(1)
    finish?.({ data: 'updated', error: null })
    await waitFor(() => expect(screen.getByText(FEEDBACK_SUCCESS)).toBeInTheDocument())
  })

  it('keeps the submitted state for the same run_id after reload', async () => {
    const storage = renderSummary()
    fireEvent.click(screen.getByRole('radio', { name: /2점/ }))
    fireEvent.click(screen.getByRole('button', { name: FEEDBACK_SUBMIT_LABEL }))
    await waitFor(() => expect(screen.getByText(FEEDBACK_SUCCESS)).toBeInTheDocument())
    expect(loadProgramState(storage)?.feedbackSubmitted).toBe(true)

    cleanup()
    render(
      <MemoryRouter initialEntries={['/summary']}>
        <ProgramProvider storage={storage}>
          <SaveToastProvider>
            <SummaryPage />
          </SaveToastProvider>
        </ProgramProvider>
      </MemoryRouter>,
    )
    expect(screen.getByText(FEEDBACK_SUCCESS)).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: FEEDBACK_SUBMIT_LABEL })).not.toBeInTheDocument()
  })

  it('treats a unique constraint as already submitted', async () => {
    mockRpc({ data: null, error: { code: '23505', message: 'duplicate key' } })
    const storage = renderSummary()
    fireEvent.click(screen.getByRole('radio', { name: /1점/ }))
    fireEvent.click(screen.getByRole('button', { name: FEEDBACK_SUBMIT_LABEL }))
    await waitFor(() => expect(screen.getByText(FEEDBACK_SUCCESS)).toBeInTheDocument())
    expect(loadProgramState(storage)?.feedbackSubmitted).toBe(true)
  })

  it('does not change save or complete when feedback insert fails', async () => {
    mockRpc({ data: null, error: { message: 'network' } })
    const storage = renderSummary()
    fireEvent.click(screen.getByRole('radio', { name: /4점/ }))
    fireEvent.click(screen.getByRole('button', { name: FEEDBACK_SUBMIT_LABEL }))
    await waitFor(() => expect(screen.getByText(FEEDBACK_ERROR)).toBeInTheDocument())
    expect(screen.getByText(FEEDBACK_ERROR).closest('[aria-live="assertive"]')).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: '결과 저장' }))
    expect(screen.getByText(SAVE_TOAST_MESSAGE)).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: '생애설계 완료' }))
    expect(screen.getByText('자기주도 생애설계를 완료했습니다.')).toBeInTheDocument()
    expect(loadProgramState(storage)?.programCompleted).toBe(true)
    expect(loadProgramState(storage)?.feedbackSubmitted).toBe(false)
  })

  it('hides the feedback form from print output and marks questions as optional', () => {
    renderSummary()
    expect(screen.getByRole('heading', { name: FEEDBACK_TITLE }).closest('.no-print')).toBeTruthy()
    expect(screen.getByText(FEEDBACK_HELPFULNESS_LABEL).closest('legend')).toHaveTextContent(
      OPTIONAL_FIELD_MARK,
    )
    expect(screen.getByText(FEEDBACK_STAGE_LABEL).closest('legend')).toHaveTextContent(
      OPTIONAL_FIELD_MARK,
    )
    expect(screen.getByText(FEEDBACK_COMMENT_LABEL).closest('label')).toHaveTextContent(
      OPTIONAL_FIELD_MARK,
    )
    expect(screen.queryByPlaceholderText(/예:/)).not.toBeInTheDocument()
  })
})
