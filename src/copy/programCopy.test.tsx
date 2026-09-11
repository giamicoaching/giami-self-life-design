import { render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { HomePage } from '../pages/HomePage.tsx'
import { Step1ResultPage } from '../pages/Step1ResultPage.tsx'
import { SummaryPage } from '../pages/SummaryPage.tsx'
import { ProgramProvider } from '../state/ProgramProvider.tsx'
import { SaveToastProvider } from '../state/SaveToast.tsx'
import { saveProgramState } from '../storage/storage.ts'
import { createMemoryStorage } from '../storage/memoryStorage.ts'
import { createReadySummaryState } from '../test/fixtures.ts'
import {
  CHANGE_INDEX_EXPLANATION,
  CHANGE_INDEX_FORMULA,
  COACHING_CENTER_BODY,
  COACHING_CENTER_CTA,
  COACHING_CENTER_TITLE,
  HOME_DURATION,
  HOME_DURATION_NOTE,
  HOME_INTRO,
  HOME_REQUIRED_NOTE,
  HOME_START_LABEL,
  WHEEL_RESULT_NOTICE,
} from './programCopy.ts'

function renderWithState(path: string, page: ReactNode) {
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
}

describe('program copy', () => {
  it('introduces the app as a self-directed life design program', () => {
    render(
      <MemoryRouter>
        <ProgramProvider storage={createMemoryStorage()}>
          <HomePage />
        </ProgramProvider>
      </MemoryRouter>,
    )
    expect(screen.getByText(HOME_INTRO)).toBeInTheDocument()
    expect(screen.getByText(HOME_DURATION)).toBeInTheDocument()
    expect(screen.getByText(HOME_DURATION_NOTE)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: HOME_START_LABEL })).toBeInTheDocument()
    expect(screen.getByText(HOME_REQUIRED_NOTE)).toBeInTheDocument()
    expect(screen.queryByText(/심리검사|타당화|신뢰도|정상·비정상|위험군/)).not.toBeInTheDocument()
    expect(screen.queryByText(/최경화|KWS/)).not.toBeInTheDocument()
  })

  it('shows the reference notice once under the life wheel title', () => {
    renderWithState('/step/1/result', <Step1ResultPage />)
    expect(screen.getAllByText(WHEEL_RESULT_NOTICE)).toHaveLength(1)
    expect(screen.getByText(CHANGE_INDEX_EXPLANATION)).toBeInTheDocument()
    expect(screen.getByText(CHANGE_INDEX_FORMULA)).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: '나의 삶의 수레바퀴' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: '변화검토지수' })).toBeInTheDocument()
  })

  it('shows the same reference notice once on the summary', () => {
    renderWithState('/summary', <SummaryPage />)
    expect(screen.getAllByText(WHEEL_RESULT_NOTICE)).toHaveLength(1)
    expect(screen.getByText(CHANGE_INDEX_EXPLANATION)).toBeInTheDocument()
  })

  it('shows the coaching center invite on the summary', () => {
    renderWithState('/summary', <SummaryPage />)
    expect(screen.getByRole('heading', { name: COACHING_CENTER_TITLE })).toBeInTheDocument()
    expect(screen.getByText(COACHING_CENTER_BODY)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: COACHING_CENTER_CTA })).toBeInTheDocument()
  })
})
