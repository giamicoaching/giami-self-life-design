import { fireEvent, render, screen, within } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { track } from '@vercel/analytics'
import { resetUsageEventLocks } from '../analytics/usage.ts'
import {
  DEMOGRAPHICS_NOTICE,
  DEMOGRAPHICS_NEXT_LABEL,
  USAGE_INFO_TITLE,
} from '../domain/demographics.ts'
import { HOME_START_LABEL } from '../copy/programCopy.ts'
import { HomePage } from '../pages/HomePage.tsx'
import { DemographicsPage } from '../pages/DemographicsPage.tsx'
import { Step1AreasPage } from '../pages/Step1AreasPage.tsx'
import { SummaryPage } from '../pages/SummaryPage.tsx'
import { ProgramProvider } from '../state/ProgramProvider.tsx'
import { SaveToastProvider } from '../state/SaveToast.tsx'
import { loadProgramState, saveProgramState } from '../storage/storage.ts'
import { createMemoryStorage } from '../storage/memoryStorage.ts'
import { createReadySummaryState } from './fixtures.ts'

const trackMock = vi.mocked(track)

function renderHome(storage = createMemoryStorage()) {
  render(
    <MemoryRouter initialEntries={['/']}>
      <ProgramProvider storage={storage}>
        <SaveToastProvider>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/info" element={<DemographicsPage />} />
            <Route path="/step/1/:screen" element={<Step1AreasPage />} />
            <Route path="/summary" element={<SummaryPage />} />
          </Routes>
        </SaveToastProvider>
      </ProgramProvider>
    </MemoryRouter>,
  )
  return storage
}

function openDemographics() {
  fireEvent.click(screen.getByRole('button', { name: HOME_START_LABEL }))
}

function fillValidDemographics() {
  fireEvent.change(screen.getByLabelText('만 나이'), { target: { value: '67' } })
  fireEvent.click(screen.getByRole('radio', { name: '여성' }))
}

function startProgram() {
  openDemographics()
  fillValidDemographics()
  fireEvent.click(screen.getByRole('button', { name: DEMOGRAPHICS_NEXT_LABEL }))
}

describe('home demographics and usage events', () => {
  afterEach(() => {
    resetUsageEventLocks()
    trackMock.mockClear()
  })

  it('shows the confirmed notice and not 기타', () => {
    renderHome()
    openDemographics()
    expect(screen.getByRole('heading', { name: USAGE_INFO_TITLE })).toBeInTheDocument()
    expect(screen.getAllByText(DEMOGRAPHICS_NOTICE)).toHaveLength(1)
    expect(screen.queryByRole('heading', { name: '통계로 전송되는 정보' })).not.toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: '전송되지 않는 정보' })).not.toBeInTheDocument()
    expect(screen.queryByText('life_design_started')).not.toBeInTheDocument()
    expect(screen.queryByText('life_design_completed')).not.toBeInTheDocument()
    expect(screen.queryByText('result_saved')).not.toBeInTheDocument()
    expect(screen.queryByText('age_group')).not.toBeInTheDocument()
    expect(screen.queryByText('Vercel')).not.toBeInTheDocument()
    expect(screen.getByRole('radio', { name: '남성' })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: '여성' })).toBeInTheDocument()
    expect(screen.getAllByLabelText('응답하지 않음').length).toBeGreaterThanOrEqual(1)
    expect(screen.queryByRole('radio', { name: '기타' })).not.toBeInTheDocument()
  })

  it('disables the age field when 응답하지 않음 is selected', () => {
    renderHome()
    openDemographics()
    const ageInput = screen.getByLabelText('만 나이')
    fireEvent.change(ageInput, { target: { value: '67' } })
    fireEvent.click(screen.getByRole('checkbox', { name: '응답하지 않음' }))
    expect(ageInput).toBeDisabled()
    expect(ageInput).toHaveValue('')
  })

  it('blocks start when age or gender is missing, and when age is out of range', () => {
    renderHome()
    openDemographics()
    fireEvent.click(screen.getByRole('button', { name: DEMOGRAPHICS_NEXT_LABEL }))
    expect(screen.getByText('만 나이를 입력하거나 ‘응답하지 않음’을 선택해 주세요.')).toBeInTheDocument()
    expect(screen.getByText('성별 항목 중 하나를 선택해 주세요.')).toBeInTheDocument()

    fireEvent.change(screen.getByLabelText('만 나이'), { target: { value: '17' } })
    fireEvent.click(screen.getByRole('radio', { name: '남성' }))
    fireEvent.click(screen.getByRole('button', { name: DEMOGRAPHICS_NEXT_LABEL }))
    expect(screen.getByText('만 나이는 18세 이상 100세 이하의 숫자로 입력해 주세요.')).toBeInTheDocument()
    expect(trackMock).not.toHaveBeenCalled()
  })

  it('sends started with only age_group and gender, never exact age or answers', () => {
    const storage = renderHome()
    startProgram()
    expect(trackMock).toHaveBeenCalledTimes(1)
    expect(trackMock).toHaveBeenCalledWith('life_design_started', {
      age_group: '65-69',
      gender: 'female',
    })
    const payload = trackMock.mock.calls[0]?.[1] as Record<string, unknown>
    expect(Object.keys(payload).sort()).toEqual(['age_group', 'gender'])
    expect(JSON.stringify(payload)).not.toContain('67')
    expect(JSON.stringify(payload)).not.toContain('건강')
    expect(loadProgramState(storage)?.ageYears).toBe(67)
  })

  it('does not send started twice in the same run', () => {
    renderHome()
    startProgram()
    const importance = screen.getByRole('radiogroup', { name: '자아·성장 중요도' })
    fireEvent.click(within(importance).getByRole('radio', { name: '5' }))
    expect(trackMock.mock.calls.filter((call) => call[0] === 'life_design_started')).toHaveLength(1)
  })
})

describe('completed and saved usage events', () => {
  afterEach(() => {
    resetUsageEventLocks()
    trackMock.mockClear()
  })

  it('sends completed once with only age_group and gender', () => {
    const storage = createMemoryStorage()
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
    fireEvent.click(screen.getByRole('button', { name: '생애설계 완료' }))
    fireEvent.click(screen.getByRole('button', { name: '생애설계 완료' }))
    const completed = trackMock.mock.calls.filter((call) => call[0] === 'life_design_completed')
    expect(completed).toHaveLength(1)
    expect(completed[0]?.[1]).toEqual({ age_group: '65-69', gender: 'female' })
    expect(JSON.stringify(completed[0]?.[1])).not.toContain('주 3회')
  })

  it('sends result_saved with only screen', () => {
    const storage = createMemoryStorage()
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
    fireEvent.click(screen.getByRole('button', { name: '결과 저장' }))
    const saved = trackMock.mock.calls.filter((call) => call[0] === 'result_saved')
    expect(saved).toHaveLength(1)
    expect(saved[0]?.[1]).toEqual({ screen: 'summary' })
    expect(Object.keys(saved[0]?.[1] as object)).toEqual(['screen'])
  })
})
