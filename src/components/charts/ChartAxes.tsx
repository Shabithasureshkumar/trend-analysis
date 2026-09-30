import { AXIS_COLOR, GRID_COLOR, type ChartMarker, type ReferenceLine } from './chartUtils'

interface YAxisProps {
  ticks: number[]
  left: number
  right: number
  toY: (value: number) => number
  format: (value: number) => string
}

export function YAxisGrid({ ticks, left, right, toY, format }: YAxisProps) {
  return (
    <g fill={AXIS_COLOR}>
      {ticks.map((tick) => (
        <g key={tick}>
          <line x1={left} x2={right} y1={toY(tick)} y2={toY(tick)} stroke={GRID_COLOR} />
          <text x={left - 10} y={toY(tick)} textAnchor="end" dominantBaseline="middle">
            {format(tick)}
          </text>
        </g>
      ))}
    </g>
  )
}

interface XLabelsProps {
  labels: string[]
  visible: Set<number>
  toX: (index: number) => number
  y: number
}

export function XLabels({ labels, visible, toX, y }: XLabelsProps) {
  return (
    <g fill={AXIS_COLOR} textAnchor="middle">
      {labels.map((label, i) =>
        visible.has(i) ? (
          <text key={`${label}-${i}`} x={toX(i)} y={y}>
            {label}
          </text>
        ) : null,
      )}
    </g>
  )
}

interface ReferenceLinesProps {
  lines: ReferenceLine[]
  left: number
  right: number
  toY: (value: number) => number
}

export function ReferenceLines({ lines, left, right, toY }: ReferenceLinesProps) {
  return (
    <g>
      {lines.map((line) => {
        const y = toY(line.value)
        return (
          <g key={line.label}>
            <line x1={left} x2={right} y1={y} y2={y} stroke={line.color} strokeDasharray="4 4" strokeWidth="1.2" />
            <text
              x={right - 2}
              y={line.labelPosition === 'below' ? y + 14 : y - 6}
              textAnchor="end"
              fill={AXIS_COLOR}
              stroke="#fff"
              strokeWidth={3}
              paintOrder="stroke"
            >
              {line.label}
            </text>
          </g>
        )
      })}
    </g>
  )
}

interface MarkersProps {
  markers: ChartMarker[]
  toX: (index: number) => number
  top: number
  bottom: number
}

export function Markers({ markers, toX, top, bottom }: MarkersProps) {
  return (
    <g>
      {markers.map((marker) => (
        <g key={marker.label}>
          <line
            x1={toX(marker.index)}
            x2={toX(marker.index)}
            y1={top}
            y2={bottom}
            stroke={marker.color}
            strokeDasharray="3 3"
            strokeWidth="1.2"
          />
          <text
            x={toX(marker.index)}
            y={top - 6}
            textAnchor="middle"
            fontWeight="600"
            fill={marker.color}
          >
            {marker.label}
          </text>
        </g>
      ))}
    </g>
  )
}
