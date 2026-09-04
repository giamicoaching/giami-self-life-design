import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { trackLifeDesignStarted } from '../analytics/usage.ts'
import { HomeHeroGraphic } from '../components/HomeHeroGraphic.tsx'
import { ResetConfirmDialog } from '../components/ResetConfirmDialog.tsx'
import { Button } from '../components/ui/Button.tsx'
import {
  HOME_BRAND,
  HOME_CONTINUE_LABEL,
  HOME_DURATION,
  HOME_DURATION_NOTE,
  HOME_INTRO,
  HOME_RESTART_LABEL,
  HOME_START_LABEL,
  HOME_TITLE_LINE_1,
  HOME_TITLE_LINE_2,
} from '../copy/programCopy.ts'
import { DEMOGRAPHICS_PATH } from '../domain/demographics.ts'
import { hasMeaningfulProgress } from '../domain/initialState.ts'
import { resumePath } from '../domain/navigation.ts'
import { useProgram } from '../state/ProgramProvider.tsx'
import { useStartOver } from '../state/useStartOver.ts'

export function HomePage() {
  const { state, dispatch, saveNow } = useProgram()
  const startOver = useStartOver()
  const navigate = useNavigate()
  const [confirmReset, setConfirmReset] = useState(false)
  const inProgress = hasMeaningfulProgress(state)

  const continueProgram = () => {
    const next = resumePath(state)
    if (next !== DEMOGRAPHICS_PATH) {
      trackLifeDesignStarted(state, () => dispatch({ type: 'MARK_USAGE_STARTED' }))
      saveNow({ usageStartedTracked: true })
    }
    navigate(next)
  }

  return (
    <div className="app-frame home-frame">
      <main className="sheet home-sheet">
        <div className="home-hero">
          <div className="home-hero-copy">
            <p className="kicker">{HOME_BRAND}</p>
            <h1 id="step-title" className="home-title" tabIndex={-1}>
              {HOME_TITLE_LINE_1}
              <br />
              {HOME_TITLE_LINE_2}
            </h1>
            <p className="lede">{HOME_INTRO}</p>
          </div>
          <div className="home-hero-visual">
            <HomeHeroGraphic />
          </div>
          <div className="home-duration">
            <p className="home-duration-time">{HOME_DURATION}</p>
            <p className="home-duration-note">{HOME_DURATION_NOTE}</p>
          </div>
          <div className="home-actions">
            {inProgress ? (
              <>
                <Button onClick={continueProgram}>{HOME_CONTINUE_LABEL}</Button>
                <Button variant="danger" onClick={() => setConfirmReset(true)}>
                  {HOME_RESTART_LABEL}
                </Button>
              </>
            ) : (
              <Button onClick={() => navigate(DEMOGRAPHICS_PATH)}>{HOME_START_LABEL}</Button>
            )}
          </div>
        </div>
      </main>
      <ResetConfirmDialog
        open={confirmReset}
        onCancel={() => setConfirmReset(false)}
        onConfirm={startOver}
      />
    </div>
  )
}
