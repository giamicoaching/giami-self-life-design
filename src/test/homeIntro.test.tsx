import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { DemographicsPage } from '../pages/DemographicsPage.tsx'
import { HomePage } from '../pages/HomePage.tsx'
import { Step1AreasPage } from '../pages/Step1AreasPage.tsx'
import { SummaryPage } from '../pages/SummaryPage.tsx'
import { ProgramProvider } from '../state/ProgramProvider.tsx'
import { SaveToastProvider } from '../state/SaveToast.tsx'
import { RESET_CONFIRM_DESCRIPTION } from '../state/useStartOver.ts'
import { createInitialState } from '../domain/initialState.ts'
import { saveProgramState } from '../storage/storage.ts'
import { createMemoryStorage } from '../storage/memoryStorage.ts'
import { createReadySummaryState } from './fixtures.ts'
import {
  HOME_BRAND,
  HOME_CONTINUE_LABEL,
  HOME_DURATION,
  HOME_DURATION_NOTE,
  HOME_HERO_LABEL,
  HOME_INTRO,
  HOME_REQUIRED_NOTE,
  HOME_RESTART_LABEL,
  HOME_START_LABEL,
} from '../copy/programCopy.ts'
import { DEMOGRAPHICS_NEXT_LABEL, DEMOGRAPHICS_NOTICE } from '../domain/demographics.ts'

function renderFlow(path = '/', storage = createMemoryStorage()) {
  render(
    <MemoryRouter initialEntries={[path]}>
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

describe('intro home and demographics screens', () => {
  it('shows a short intro, hero graphic, and only the start button when nothing is saved', () => {
    renderFlow()
    expect(screen.getByText(HOME_BRAND)).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: /내 삶을 돌아보고,\s*원하는 변화를 시작해 보세요/ }),
    ).toBeInTheDocument()
    expect(screen.getByText(HOME_INTRO)).toBeInTheDocument()
    expect(screen.getByText(HOME_DURATION)).toBeInTheDocument()
    expect(screen.getByText(HOME_DURATION_NOTE)).toBeInTheDocument()
    expect(screen.getByRole('img', { name: HOME_HERO_LABEL })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: HOME_START_LABEL })).toBeInTheDocument()
    expect(screen.getByText(HOME_REQUIRED_NOTE)).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: HOME_CONTINUE_LABEL })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: HOME_RESTART_LABEL })).not.toBeInTheDocument()
    expect(screen.queryByText(DEMOGRAPHICS_NOTICE)).not.toBeInTheDocument()
    expect(screen.queryByText(/초기 버전은/)).not.toBeInTheDocument()
    expect(screen.queryByText(/로그인 기능이 추가되면/)).not.toBeInTheDocument()
    expect(screen.queryByLabelText('만 나이')).not.toBeInTheDocument()
  })

  it('opens the basic-info screen instead of the life-area evaluation', () => {
    renderFlow()
    fireEvent.click(screen.getByRole('button', { name: HOME_START_LABEL }))
    expect(screen.getByRole('heading', { name: '이용정보 안내' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: '기본정보' })).toBeInTheDocument()
    expect(screen.getByText(DEMOGRAPHICS_NOTICE)).toBeInTheDocument()
    expect(screen.getByLabelText('만 나이')).toBeInTheDocument()
    expect(screen.getByRole('checkbox', { name: '응답하지 않음' })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: '남성' })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: '여성' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: DEMOGRAPHICS_NEXT_LABEL })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: '삶의 영역 평가' })).not.toBeInTheDocument()
  })

  it('keeps the user on basic info until age and gender are answered', () => {
    renderFlow('/info')
    fireEvent.click(screen.getByRole('button', { name: DEMOGRAPHICS_NEXT_LABEL }))
    expect(screen.getByText('만 나이를 입력하거나 ‘응답하지 않음’을 선택해 주세요.')).toBeInTheDocument()
    expect(screen.getByText('성별 항목 중 하나를 선택해 주세요.')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: '이용정보 안내' })).toBeInTheDocument()
  })

  it('enters the life-area evaluation after valid basic info', () => {
    renderFlow('/info')
    fireEvent.change(screen.getByLabelText('만 나이'), { target: { value: '67' } })
    fireEvent.click(screen.getByRole('radio', { name: '여성' }))
    fireEvent.click(screen.getByRole('button', { name: DEMOGRAPHICS_NEXT_LABEL }))
    expect(screen.getByRole('heading', { name: '삶의 영역 평가' })).toBeInTheDocument()
  })

  it('shows continue and start-over when saved progress exists, and continue restores the last step', () => {
    const storage = createMemoryStorage()
    saveProgramState(createReadySummaryState(), storage)
    renderFlow('/', storage)
    expect(screen.queryByRole('button', { name: HOME_START_LABEL })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: HOME_CONTINUE_LABEL })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: HOME_RESTART_LABEL })).toBeInTheDocument()
    expect(screen.getByText(HOME_REQUIRED_NOTE)).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: HOME_CONTINUE_LABEL }))
    expect(screen.getByRole('heading', { name: '나의 생애설계' })).toBeInTheDocument()
  })

  it('shows only the start button when localStorage is empty', () => {
    renderFlow('/', createMemoryStorage())
    expect(screen.getByRole('button', { name: HOME_START_LABEL })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: HOME_CONTINUE_LABEL })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: HOME_RESTART_LABEL })).not.toBeInTheDocument()
  })

  it('shows only the start button when empty initial state is stored', () => {
    const storage = createMemoryStorage()
    saveProgramState(createInitialState(), storage)
    renderFlow('/', storage)
    expect(screen.getByRole('button', { name: HOME_START_LABEL })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: HOME_CONTINUE_LABEL })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: HOME_RESTART_LABEL })).not.toBeInTheDocument()
  })

  it('shows continue and start-over when at least one real answer exists', () => {
    const storage = createMemoryStorage()
    const state = createInitialState()
    state.areaScores.health.importance = 5
    saveProgramState(state, storage)
    renderFlow('/', storage)
    expect(screen.queryByRole('button', { name: HOME_START_LABEL })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: HOME_CONTINUE_LABEL })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: HOME_RESTART_LABEL })).toBeInTheDocument()
  })

  it('does not show the delete confirm dialog on first start', () => {
    renderFlow()
    fireEvent.click(screen.getByRole('button', { name: HOME_START_LABEL }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(screen.queryByText(RESET_CONFIRM_DESCRIPTION)).not.toBeInTheDocument()
    expect(screen.getByRole('heading', { name: '이용정보 안내' })).toBeInTheDocument()
  })

  it('asks for confirmation only when restarting with real progress', () => {
    const storage = createMemoryStorage()
    saveProgramState(createReadySummaryState(), storage)
    renderFlow('/', storage)
    fireEvent.click(screen.getByRole('button', { name: HOME_RESTART_LABEL }))
    expect(screen.getByRole('dialog')).toHaveTextContent(RESET_CONFIRM_DESCRIPTION)
  })
})
