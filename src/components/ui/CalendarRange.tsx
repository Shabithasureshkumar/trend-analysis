import { useRef, useState, type KeyboardEvent } from 'react'
import { flushSync } from 'react-dom'
import {
  WEEKDAYS,
  addDays,
  addMonths,
  dateKey,
  formatFieldDate,
  formatFullDate,
  formatMonthTitle,
  isSameDay,
  monthWeeks,
  startOfDay,
  startOfMonth,
} from '../../lib/date'
import { Icon } from './Icon'

export interface DraftRange {
  start: Date | null
  end: Date | null
}

interface CalendarRangeProps {
  draft: DraftRange
  onChange: (draft: DraftRange) => void
  /** Last selectable day; later dates are shown as unavailable. */
  maxDate?: Date
}

const KEY_OFFSETS: Record<string, number> = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 }

const NAV_BUTTON =
  'grid size-11 place-items-center rounded-full text-body transition-colors hover:bg-brand-purple-soft disabled:opacity-30 disabled:hover:bg-transparent'

function dayClasses(state: 'unavailable' | 'selected' | 'inRange' | 'idle') {
  const base = 'mx-auto grid size-9 place-items-center rounded-full type-secondary font-medium transition-colors '
  switch (state) {
    case 'unavailable':
      return `${base} cursor-not-allowed text-muted/50 line-through`
    case 'selected':
      return `${base} bg-brand-pink font-semibold text-white shadow-[0_6px_14px_-4px_rgb(236_72_153/0.6)]`
    case 'inRange':
      return `${base} text-brand-purple group-hover:bg-white/70`
    case 'idle':
      return `${base} text-ink group-hover:bg-brand-purple-soft`
  }
}

export function CalendarRange({ draft, onChange, maxDate }: CalendarRangeProps) {
  const [month, setMonth] = useState(() => startOfMonth(draft.start ?? new Date()))
  const [focusDate, setFocusDate] = useState(() => draft.start ?? new Date())
  const gridRef = useRef<HTMLTableElement>(null)
  const weeks = monthWeeks(month)

  const inMonth = focusDate.getMonth() === month.getMonth() && focusDate.getFullYear() === month.getFullYear()
  const tabStopKey = dateKey(inMonth ? focusDate : month)
  const isUnavailable = (day: Date) => (maxDate ? startOfDay(day).getTime() > startOfDay(maxDate).getTime() : false)
  const atLastMonth = maxDate ? month.getTime() >= startOfMonth(maxDate).getTime() : false

  const pick = (day: Date) => {
    if (isUnavailable(day)) return
    setFocusDate(day)
    if (!draft.start || draft.end) {
      onChange({ start: day, end: null })
    } else if (day.getTime() < draft.start.getTime()) {
      onChange({ start: day, end: draft.start })
    } else {
      onChange({ start: draft.start, end: day })
    }
  }

  const moveFocus = (next: Date) => {
    if (isUnavailable(next)) return
    flushSync(() => {
      setMonth(startOfMonth(next))
      setFocusDate(next)
    })
    gridRef.current?.querySelector<HTMLButtonElement>(`[data-date="${dateKey(next)}"]`)?.focus()
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>, day: Date) => {
    const offset = KEY_OFFSETS[event.key]
    if (offset !== undefined) {
      event.preventDefault()
      moveFocus(addDays(day, offset))
    } else if (event.key === 'PageDown' || event.key === 'PageUp') {
      event.preventDefault()
      const target = addMonths(day, event.key === 'PageDown' ? 1 : -1)
      moveFocus(new Date(target.getFullYear(), target.getMonth(), Math.min(day.getDate(), 28)))
    }
  }

  const rangeEnd = draft.end ?? draft.start

  return (
    <div>
      <div className="grid grid-cols-2 gap-2.5" role="group" aria-label="Selected range">
        {(
          [
            ['From', draft.start],
            ['To', draft.end],
          ] as const
        ).map(([label, value]) => (
          <div key={label} className="min-w-0 rounded-2xl border border-line bg-white px-3.5 py-2.5">
            <div className="type-label font-semibold tracking-[0.08em] text-muted uppercase">{label}</div>
            <div className="mt-0.5 truncate type-secondary font-semibold text-ink ">
              {value ? formatFieldDate(value) : '—'}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between">
        <button type="button" onClick={() => setMonth(addMonths(month, -1))} aria-label="Previous month" className={NAV_BUTTON}>
          <Icon name="chevronLeft" />
        </button>
        <div className="type-card-sm font-semibold text-ink" aria-live="polite">
          {formatMonthTitle(month)}
        </div>
        <button
          type="button"
          onClick={() => setMonth(addMonths(month, 1))}
          disabled={atLastMonth}
          aria-label="Next month"
          className={NAV_BUTTON}
        >
          <Icon name="chevronRight" />
        </button>
      </div>

      <table ref={gridRef} className="mt-2 w-full table-fixed border-collapse" aria-label={formatMonthTitle(month)}>
        <thead>
          <tr>
            {WEEKDAYS.map((weekday) => (
              <th key={weekday} scope="col" className="h-8 type-label font-medium text-muted">
                {weekday}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {weeks.map((week, weekIndex) => (
            <tr key={`${dateKey(month)}-week-${weekIndex}`}>
              {week.map((day, index) => {
                if (!day) return <td key={`blank-${index}`} className="h-11 p-0" />
                const time = startOfDay(day).getTime()
                const isStart = draft.start ? isSameDay(day, draft.start) : false
                const isEnd = draft.end ? isSameDay(day, draft.end) : false
                const inRange =
                  draft.start && rangeEnd
                    ? time >= startOfDay(draft.start).getTime() && time <= startOfDay(rangeEnd).getTime()
                    : false
                const hasSpan = draft.start && draft.end && !isSameDay(draft.start, draft.end)
                let band = ''
                if (inRange && hasSpan) {
                  if (isStart) band = 'bg-[linear-gradient(to_right,transparent_50%,var(--color-brand-pink-soft)_50%)]'
                  else if (isEnd) band = 'bg-[linear-gradient(to_right,var(--color-brand-pink-soft)_50%,transparent_50%)]'
                  else band = 'bg-brand-pink-soft'
                }
                const selected = isStart || isEnd
                const unavailable = isUnavailable(day)
                const state = unavailable ? 'unavailable' : selected ? 'selected' : inRange ? 'inRange' : 'idle'
                const key = dateKey(day)
                return (
                  <td key={key} className={`h-11 p-0 text-center ${band}`}>
                    <button
                      type="button"
                      data-date={key}
                      tabIndex={key === tabStopKey ? 0 : -1}
                      aria-label={unavailable ? `${formatFullDate(day)}, unavailable` : formatFullDate(day)}
                      aria-pressed={selected}
                      disabled={unavailable}
                      onClick={() => pick(day)}
                      onKeyDown={(event) => handleKeyDown(event, day)}
                      className="group grid h-11 w-full place-items-center rounded-full"
                    >
                      <span className={dayClasses(state)}>{day.getDate()}</span>
                    </button>
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
