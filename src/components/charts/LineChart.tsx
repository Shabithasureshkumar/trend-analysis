import { useId } from 'react'
import { useElementWidth } from '../../hooks/useElementWidth'
import { Markers, ReferenceLines, XLabels, YAxisGrid } from './ChartAxes'
import {
  linearPath,
  monotonePath,
  scaleLinear,
  visibleLabelIndexes,
  type ChartMarker,
  type Margin,
  type Point,
  type ReferenceLine,
} from './chartUtils'

export interface LineSeries {
  id: string
  color: string
  values: number[]
  dashed?: boolean
  strokeWidth?: number
  /** Soft gradient fill under the line. */
  fill?: boolean
  dots?: 'all' | 'last' | 'none'
  /** Horizontal stroke gradient (start → end). */
  gradient?: [string, string]
  /** Colour of the emphasised final dot. */
  lastDotColor?: string
  /** Emphasise a specific index with a larger dot. */
  highlightIndex?: number
}

interface LineChartProps {
  series: LineSeries[]
  xLabels: string[]
  yDomain: [number, number]
  yTicks: number[]
  height: number | ((width: number) => number)
  ariaLabel: string
  formatY?: (value: number) => string
  markers?: ChartMarker[]
  referenceLines?: ReferenceLine[]
  curve?: 'smooth' | 'linear'
  xTickIndexes?: number[]
  margin?: Partial<Margin>
}

const DEFAULT_MARGIN: Margin = { top: 14, right: 14, bottom: 28, left: 40 }

export function LineChart({
  series,
  xLabels,
  yDomain,
  yTicks,
  height,
  ariaLabel,
  formatY = String,
  markers = [],
  referenceLines = [],
  curve = 'smooth',
  xTickIndexes,
  margin: marginOverride,
}: LineChartProps) {
  const uid = useId()
  const [ref, width] = useElementWidth<HTMLDivElement>()
  const margin = { ...DEFAULT_MARGIN, ...(markers.length > 0 ? { top: 26 } : null), ...marginOverride }
  const chartHeight = typeof height === 'function' ? height(width) : height
  const plotLeft = margin.left
  const plotRight = Math.max(plotLeft + 10, width - margin.right)
  const plotTop = margin.top
  const plotBottom = chartHeight - margin.bottom

  const count = xLabels.length
  const toX = (index: number) =>
    count <= 1 ? (plotLeft + plotRight) / 2 : plotLeft + (index * (plotRight - plotLeft)) / (count - 1)
  const toY = scaleLinear(yDomain, [plotBottom, plotTop])
  const buildPath = curve === 'smooth' ? monotonePath : linearPath
  const visible = visibleLabelIndexes(xLabels, plotRight - plotLeft, xTickIndexes)

  return (
    <div ref={ref} className="w-full">
      {width > 0 && (
        <svg width={width} height={chartHeight} role="img" aria-label={ariaLabel} className="type-chart block overflow-visible">
          <defs>
            {series.map((s) => (
              <g key={s.id}>
                {s.gradient && (
                  <linearGradient id={`${uid}-stroke-${s.id}`} gradientUnits="userSpaceOnUse" x1={plotLeft} x2={plotRight} y1="0" y2="0">
                    <stop offset="0%" stopColor={s.gradient[0]} />
                    <stop offset="100%" stopColor={s.gradient[1]} />
                  </linearGradient>
                )}
                {s.fill && (
                  <linearGradient id={`${uid}-fill-${s.id}`} x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor={s.gradient?.[0] ?? s.color} stopOpacity="0.22" />
                    <stop offset="100%" stopColor={s.gradient?.[1] ?? s.color} stopOpacity="0.02" />
                  </linearGradient>
                )}
              </g>
            ))}
          </defs>

          <YAxisGrid ticks={yTicks} left={plotLeft} right={plotRight} toY={toY} format={formatY} />
          <XLabels labels={xLabels} visible={visible} toX={toX} y={plotBottom + 20} />
          <ReferenceLines lines={referenceLines} left={plotLeft} right={plotRight} toY={toY} />
          <Markers markers={markers} toX={toX} top={plotTop} bottom={plotBottom} />

          {series.map((s) => {
            const points: Point[] = s.values.map((value, i) => ({ x: toX(i), y: toY(value) }))
            const stroke = s.gradient ? `url(#${uid}-stroke-${s.id})` : s.color
            const path = buildPath(points)
            const first = points[0]
            const last = points[points.length - 1]
            return (
              <g key={s.id}>
                {s.fill && first && last && (
                  <path
                    d={`${path} L${last.x} ${plotBottom} L${first.x} ${plotBottom} Z`}
                    fill={`url(#${uid}-fill-${s.id})`}
                  />
                )}
                <path
                  d={path}
                  fill="none"
                  stroke={stroke}
                  strokeWidth={s.strokeWidth ?? 2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeDasharray={s.dashed ? '5 4' : undefined}
                />
                {points.map((p, i) => {
                  const isLast = i === points.length - 1
                  const isHighlight = i === s.highlightIndex
                  const showDot = s.dots === 'all' || (s.dots === 'last' && isLast) || isHighlight
                  if (!showDot) return null
                  const emphasised = isHighlight || (isLast && s.lastDotColor !== undefined)
                  return (
                    <circle
                      key={i}
                      cx={p.x}
                      cy={p.y}
                      r={emphasised ? 5 : 3.4}
                      fill={isLast && s.lastDotColor ? s.lastDotColor : s.color}
                      stroke="#fff"
                      strokeWidth="1.6"
                    />
                  )
                })}
              </g>
            )
          })}
        </svg>
      )}
    </div>
  )
}
