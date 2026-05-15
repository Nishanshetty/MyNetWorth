'use client'

import type { YearData } from '@/lib/calculator'
import { getCurrencyInfo } from '@/lib/utils'

interface Props {
  data: YearData[]
  currency: string
}

// SVG layout constants
const VW = 640
const VH = 260
const PAD = { l: 72, r: 16, t: 16, b: 40 }
const CW = VW - PAD.l - PAD.r   // 552 — chart inner width
const CH = VH - PAD.t - PAD.b   // 204 — chart inner height
const BOTTOM = PAD.t + CH

function px(year: number, maxYear: number): number {
  return PAD.l + (maxYear === 0 ? 0 : (year / maxYear) * CW)
}
function py(value: number, maxValue: number): number {
  return BOTTOM - (maxValue === 0 ? 0 : (value / maxValue) * CH)
}

function abbrev(value: number, symbol: string): string {
  if (value >= 1_000_000) return `${symbol}${(value / 1_000_000).toFixed(1)}M`
  if (value >= 1_000)     return `${symbol}${(value / 1_000).toFixed(0)}K`
  return `${symbol}${Math.round(value)}`
}

function pts(arr: [number, number][]): string {
  return arr.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ')
}

export default function GrowthChart({ data, currency }: Props) {
  if (data.length < 2) return null

  const maxYear   = data[data.length - 1].year
  const maxValue  = Math.max(...data.map((d) => d.balance)) * 1.05
  const symbol    = getCurrencyInfo(currency).symbol

  const balCoords  = data.map((d) => [px(d.year, maxYear), py(d.balance,    maxValue)] as [number, number])
  const conCoords  = data.map((d) => [px(d.year, maxYear), py(d.contributed, maxValue)] as [number, number])

  // Contribution area (gray, from x-axis up to contribution line)
  const contribArea = [
    `M ${PAD.l},${BOTTOM}`,
    `L ${pts(conCoords)}`,
    `L ${conCoords[conCoords.length - 1][0]},${BOTTOM} Z`,
  ].join(' ')

  // Interest area (emerald, sandwiched between contribution line and balance line)
  const interestArea = [
    `M ${pts([balCoords[0]])}`,
    `L ${pts(balCoords.slice(1))}`,
    `L ${pts([...conCoords].reverse())} Z`,
  ].join(' ')

  // Y-axis: 5 evenly spaced ticks
  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((f) => ({
    value: maxValue * f,
    y: py(maxValue * f, maxValue),
  }))

  // X-axis: ~6 labels max
  const xStep = Math.max(1, Math.ceil(maxYear / 6))
  const xTicks = data.filter((d) => d.year % xStep === 0 || d.year === maxYear)

  return (
    <svg
      viewBox={`0 0 ${VW} ${VH}`}
      width="100%"
      aria-label="Investment growth chart"
      className="overflow-visible"
    >
      {/* Horizontal gridlines */}
      {yTicks.map(({ y }, i) => (
        <line
          key={i}
          x1={PAD.l} y1={y} x2={PAD.l + CW} y2={y}
          className="stroke-gray-100 dark:stroke-gray-800"
          strokeWidth={1}
        />
      ))}

      {/* Filled areas */}
      <path d={contribArea} className="fill-gray-200/70 dark:fill-gray-700/50" />
      <path d={interestArea} className="fill-emerald-100 dark:fill-emerald-900/40" />

      {/* Lines */}
      <polyline points={pts(conCoords)} fill="none" className="stroke-gray-400 dark:stroke-gray-500" strokeWidth={1.5} />
      <polyline points={pts(balCoords)} fill="none" className="stroke-emerald-500 dark:stroke-emerald-400" strokeWidth={2} />

      {/* Y-axis labels */}
      {yTicks.map(({ value, y }, i) => (
        <text
          key={i}
          x={PAD.l - 6} y={y + 4}
          textAnchor="end"
          fontSize={11}
          className="fill-gray-400 dark:fill-gray-500"
        >
          {abbrev(value, symbol)}
        </text>
      ))}

      {/* X-axis labels */}
      {xTicks.map(({ year }) => (
        <text
          key={year}
          x={px(year, maxYear)} y={BOTTOM + 18}
          textAnchor="middle"
          fontSize={11}
          className="fill-gray-400 dark:fill-gray-500"
        >
          {year === 0 ? 'Now' : `Yr ${year}`}
        </text>
      ))}

      {/* Legend */}
      <g transform={`translate(${PAD.l + 8}, ${PAD.t + 8})`}>
        <rect width={10} height={10} rx={2} className="fill-gray-200 dark:fill-gray-700" />
        <text x={14} y={9} fontSize={11} className="fill-gray-500 dark:fill-gray-400">Contributions</text>
        <rect x={100} width={10} height={10} rx={2} className="fill-emerald-100 dark:fill-emerald-900/60" />
        <rect x={100} width={10} height={10} rx={2} fill="none" className="stroke-emerald-500" strokeWidth={1} />
        <text x={114} y={9} fontSize={11} className="fill-gray-500 dark:fill-gray-400">Interest earned</text>
      </g>
    </svg>
  )
}
