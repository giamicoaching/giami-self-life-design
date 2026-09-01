interface ProgressHeaderProps {
  stageLabel: string
  stageNumber: number
  total: number
  percent: number
}

export function ProgressHeader({ stageLabel, stageNumber, total, percent }: ProgressHeaderProps) {
  const label =
    stageNumber > 0 ? `${stageNumber} / ${total}단계 · ${stageLabel}` : stageLabel

  return (
    <header className="progress-header no-print">
      <div className="progress-brand">지아미 자기주도 생애설계</div>
      <div className="progress-meta">
        <p>{label}</p>
        <div
          className="progress-bar"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={percent}
          aria-label="전체 진행률"
        >
          <span style={{ width: `${percent}%` }} />
        </div>
      </div>
    </header>
  )
}
