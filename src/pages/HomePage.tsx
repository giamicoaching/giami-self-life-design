import { useState } from 'react'
import { Link } from 'react-router-dom'
import { hasSavedProgress } from '../domain/initialState.ts'
import { STEP_PATHS } from '../domain/steps.ts'
import type { ProgramState } from '../domain/types.ts'
import { canVisitStep, getFirstIncompleteStep } from '../domain/validation.ts'
import { ResetConfirmDialog } from '../components/ResetConfirmDialog.tsx'
import { useProgram } from '../state/ProgramProvider.tsx'
import { useStartOver } from '../state/useStartOver.ts'

function resumePath(state: ProgramState): string {
  if (state.lastVisitedStep !== 'home' && canVisitStep(state, state.lastVisitedStep)) {
    return STEP_PATHS[state.lastVisitedStep]
  }
  return STEP_PATHS[getFirstIncompleteStep(state)]
}

export function HomePage() {
  const { state, saveNow } = useProgram()
  const startOver = useStartOver()
  const [confirmReset, setConfirmReset] = useState(false)
  const inProgress = hasSavedProgress(state)
  const next = resumePath(state)

  return (
    <div className="app-frame home-frame">
      <main className="sheet home-sheet">
        <p className="kicker">자기주도 생애설계 프로그램</p>
        <h1 id="step-title" tabIndex={-1}>
          지아미 자기주도 생애설계
        </h1>
        <p className="lede">
          자신의 삶을 평가하고, 우선 삶의 영역을 직접 선택한 뒤, 원하는 변화와 가치를 탐색하여
          목표와 첫 행동을 스스로 세우는 프로그램입니다.
        </p>
        <ul className="principle-list">
          <li>프로그램이 우선영역·가치·목표를 대신 결정하지 않습니다.</li>
          <li>진단, 등급 판정, 정상·비정상 판단을 하지 않습니다.</li>
          <li>입력과 선택은 바로 임시저장되며, 이전 단계로 돌아가거나 다시 접속해도 유지됩니다.</li>
          <li>초기 버전은 우선영역 1개, 최종 목표 1개, 첫 행동 1개를 완주하는 구조입니다.</li>
        </ul>
        <ol className="stage-list">
          <li>삶의 영역 평가</li>
          <li>우선 삶의 영역 선택</li>
          <li>원하는 변화 탐색 및 핵심 가치 선정</li>
          <li>목표 수립</li>
          <li>구체적 행동계획 수립</li>
          <li>종합 결과</li>
        </ol>
        <div className="home-actions">
          {inProgress ? (
            <>
              <Link className="btn btn-primary" to={next} onClick={() => saveNow()}>
                이어하기
              </Link>
              <button
                type="button"
                className="btn btn-danger"
                onClick={() => setConfirmReset(true)}
              >
                새로 시작하기
              </button>
              {state.programCompleted ? (
                <Link className="btn btn-secondary" to="/summary">
                  종합 결과 보기
                </Link>
              ) : null}
            </>
          ) : (
            <Link className="btn btn-primary" to="/step/1/1">
              시작하기
            </Link>
          )}
        </div>
        <p className="muted save-note">
          작성 내용은 이 브라우저에 자동 저장됩니다. 로그인 기능이 추가되면 계정으로 이전할 수
          있습니다.
        </p>
      </main>
      <ResetConfirmDialog
        open={confirmReset}
        onCancel={() => setConfirmReset(false)}
        onConfirm={startOver}
      />
    </div>
  )
}
