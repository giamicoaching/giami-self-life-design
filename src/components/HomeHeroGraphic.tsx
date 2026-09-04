import { HOME_HERO_LABEL } from '../copy/programCopy.ts'

const CX = 132
const CY = 148
const RADIUS = 78

function polar(index: number, total: number, radius: number) {
  const angle = -Math.PI / 2 + (Math.PI * 2 * index) / total
  return {
    x: CX + Math.cos(angle) * radius,
    y: CY + Math.sin(angle) * radius,
  }
}

function polygon(values: number[]): string {
  return values
    .map((value, index) => {
      const point = polar(index, values.length, (RADIUS * value) / 7)
      return `${point.x.toFixed(1)},${point.y.toFixed(1)}`
    })
    .join(' ')
}

const SATISFACTION = [4.6, 5.2, 3.8, 5.6, 4.2, 5.1, 3.4, 4.8, 5.4]
const IMPORTANCE = [6.2, 5.8, 6.4, 5.5, 6.6, 5.9, 6.1, 5.4, 6.3]

export function HomeHeroGraphic() {
  return (
    <svg
      className="home-hero-graphic"
      viewBox="0 0 360 280"
      role="img"
      aria-label={HOME_HERO_LABEL}
    >
      <defs>
        <linearGradient id="home-hero-path" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#8fbf9a" />
          <stop offset="100%" stopColor="#215c43" />
        </linearGradient>
      </defs>
      <circle cx="132" cy="148" r="118" fill="#d7eadc" opacity="0.55" />
      <circle cx="132" cy="148" r="96" fill="none" stroke="#c9d6cc" strokeWidth="1.2" />
      {[1, 3, 5, 7].map((ring) => (
        <polygon
          key={ring}
          points={polygon(Array(9).fill(ring) as number[])}
          fill="none"
          stroke="#c9d6cc"
          strokeWidth="1"
        />
      ))}
      {Array.from({ length: 9 }, (_, index) => {
        const end = polar(index, 9, RADIUS)
        return (
          <line
            key={index}
            x1={CX}
            y1={CY}
            x2={end.x}
            y2={end.y}
            stroke="#c9d6cc"
            strokeWidth="1"
          />
        )
      })}
      <polygon points={polygon(SATISFACTION)} fill="#8fbf9a" fillOpacity="0.38" stroke="#215c43" strokeWidth="2" />
      <polygon
        points={polygon(IMPORTANCE)}
        fill="none"
        stroke="#2c4a6e"
        strokeWidth="1.8"
        strokeDasharray="5 4"
      />
      <path
        d="M188 168 C228 158, 252 132, 286 86"
        fill="none"
        stroke="url(#home-hero-path)"
        strokeWidth="7"
        strokeLinecap="round"
      />
      <path d="M272 70 L312 72 L292 104 Z" fill="#215c43" />
      <circle cx="188" cy="168" r="7" fill="#215c43" />
    </svg>
  )
}
