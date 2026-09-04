import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { HomePage } from '../pages/HomePage.tsx'
import { SummaryPage } from '../pages/SummaryPage.tsx'
import { ProgramProvider } from '../state/ProgramProvider.tsx'
import { SaveToastProvider } from '../state/SaveToast.tsx'
import { saveProgramState } from '../storage/storage.ts'
import { createMemoryStorage } from '../storage/memoryStorage.ts'
import { createReadySummaryState } from './fixtures.ts'
import {
  COACHING_CENTER_URL,
  COPYRIGHT_CLOSE_LABEL,
  COPYRIGHT_LINE,
  COPYRIGHT_NOTICE_LINK,
  COPYRIGHT_NOTICE_PARAGRAPHS,
  COPYRIGHT_NOTICE_TITLE,
  COPYRIGHT_PRINT_LINE,
} from '../copy/programCopy.ts'

function renderHome() {
  render(
    <MemoryRouter>
      <ProgramProvider storage={createMemoryStorage()}>
        <HomePage />
      </ProgramProvider>
    </MemoryRouter>,
  )
}

describe('copyright notice', () => {
  it('shows a quiet footer on the intro screen', () => {
    renderHome()
    expect(screen.getByText(COPYRIGHT_LINE)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: COPYRIGHT_NOTICE_LINK })).toBeInTheDocument()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('opens the notice, keeps the center link safe, and closes from the button or backdrop', () => {
    renderHome()
    fireEvent.click(screen.getByRole('button', { name: COPYRIGHT_NOTICE_LINK }))
    const dialog = screen.getByRole('dialog')
    expect(dialog).toHaveAccessibleName(COPYRIGHT_NOTICE_TITLE)
    for (const paragraph of COPYRIGHT_NOTICE_PARAGRAPHS) {
      expect(dialog).toHaveTextContent(paragraph)
    }
    expect(dialog).not.toHaveTextContent(/최경화|KWS|2021/)
    const centerLink = screen.getByRole('link', { name: COACHING_CENTER_URL })
    expect(centerLink).toHaveAttribute('href', COACHING_CENTER_URL)
    expect(centerLink).toHaveAttribute('target', '_blank')
    expect(centerLink).toHaveAttribute('rel', 'noopener noreferrer')

    fireEvent.click(screen.getByRole('button', { name: COPYRIGHT_CLOSE_LABEL }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: COPYRIGHT_NOTICE_LINK }))
    fireEvent.click(screen.getByRole('dialog'))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('closes with Escape', () => {
    renderHome()
    fireEvent.click(screen.getByRole('button', { name: COPYRIGHT_NOTICE_LINK }))
    fireEvent(screen.getByRole('dialog'), new Event('cancel', { bubbles: true, cancelable: true }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('includes the print credit on the summary', () => {
    const storage = createMemoryStorage()
    const prepared = createReadySummaryState()
    prepared.lastVisitedStep = 'summary'
    saveProgramState(prepared, storage)
    render(
      <MemoryRouter initialEntries={['/summary']}>
        <ProgramProvider storage={storage}>
          <SaveToastProvider>
            <SummaryPage />
          </SaveToastProvider>
        </ProgramProvider>
      </MemoryRouter>,
    )
    expect(screen.getByText(COPYRIGHT_PRINT_LINE)).toBeInTheDocument()
    expect(screen.getByText(COPYRIGHT_PRINT_LINE).className).toContain('print-only')
  })
})
