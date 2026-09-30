export interface Margin {
  top: number
  right: number
  bottom: number
  left: number
}

export interface Point {
  x: number
  y: number
}

export interface ReferenceLine {
  value: number
  label: string
  color: string
  labelPosition?: 'above' | 'below'
}

export interface ChartMarker {
  index: number
  label: string
  color: string
}

export const AXIS_COLOR = '#9d9bb2'
export const GRID_COLOR = '#eee9f5'

export const scaleLinear =
  (domain: [number, number], range: [number, number]) =>
  (value: number) =>
    range[0] + ((value - domain[0]) / (domain[1] - domain[0])) * (range[1] - range[0])

/** Monotone cubic interpolation: smooth like the design but never overshoots the data. */
export function monotonePath(points: Point[]): string {
  const first = points[0]
  if (!first) return ''
  const n = points.length
  if (n === 1) return `M${first.x} ${first.y}`

  const slopes: number[] = []
  for (let i = 0; i < n - 1; i += 1) {
    const a = points[i]
    const b = points[i + 1]
    slopes.push(a && b && b.x !== a.x ? (b.y - a.y) / (b.x - a.x) : 0)
  }
  const tangents = points.map((_, i) => {
    if (i === 0) return slopes[0] ?? 0
    if (i === n - 1) return slopes[n - 2] ?? 0
    const prev = slopes[i - 1] ?? 0
    const next = slopes[i] ?? 0
    return prev * next <= 0 ? 0 : (2 * prev * next) / (prev + next)
  })

  let d = `M${first.x} ${first.y}`
  for (let i = 0; i < n - 1; i += 1) {
    const a = points[i]
    const b = points[i + 1]
    if (!a || !b) continue
    const dx = (b.x - a.x) / 3
    d += ` C${a.x + dx} ${a.y + dx * (tangents[i] ?? 0)} ${b.x - dx} ${b.y - dx * (tangents[i + 1] ?? 0)} ${b.x} ${b.y}`
  }
  return d
}

export const linearPath = (points: Point[]) =>
  points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x} ${p.y}`).join(' ')

/** Indices of x labels to show so they never overlap. */
export function visibleLabelIndexes(labels: string[], plotWidth: number, explicit?: number[]): Set<number> {
  if (explicit) return new Set(explicit)
  const longest = labels.reduce((max, label) => Math.max(max, label.length), 1)
  const labelWidth = longest * 6.4 + 14
  const slot = labels.length > 1 ? plotWidth / (labels.length - 1) : plotWidth
  const step = Math.max(1, Math.ceil(labelWidth / slot))
  return new Set(labels.map((_, i) => i).filter((i) => i % step === 0))
}
