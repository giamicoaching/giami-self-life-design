import { useNavigate } from 'react-router-dom'
import { ChangeIndexList, LifeWheel, WheelPrintBlock } from '../components/LifeWheel.tsx'
import { StepGuard } from '../components/StepGuard.tsx'
import { StepHeading } from '../components/layout/ProgramShell.tsx'
import { Button } from '../components/ui/Button.tsx'
import { Notice } from '../components/ui/Notice.tsx'
import { WHEEL_RESULT_NOTICE } from '../copy/programCopy.ts'
import { useProgram } from '../state/ProgramProvider.tsx'
import { useSaveResult } from '../state/SaveToast.tsx'

export function Step1ResultPage() {
  return (
    <StepGuard stepId="step1-result">
      <Step1ResultBody />
    </StepGuard>
  )
}

function Step1ResultBody() {
  const { state } = useProgram()
  const navigate = useNavigate()
  const saveResult = useSaveResult()

  return (
    <>
      <StepHeading kicker="1단계 · 자기성찰 결과" title="나의 삶의 수레바퀴">
        <Notice>{WHEEL_RESULT_NOTICE}</Notice>
      </StepHeading>
      <WheelPrintBlock
        title="삶의 수레바퀴"
        description={
          <p>
            만족도는 연한 색의 채워진 면과 실선, 중요도는 다른 색의 점선입니다. 각 축에 영역명과
            중요도·만족도가 있습니다.
          </p>
        }
      >
        <LifeWheel state={state} />
      </WheelPrintBlock>
      <ChangeIndexList state={state} />
      <div className="action-row no-print">
        <Button variant="secondary" onClick={() => navigate('/step/1/1')}>
          내용 수정하기
        </Button>
        <Button variant="secondary" onClick={() => saveResult()}>
          결과 저장
        </Button>
        <Button onClick={() => navigate('/step/2')}>우선 삶의 영역 선택</Button>
      </div>
    </>
  )
}
