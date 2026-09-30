const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'] as const
const MONTHS_LONG = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
] as const

const pad = (n: number) => String(n).padStart(2, '0')
const monthName = (d: Date) => MONTHS[d.getMonth()] ?? ''

/** "Sep 03" – chart axis label. */
export const formatAxisDate = (d: Date) => `${monthName(d)} ${pad(d.getDate())}`

/** "01 Sept 2026" – date-picker field label. */
export const formatFieldDate = (d: Date) =>
  `${pad(d.getDate())} ${d.getMonth() === 8 ? 'Sept' : monthName(d)} ${d.getFullYear()}`

/** "Jun 1" – compact range label. */
export const formatShortDate = (d: Date) => `${monthName(d)} ${d.getDate()}`

export const formatMonthTitle = (d: Date) => `${MONTHS_LONG[d.getMonth()] ?? ''} ${d.getFullYear()}`

export const formatFullDate = (d: Date) =>
  `${MONTHS_LONG[d.getMonth()] ?? ''} ${d.getDate()}, ${d.getFullYear()}`

export const dateKey = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`

export const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate())

export const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n)

export const startOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth(), 1)

export const addMonths = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth() + n, 1)

export const isSameDay = (a: Date, b: Date) => dateKey(a) === dateKey(b)

const daysInMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate()

export const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'] as const

/** Weeks of a month; null pads the leading/trailing cells. */
export function monthWeeks(month: Date): (Date | null)[][] {
  const first = startOfMonth(month)
  const cells: (Date | null)[] = Array.from({ length: first.getDay() }, () => null)
  for (let day = 1; day <= daysInMonth(month); day += 1) {
    cells.push(new Date(month.getFullYear(), month.getMonth(), day))
  }
  while (cells.length % 7 !== 0) cells.push(null)
  const weeks: (Date | null)[][] = []
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7))
  return weeks
}
