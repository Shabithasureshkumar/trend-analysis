export interface PeriodCycle {
  start: Date
  days: number
}

/** Last 12 logged periods (start date + bleeding days), oldest first. */
export const PERIOD_CYCLES: PeriodCycle[] = [
  { start: new Date(2025, 9, 16), days: 5 },
  { start: new Date(2025, 10, 16), days: 6 },
  { start: new Date(2025, 11, 14), days: 4 },
  { start: new Date(2026, 0, 12), days: 5 },
  { start: new Date(2026, 1, 13), days: 7 },
  { start: new Date(2026, 2, 13), days: 5 },
  { start: new Date(2026, 3, 12), days: 4 },
  { start: new Date(2026, 4, 11), days: 6 },
  { start: new Date(2026, 5, 8), days: 5 },
  { start: new Date(2026, 6, 7), days: 5 },
  { start: new Date(2026, 7, 6), days: 6 },
  { start: new Date(2026, 8, 3), days: 5 },
]

/** Latest day with logged data; month ranges and the calendar's upper limit are anchored here. */
export const ANCHOR_DATE = new Date(2026, 8, 30)

export const DEFAULT_CUSTOM_RANGE = { start: new Date(2026, 8, 1), end: new Date(2026, 8, 27) }
