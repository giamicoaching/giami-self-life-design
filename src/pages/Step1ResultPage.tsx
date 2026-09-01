import { useNavigate } from 'react-router-dom'
import { ChangeIndexList, LifeWheel, WheelPrintBlock } from '../components/LifeWheel.tsx'
import { StepGuard } from '../components/StepGuard.tsx'
import { StepHeading } from '../components/layout/ProgramShell.tsx'
import { Button } from '../components/ui/Button.tsx'
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
      <StepHeading kicker="1단계 결과" title="삶의 영역 평가 결과">
        <p>점수는 참고용이며 우선 영역을 자동으로 고르지 않습니다.</p>
      </StepHeading>
      <WheelPrintBlock
        title="삶의 수레바퀴"
        description={
          <p>
            만족도는 연한 색의 채워진 면과 실선, 중요도는 다른 색의 점선입니다. 각 축에 영역명과
            점수가 있습니다.
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
        <Button variant="secondary" onClick={saveResult}>
          결과 저장
        </Button>
        <Button onClick={() => navigate('/step/2')}>우선 삶의 영역 선택</Button>
      </div>
    </>
  )
}
