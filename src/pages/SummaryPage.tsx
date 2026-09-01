import { useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChangeIndexList, LifeWheel, WheelPrintBlock } from '../components/LifeWheel.tsx'
import { StepGuard } from '../components/StepGuard.tsx'
import { StepHeading } from '../components/layout/ProgramShell.tsx'
import { Button } from '../components/ui/Button.tsx'
import { CompleteBanner } from '../components/ui/Feedback.tsx'
import { composeActionSentence, composeCopingPlanNatural } from '../domain/actionSentence.ts'
import { getLifeArea } from '../domain/lifeAreas.ts'
import { SELF_CHECK_ITEMS, selfCheckAnswerLabel } from '../domain/selfChecks.ts'
import { getCoreValue, HELP_RESOURCES } from '../domain/values.ts'
import { isNoOrUnknownObstacle } from '../domain/validation.ts'
import { ResetConfirmDialog } from '../components/ResetConfirmDialog.tsx'
import { useProgram } from '../state/ProgramProvider.tsx'
import { useSaveResult } from '../state/SaveToast.tsx'
import { useStartOver } from '../state/useStartOver.ts'

export function SummaryPage() {
  return (
    <StepGuard stepId="summary">
      <SummaryBody />
    </StepGuard>
  )
}

function SummaryBody() {
  const { state, saveNow, dispatch } = useProgram()
  const saveResult = useSaveResult()
  const startOver = useStartOver()
  const navigate = useNavigate()
  const [completed, setCompleted] = useState(state.programCompleted)
  const [confirmReset, setConfirmReset] = useState(false)
  const completeRef = useRef<HTMLElement>(null)

  const areaName = state.priorityAreaId ? getLifeArea(state.priorityAreaId).name : ''
  const plan = useMemo(
    () =>
      composeActionSentence({
        what: state.actionWhat,
        when: state.actionWhen,
        where: state.actionWhere,
        actionType: state.actionType,
        frequencyOrDuration: state.actionFrequencyOrDuration,
      }),
    [
      state.actionWhat,
      state.actionWhen,
      state.actionWhere,
      state.actionType,
      state.actionFrequencyOrDuration,
    ],
  )
  const coping = useMemo(() => {
    if (isNoOrUnknownObstacle(state.obstacle)) {
      const alt = state.alternativeAction.trim() || '해당 없음'
      return `장애물은 ‘${state.obstacle.trim()}’이며, 대안행동은 ‘${alt}’입니다.`
    }
    return composeCopingPlanNatural(state.obstacle, state.alternativeAction)
  }, [state.obstacle, state.alternativeAction])

  const helpLabels = HELP_RESOURCES.filter((item) => state.helpResources.includes(item.id)).map(
    (item) => item.label,
  )

  const handleComplete = () => {
    dispatch({ type: 'MARK_COMPLETED' })
    saveNow({ programCompleted: true })
    setCompleted(true)
    window.requestAnimationFrame(() => {
      completeRef.current?.focus()
    })
  }

  return (
    <>
      <div className="print-only print-banner">
        <h1>지아미 자기주도 생애설계 종합 결과</h1>
        <p>{new Date(state.updatedAt).toLocaleString('ko-KR')}</p>
      </div>
      <StepHeading kicker="종합 결과" title="나의 생애설계">
        <p>작성한 내용을 한곳에서 확인합니다. 이전 단계로 돌아가 수정할 수 있습니다.</p>
      </StepHeading>
      <CompleteBanner visible={completed} bannerRef={completeRef} />

      <WheelPrintBlock
        title="삶의 수레바퀴"
        description={
          <p>
            만족도는 연한 색의 채워진 면과 실선, 중요도는 다른 색의 점선입니다. 각 축에 영역명과
            점수가 있습니다.
          </p>
        }
      >
        <LifeWheel state={state} titleId="summary-wheel-title" />
      </WheelPrintBlock>
      <ChangeIndexList state={state} />

      <section className="result-block">
        <h2>우선 삶의 영역과 선택 이유</h2>
        <p>
          <strong>{areaName}</strong>
        </p>
        <p className="preserve">{state.priorityReason}</p>
      </section>

      <section className="result-block">
        <h2>처음 작성한 원하는 변화</h2>
        <p className="preserve">{state.changeIdeas.trim() || '미작성'}</p>
      </section>

      <section className="result-block">
        <h2>가치 후보와 핵심 가치</h2>
        <p>
          가치 후보 5개:{' '}
          {state.candidateValueIds.map((id) => getCoreValue(id).name).join(', ') || '미선택'}
        </p>
        <p>
          핵심 가치:{' '}
          {state.coreValueIds.map((id) => `${getCoreValue(id).name} (${getCoreValue(id).definition})`).join(' / ')}
        </p>
        <p>
          목표에 반영한 가치:{' '}
          {state.goalValueIds.map((id) => getCoreValue(id).name).join(', ')}
        </p>
      </section>

      <section className="result-block">
        <h2>가치가 반영된 원하는 변화</h2>
        <p className="preserve">{state.refinedChange}</p>
      </section>

      <section className="result-block">
        <h2>최종 목표</h2>
        <p className="preserve">{state.goal}</p>
        <ul className="plain-list">
          <li>목표 기간: {state.goalPeriod.trim() || '미작성'}</li>
          <li>확인 기준: {state.goalCriteria.trim() || '미작성'}</li>
          <li>목표 실현 가능성: {state.goalFeasibility} / 7</li>
        </ul>
      </section>

      <section className="result-block">
        <h2>자기점검</h2>
        <ul className="plain-list">
          {SELF_CHECK_ITEMS.map((item) => (
            <li key={item.key}>
              {item.label}: {selfCheckAnswerLabel(state.selfChecks[item.key])}
            </li>
          ))}
        </ul>
      </section>

      <section className="result-block">
        <h2>할 수 있는 행동과 우선 실행행동</h2>
        <ul className="plain-list">
          {state.actions.map((text, index) => {
            const filled = text.trim()
            if (!filled) return null
            const isPrimary = state.primaryActionIndex === index
            return (
              <li key={index}>
                행동 {index + 1}
                {isPrimary ? ' (우선 실행행동)' : ''}: {filled}
              </li>
            )
          })}
        </ul>
      </section>

      <section className="result-block">
        <h2>첫 행동</h2>
        <ul className="plain-list">
          <li>첫 행동: {state.actionWhat}</li>
          <li>행동유형: {state.actionType === 'once' ? '한 번 완료하는 행동' : '일정 기간 반복하는 행동'}</li>
          <li>시간: {state.actionWhen}</li>
          <li>장소: {state.actionWhere}</li>
          <li>
            {state.actionType === 'repeat' ? '빈도' : '소요시간'}:{' '}
            {state.actionFrequencyOrDuration.trim() || '미작성'}
          </li>
        </ul>
        {plan ? <p className="plan-line">{plan}</p> : null}
      </section>

      <section className="result-block">
        <h2>장애물과 대안행동</h2>
        <p>장애물: {state.obstacle}</p>
        <p>대안행동: {state.alternativeAction.trim() || '해당 없음'}</p>
        {coping ? <p className="plan-line">{coping}</p> : null}
      </section>

      <section className="result-block">
        <h2>도움·자원, 실행 가능성, 자기격려</h2>
        <p>도움·자원: {helpLabels.length ? helpLabels.join(', ') : '선택 없음'}</p>
        {state.helpNote.trim() ? <p className="preserve">{state.helpNote}</p> : null}
        <p>첫 행동 실행 가능성: {state.firstActionFeasibility} / 7</p>
        <p className="preserve">자기격려: {state.selfEncouragement.trim() || '미작성'}</p>
      </section>

      <div className="action-row no-print">
        <Button variant="secondary" onClick={() => navigate('/step/5')}>
          내용 수정하기
        </Button>
        <Button variant="secondary" onClick={saveResult}>
          결과 저장
        </Button>
        <Button variant="secondary" onClick={() => window.print()}>
          PDF 저장 또는 인쇄
        </Button>
        <Button variant="danger" onClick={() => setConfirmReset(true)}>
          처음부터 다시 하기
        </Button>
        <Button onClick={handleComplete}>생애설계 완료</Button>
      </div>

      <ResetConfirmDialog
        open={confirmReset}
        onCancel={() => setConfirmReset(false)}
        onConfirm={startOver}
      />
    </>
  )
}
