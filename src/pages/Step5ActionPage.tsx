import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { StepGuard } from '../components/StepGuard.tsx'
import { StepHeading, StepNav } from '../components/layout/ProgramShell.tsx'
import { TextArea, TextField } from '../components/ui/Field.tsx'
import { Scale } from '../components/ui/Scale.tsx'
import { MissingResponseAlert } from '../components/validation/MissingResponseAlert.tsx'
import { QuestionBlock } from '../components/validation/QuestionBlock.tsx'
import { useMissingResponses } from '../components/validation/useMissingResponses.ts'
import { composeActionSentence, composeCopingPlanNatural } from '../domain/actionSentence.ts'
import { ACTION_PLACEHOLDERS } from '../domain/examples.ts'
import { OPTIONAL_FIELD_MARK } from '../copy/programCopy.ts'
import { STEP_PATHS } from '../domain/steps.ts'
import { HELP_RESOURCES } from '../domain/values.ts'
import {
  canSelectActionIndex,
  firstIncompleteStepBefore,
  incompleteStepLocationState,
  isNoOrUnknownObstacle,
} from '../domain/validation.ts'
import { useProgram } from '../state/ProgramProvider.tsx'

export function Step5ActionPage() {
  return (
    <StepGuard stepId="step5">
      <Step5Body />
    </StepGuard>
  )
}

