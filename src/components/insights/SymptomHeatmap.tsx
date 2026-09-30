import { INTENSITY_LEVELS } from '../../data/insights'

const HEAT_COLORS = ['#f1eefb', '#d8ccfa', '#b2a0f4', '#8c70ec', '#5a33d4'] as const

export function IntensityLegend() {
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 type-label text-muted">
      <span>Intensity</span>
      {INTENSITY_LEVELS.map((label, level) => (
        <span key={label} className="inline-flex items-center gap-1.5">
          <span aria-hidden="true" className="size-2.5 rounded-[3px]" style={{ backgroundColor: HEAT_COLORS[level] }} />
          {label}
        </span>
      ))}
    </div>
  )
}

export interface HeatmapRow {
  symptom: string
  /** Intensity per column, 0 (none) – 4 (very high); fractional values are rounded. */
  levels: number[]
}

interface SymptomHeatmapProps {
  rows: HeatmapRow[]
  columnLabels: string[]
}

export function SymptomHeatmap({ rows, columnLabels }: SymptomHeatmapProps) {
  return (
    <div
      role="img"
      aria-label={`Heatmap of symptom intensity across ${columnLabels.length} periods, from none to very high`}
      className="grid gap-[3px] sm:gap-1.5"
      style={{ gridTemplateColumns: `minmax(58px, 118px) repeat(${columnLabels.length}, minmax(0, 1fr))` }}
    >
      <span aria-hidden="true" />
      {columnLabels.map((label, index) => (
        <span key={`${label}-${index}`} aria-hidden="true" className="pb-1 text-center type-chart text-muted ">
          {label}
        </span>
      ))}
      {rows.map((row) => (
        <div key={row.symptom} className="contents">
          <span aria-hidden="true" className="flex items-center truncate pr-2 type-label font-medium text-ink ">
            <span className="truncate">{row.symptom}</span>
          </span>
          {row.levels.map((level, index) => (
            <span
              key={`${columnLabels[index] ?? index}-${index}`}
              aria-hidden="true"
              className="h-6 rounded-[5px] sm:h-7 sm:rounded-lg"
              style={{ backgroundColor: HEAT_COLORS[Math.min(4, Math.max(0, Math.round(level)))] }}
            />
          ))}
        </div>
      ))}
    </div>
  )
}
