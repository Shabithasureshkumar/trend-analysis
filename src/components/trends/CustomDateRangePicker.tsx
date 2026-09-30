import { useState } from 'react'
import { CalendarRange, type DraftRange } from '../ui/CalendarRange'

interface CustomDateRangePickerProps {
  title?: string
  initialStart: Date
  initialEnd: Date
  maxDate: Date
  onApply: (start: Date, end: Date) => void
  onCancel: () => void
}

/** From/To fields, month calendar and Apply/Cancel – shared by every range selector. */
export function CustomDateRangePicker({ title, initialStart, initialEnd, maxDate, onApply, onCancel }: CustomDateRangePickerProps) {
  const [draft, setDraft] = useState<DraftRange>({ start: initialStart, end: initialEnd })

  const apply = () => {
    if (draft.start) onApply(draft.start, draft.end ?? draft.start)
  }

  return (
    <div>
      {title && <div className="mb-3 type-card font-semibold text-ink">{title}</div>}
      <CalendarRange draft={draft} onChange={setDraft} maxDate={maxDate} />
      <div className="mt-3 flex justify-end gap-2 border-t border-line pt-3">
        <button
          type="button"
          onClick={onCancel}
          className="h-11 rounded-full px-4 type-button font-medium text-body transition-colors hover:bg-brand-purple-soft"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={apply}
          disabled={!draft.start}
          className="h-11 rounded-full bg-brand-pink px-5 type-button font-semibold text-white transition-opacity disabled:opacity-40"
        >
          Apply
        </button>
      </div>
    </div>
  )
}