function Step5Body() {
  const { state, dispatch } = useProgram()
  const navigate = useNavigate()
  const { banner, errorFor, validate } = useMissingResponses('step5')
  const actionsError = errorFor('actions')
  const primaryError = errorFor('primary-action')
  const typeError = errorFor('action-type')

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

  const goNext = () => {
    const previous = firstIncompleteStepBefore(state, 'step5')
    if (previous) {
      navigate(STEP_PATHS[previous], { state: incompleteStepLocationState() })
      return
    }
    if (!validate()) return
    navigate('/summary')
  }

  return (
    <>
      <StepHeading kicker="5단계" title="나의 첫 행동">
        <p>
          목표를 위해 할 수 있는 행동을 최대 3개 적고, 가장 먼저 실행할 행동 1개를 고른 뒤 실행
          계획을 구체화합니다.
        </p>
      </StepHeading>
      {banner ? (
        <MissingResponseAlert redirected={banner.type === 'redirected'} count={banner.count} />
      ) : null}
      <article className="card summary-card">
        <h2>나의 목표</h2>
        <p className="preserve">{state.goal}</p>
      </article>
      <QuestionBlock id="question-actions" error={actionsError} className="stack">
        {([0, 1, 2] as const).map((index) => (
          <TextArea
            key={index}
            id={index === 0 ? 'first-field' : `action-${index}`}
            label={`할 수 있는 행동 ${index + 1}`}
            optional={index !== 0}
            placeholder={ACTION_PLACEHOLDERS[index]}
            value={state.actions[index]}
            onChange={(event) =>
              dispatch({ type: 'SET_ACTION_TEXT', index, text: event.target.value })
            }
            rows={3}
          />
        ))}
      </QuestionBlock>
      <QuestionBlock
        id="question-primary-action"
        error={primaryError}
        className="area-choice"
        as="fieldset"
        tabIndex={-1}
      >
        <legend>우선 실행행동 1개</legend>
        {([0, 1, 2] as const).map((index) => {
          const text = state.actions[index]
          const enabled = canSelectActionIndex(state, index)
          return (
            <label
              key={index}
              className={
                state.primaryActionIndex === index ? 'choice-card is-selected' : 'choice-card'
              }
            >
              <input
                type="radio"
                name="primary-action"
                disabled={!enabled}
                checked={state.primaryActionIndex === index}
                onChange={() => dispatch({ type: 'SET_PRIMARY_ACTION', index })}
              />
              <span className="choice-body">
                <strong>행동 {index + 1}</strong>
                <span className="choice-meta">{enabled ? text : '비어 있어 선택할 수 없습니다.'}</span>
              </span>
            </label>
          )
        })}
      </QuestionBlock>
      <QuestionBlock
        id="question-action-type"
        error={typeError}
        className="check-row"
        as="fieldset"
        tabIndex={-1}
      >
        <legend>행동유형</legend>
        <label>
          <input
            id="action-type-once"
            type="radio"
            name="action-type"
            checked={state.actionType === 'once'}
            onChange={() => dispatch({ type: 'SET_ACTION_TYPE', actionType: 'once' })}
          />
          한 번 완료하는 행동
        </label>
        <label>
          <input
            id="action-type-repeat"
            type="radio"
            name="action-type"
            checked={state.actionType === 'repeat'}
            onChange={() => dispatch({ type: 'SET_ACTION_TYPE', actionType: 'repeat' })}
          />
          일정 기간 반복하는 행동
        </label>
      </QuestionBlock>
      <TextArea
        id="action-what"
        questionId="question-action-what"
        label="무엇을"
        error={errorFor('action-what')}
        value={state.actionWhat}
        onChange={(event) =>
          dispatch({ type: 'SET_ACTION_DETAIL', field: 'actionWhat', text: event.target.value })
        }
        rows={3}
      />
      <TextField
        id="action-when"
        questionId="question-action-when"
        label={state.actionType === 'repeat' ? '언제 (요일·시간대·상황)' : '언제 (날짜·시간·상황)'}
        error={errorFor('action-when')}
        value={state.actionWhen}
        onChange={(event) =>
          dispatch({ type: 'SET_ACTION_DETAIL', field: 'actionWhen', text: event.target.value })
        }
      />
      <TextField
        id="action-where"
        questionId="question-action-where"
        label="어디서"
        error={errorFor('action-where')}
        value={state.actionWhere}
        onChange={(event) =>
          dispatch({ type: 'SET_ACTION_DETAIL', field: 'actionWhere', text: event.target.value })
        }
      />
      {state.actionType === 'repeat' ? (
        <TextField
          id="action-freq"
          questionId="question-action-frequency"
          label="얼마나 자주"
          error={errorFor('action-frequency')}
          value={state.actionFrequencyOrDuration}
          onChange={(event) =>
            dispatch({
              type: 'SET_ACTION_DETAIL',
              field: 'actionFrequencyOrDuration',
              text: event.target.value,
            })
          }
        />
      ) : null}
      {state.actionType === 'once' ? (
        <TextField
          id="action-duration"
          label="얼마 동안"
          optional
          value={state.actionFrequencyOrDuration}
          onChange={(event) =>
            dispatch({
              type: 'SET_ACTION_DETAIL',
              field: 'actionFrequencyOrDuration',
              text: event.target.value,
            })
          }
        />
      ) : null}
      {plan ? (
        <article className="card plan-card">
          <h2>실행계획</h2>
          <p>{plan}</p>
        </article>
      ) : null}
      <TextArea
        id="obstacle"
        questionId="question-obstacle"
        label="가장 가능성 높은 장애물 1개"
        hint="장애물이 없으면 ‘없음’, 잘 모르겠으면 ‘모름’이라고 적어 주세요."
        error={errorFor('obstacle')}
        value={state.obstacle}
        onChange={(event) => dispatch({ type: 'SET_OBSTACLE', text: event.target.value })}
        rows={3}
      />
      <TextArea
        id="alternative"
        questionId="question-alternative"
        label="대안행동"
        hint={
          isNoOrUnknownObstacle(state.obstacle)
            ? '장애물이 없음 또는 모름이면 ‘해당 없음’으로 두어도 됩니다.'
            : '장애물이 생겼을 때 대신 할 행동을 적어 주세요.'
        }
        error={errorFor('alternative')}
        value={state.alternativeAction}
        onChange={(event) => dispatch({ type: 'SET_ALTERNATIVE', text: event.target.value })}
        rows={3}
      />
      {coping ? (
        <article className="card plan-card">
          <h2>대응계획</h2>
          <p>{coping}</p>
        </article>
      ) : null}
      <fieldset className="stack">
        <legend>
          도움이 될 사람·정보·자료·도구 <span className="field-optional">{OPTIONAL_FIELD_MARK}</span>
        </legend>
        {HELP_RESOURCES.map((resource) => (
          <label key={resource.id} className="check-line">
            <input
              type="checkbox"
              checked={state.helpResources.includes(resource.id)}
              onChange={() => dispatch({ type: 'TOGGLE_HELP', resource: resource.id })}
            />
            {resource.label}
          </label>
        ))}
        <TextField
          id="help-note"
          label="도움·자원에 대한 메모"
          optional
          value={state.helpNote}
          onChange={(event) => dispatch({ type: 'SET_HELP_NOTE', text: event.target.value })}
        />
      </fieldset>
      <Scale
        id="first-feasibility"
        name="first-feasibility"
        label="첫 행동 실행 가능성"
        value={state.firstActionFeasibility}
        error={errorFor('first-feasibility')}
        onChange={(value) => dispatch({ type: 'SET_FIRST_ACTION_FEASIBILITY', value })}
      />
      <TextArea
        id="encouragement"
        label="자기격려나 다짐"
        optional
        value={state.selfEncouragement}
        onChange={(event) => dispatch({ type: 'SET_ENCOURAGEMENT', text: event.target.value })}
        rows={3}
      />
      <StepNav
        backTo="/step/4"
        nextLabel="나의 첫 행동으로 확정"
        onNext={goNext}
      />
    </>
  )
}
