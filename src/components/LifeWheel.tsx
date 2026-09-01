import { changeReviewIndex } from '../domain/calculations.ts'
import { LIFE_AREAS } from '../domain/lifeAreas.ts'
import type { ProgramState } from '../domain/types.ts'
import type { ReactNode } from 'react'

const SIZE = 440
const CX = 220
const CY = 220
const RADIUS = 112
const LABEL_R = 168

function polar(index: number, total: number, radius: number) {
  const angle = -Math.PI / 2 + (Math.PI * 2 * index) / total
  return {
    x: CX + Math.cos(angle) * radius,
    y: CY + Math.sin(angle) * radius,
  }
}

function polygonPoints(values: number[], radius: number): string {
  return values
    .map((value, index) => {
      const point = polar(index, values.length, (radius * value) / 7)
      return `${point.x.toFixed(2)},${point.y.toFixed(2)}`
    })
    .join(' ')
}

function textAnchor(x: number): 'start' | 'middle' | 'end' {
  if (x < CX - 18) return 'end'
  if (x > CX + 18) return 'start'
  return 'middle'
}

interface LifeWheelProps {
  state: ProgramState
  titleId?: string
}

export function LifeWheel({ state, titleId = 'wheel-title' }: LifeWheelProps) {
  const importance = LIFE_AREAS.map((area) => state.areaScores[area.id].importance ?? 1)
  const satisfaction = LIFE_AREAS.map((area) => state.areaScores[area.id].satisfaction ?? 1)

  return (
    <figure className="wheel-wrap">
      <svg
        className="wheel"
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        role="img"
        aria-labelledby={`${titleId} ${titleId}-desc`}
      >
        <title id={titleId}>9축 삶의 수레바퀴</title>
        <desc id={`${titleId}-desc`}>
          만족도는 연한 면과 실선, 중요도는 점선으로 표시합니다. 각 축에 영역명과 점수가 있습니다.
        </desc>
        {[1, 3, 5, 7].map((ring) => (
          <polygon
            key={ring}
            className="wheel-grid"
            points={polygonPoints(Array(9).fill(ring) as number[], RADIUS)}
          />
        ))}
        {LIFE_AREAS.map((area, index) => {
          const end = polar(index, LIFE_AREAS.length, RADIUS)
          return (
            <line
              key={area.id}
              className="wheel-axis"
              x1={CX}
              y1={CY}
              x2={end.x}
              y2={end.y}
            />
          )
        })}
        <polygon
          className="wheel-satisfaction"
          points={polygonPoints(satisfaction, RADIUS)}
        />
        <polygon className="wheel-importance" points={polygonPoints(importance, RADIUS)} />
        {LIFE_AREAS.map((area, index) => {
          const pos = polar(index, LIFE_AREAS.length, LABEL_R)
          const score = state.areaScores[area.id]
          const anchor = textAnchor(pos.x)
          const dy = pos.y < CY - 8 ? -6 : pos.y > CY + 8 ? 0 : 0
          return (
            <text
              key={area.id}
              x={pos.x}
              y={pos.y + dy}
              textAnchor={anchor}
              className="wheel-label"
            >
              <tspan x={pos.x} dy="0">
                {area.shortName}
              </tspan>
              <tspan x={pos.x} dy="16" className="wheel-score">
                중요 {score.importance ?? '-'} · 만족 {score.satisfaction ?? '-'}
              </tspan>
            </text>
          )
        })}
      </svg>
      <figcaption className="wheel-legend">
        <span className="legend-item">
          <span className="legend-swatch legend-satisfaction" aria-hidden="true" />
          만족도: 연한 채움과 실선
        </span>
        <span className="legend-item">
          <span className="legend-swatch legend-importance" aria-hidden="true" />
          중요도: 점선
        </span>
      </figcaption>
    </figure>
  )
}

export function WheelPrintBlock({
  title,
  description,
  children,
}: {
  title: string
  description?: ReactNode
  children: ReactNode
}) {
  return (
    <section className="wheel-print-block">
      <h2 className="wheel-print-title">{title}</h2>
      {description ? <div className="wheel-print-desc">{description}</div> : null}
      {children}
    </section>
  )
}

export function ChangeIndexList({ state }: { state: ProgramState }) {
  return (
    <div className="index-list result-block">
      <h3>변화검토지수</h3>
      <p className="muted">
        변화검토지수는 (중요도 − 1) × (7 − 만족도)로 계산한 참고정보입니다. 0~36점이며, 우선
        영역을 자동으로 정하지 않습니다.
      </p>
      <ul>
        {LIFE_AREAS.map((area) => {
          const index = changeReviewIndex(state.areaScores[area.id])
          return (
            <li key={area.id}>
              <span>{area.name}</span>
              <strong>{index === null ? '-' : `${index}점`}</strong>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
