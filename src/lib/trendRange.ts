import { ANCHOR_DATE, PERIOD_CYCLES } from '../data/periodCycles'
import { addMonths, formatFieldDate, startOfDay } from './date'

export type TrendRange = '3-cycles' | '6-cycles' | '12-cycles' | '6-months' | '12-months' | 'custom'

export type PresetRange = Exclude<TrendRange, 'custom'>

export type TrendRangeSelection = { range: PresetRange } | { range: 'custom'; start: Date; end: Date }

export const RANGE_OPTIONS: { range: PresetRange; label: string; phrase: string }[] = [
  { range: '3-cycles', label: 'Last 3 Cycles', phrase: 'last 3 cycles' },
  { range: '6-cycles', label: 'Last 6 Cycles', phrase: 'last 6 cycles' },
  { range: '12-cycles', label: 'Last 12 Cycles', phrase: 'last 12 cycles' },
  { range: '6-months', label: 'Last 6 Months', phrase: 'last 6 months' },
  { range: '12-months', label: 'Last 12 Months', phrase: 'last 12 months' },
]

export const DEFAULT_RANGE: TrendRangeSelection = { range: '12-cycles' }

const presetOption = (range: PresetRange) => RANGE_OPTIONS.find((option) => option.range === range)

export const rangeLabel = (selection: TrendRangeSelection) =>
  selection.range === 'custom' ? 'Custom Range' : (presetOption(selection.range)?.label ?? '')

/** Lower-case phrase for subtitles, e.g. "last 12 cycles" or "01 Sept 2026 – 27 Sept 2026". */
export const rangePhrase = (selection: TrendRangeSelection) =>
  selection.range === 'custom'
    ? `${formatFieldDate(selection.start)} – ${formatFieldDate(selection.end)}`
    : (presetOption(selection.range)?.phrase ?? '')

/** Wording used inside sentences: "last 12 cycles", "the last 6 months", "the selected range". */
export function rangeScope(selection: TrendRangeSelection) {
  if (selection.range === 'custom') return 'the selected range'
  return selection.range.endsWith('months') ? `the ${rangePhrase(selection)}` : rangePhrase(selection)
}

export interface DateBounds {
  from: Date
  to: Date
}

const CYCLE_COUNTS = { '3-cycles': 3, '6-cycles': 6, '12-cycles': 12 } as const

export function rangeBounds(selection: TrendRangeSelection): DateBounds {
  switch (selection.range) {
    case 'custom':
      return { from: startOfDay(selection.start), to: startOfDay(selection.end) }
    case '6-months':
      return { from: addMonths(ANCHOR_DATE, -6), to: ANCHOR_DATE }
    case '12-months':
      return { from: addMonths(ANCHOR_DATE, -12), to: ANCHOR_DATE }
    default: {
      const first = PERIOD_CYCLES[Math.max(PERIOD_CYCLES.length - CYCLE_COUNTS[selection.range], 0)]
      return { from: first ? startOfDay(first.start) : ANCHOR_DATE, to: ANCHOR_DATE }
    }
  }
}

export const isWithin = (date: Date, bounds: DateBounds) => {
  const time = startOfDay(date).getTime()
  return time >= bounds.from.getTime() && time <= bounds.to.getTime()
}
