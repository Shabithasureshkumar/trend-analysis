import { useCallback, useId, useRef, useState } from 'react'
import { ANCHOR_DATE } from '../../data/periodCycles'
import { useDismiss } from '../../hooks/useDismiss'
import { formatShortDate } from '../../lib/date'
import { CustomDateRangePicker } from '../trends/CustomDateRangePicker'
import { Icon } from '../ui/Icon'

export interface DateRange {
  start: Date
  end: Date
}

interface DateRangePickerProps {
  value: DateRange
  onChange: (range: DateRange) => void
}

export const formatRange = (range: DateRange) => `${formatShortDate(range.start)} – ${formatShortDate(range.end)}`

export function DateRangePicker({ value, onChange }: DateRangePickerProps) {
  const [open, setOpen] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const panelId = useId()

  const close = useCallback(() => {
    setOpen(false)
    triggerRef.current?.focus()
  }, [])
  useDismiss(wrapperRef, close, open)

  return (
    <div ref={wrapperRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(!open)}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        aria-label={`Date range: ${formatRange(value)}`}
        className="flex h-11 items-center gap-2 rounded-full border border-line bg-white px-4 type-button font-medium text-ink shadow-sm transition-colors hover:bg-brand-purple-soft/50"
      >
        <Icon name="calendar" className="size-4 text-brand-purple" />
        {formatRange(value)}
        <Icon name="chevronDown" className="size-3.5 text-muted" />
      </button>
      {open && (
        <div
          id={panelId}
          role="dialog"
          aria-label="Choose date range"
          className="absolute top-[calc(100%+10px)] left-0 z-30 w-[min(330px,calc(100vw-2rem))] rounded-[26px] border border-line bg-white p-4 shadow-pop sm:right-0 sm:left-auto"
        >
          <CustomDateRangePicker
            initialStart={value.start}
            initialEnd={value.end}
            maxDate={ANCHOR_DATE}
            onApply={(start, end) => {
              onChange({ start, end })
              close()
            }}
            onCancel={close}
          />
        </div>
      )}
    </div>
  )
}
