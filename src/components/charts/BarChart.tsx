import { useId } from 'react'
import { useElementWidth } from '../../hooks/useElementWidth'
import { ReferenceLines, XLabels, YAxisGrid } from './ChartAxes'
import { scaleLinear, visibleLabelIndexes, type Margin, type ReferenceLine } from './chartUtils'

type Gradient = [string, string]

interface BarChartProps {
  values: number[]
  labels: string[]
  yDomain: [number, number]
  yTicks: number[]
  height: number | ((width: number) => number)
  ariaLabel: string
  gradient: Gradient
  /** Gradient for a single emphasised bar (e.g. the current cycle). */
  highlight?: { index: number; gradient: Gradient }
  referenceLines?: ReferenceLine[]
  formatY?: (value: number) => string
  margin?: Partial<Margin>
}

const DEFAULT_MARGIN: Margin = { top: 14, right: 14, bottom: 28, left: 40 }

export function BarChart({
  values,
  labels,
  yDomain,
  yTicks,
  height,
  ariaLabel,
  gradient,
  highlight,
  referenceLines = [],
  formatY = String,
  margin: marginOverride,
}: BarChartProps) {
  const uid = useId()
  const [ref, width] = useElementWidth<HTMLDivElement>()
  const margin = { ...DEFAULT_MARGIN, ...marginOverride }
  const chartHeight = typeof height === 'function' ? height(width) : height
  const plotLeft = margin.left
  const plotRight = Math.max(plotLeft + 10, width - margin.right)
  const plotTop = margin.top
  const plotBottom = chartHeight - margin.bottom

  const band = (plotRight - plotLeft) / Math.max(values.length, 1)
  const barWidth = Math.min(band * 0.56, 34)
  const toX = (index: number) => plotLeft + band * index + band / 2
  const toY = scaleLinear(yDomain, [plotBottom, plotTop])
  const visible = visibleLabelIndexes(labels, plotRight - plotLeft - band, undefined)
  const radius = Math.min(6, barWidth / 2)

  const gradients: { id: string; stops: Gradient }[] = [{ id: 'base', stops: gradient }]
  if (highlight) gradients.push({ id: 'highlight', stops: highlight.gradient })

  return (
    <div ref={ref} className="w-full">
      {width > 0 && (
        <svg width={width} height={chartHeight} role="img" aria-label={ariaLabel} className="type-chart block overflow-visible">
          <defs>
            {gradients.map((g) => (
              <linearGradient key={g.id} id={`${uid}-${g.id}`} x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor={g.stops[0]} />
                <stop offset="100%" stopColor={g.stops[1]} />
              </linearGradient>
            ))}
          </defs>
          <YAxisGrid ticks={yTicks} left={plotLeft} right={plotRight} toY={toY} format={formatY} />
          <XLabels labels={labels} visible={visible} toX={toX} y={plotBottom + 20} />
          {values.map((value, i) => {
            const top = toY(value)
            const x = toX(i) - barWidth / 2
            const h = Math.max(plotBottom - top, 0)
            const fill = highlight?.index === i ? 'highlight' : 'base'
            return (
              <path
                key={`${labels[i] ?? i}-${i}`}
                d={`M${x} ${plotBottom} V${top + radius} Q${x} ${top} ${x + radius} ${top} H${x + barWidth - radius} Q${x + barWidth} ${top} ${x + barWidth} ${top + radius} V${plotBottom} Z`}
                fill={`url(#${uid}-${fill})`}
                opacity={h > 0 ? 1 : 0}
              />
            )
          })}
          <ReferenceLines lines={referenceLines} left={plotLeft} right={plotRight} toY={toY} />
        </svg>
      )}
    </div>
  )
}
