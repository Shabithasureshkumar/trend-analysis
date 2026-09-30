import { useCallback, useEffect, useId, useRef, useState, type KeyboardEvent } from 'react'
import { ANCHOR_DATE, DEFAULT_CUSTOM_RANGE } from '../../data/periodCycles'
import { useDismiss } from '../../hooks/useDismiss'
import { rangeLabel, type PresetRange, type TrendRangeSelection } from '../../lib/trendRange'
import { Icon } from '../ui/Icon'
import { CustomDateRangePicker } from './CustomDateRangePicker'
import { TrendRangeMenu } from './TrendRangeMenu'

type View = 'closed' | 'menu' | 'calendar'

interface TrendRangeSelectorProps {
  selection: TrendRangeSelection
  onChange: (selection: TrendRangeSelection) => void
}

const ITEM_SELECTOR = '[role="menuitemradio"]'

/** The one range control used by every expanded trend. */
export function TrendRangeSelector({ selection, onChange }: TrendRangeSelectorProps) {
  const [view, setView] = useState<View>('closed')
  const wrapperRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const calendarRef = useRef<HTMLDivElement>(null)
  const popoverId = useId()

  const close = useCallback(() => {
    setView('closed')
    triggerRef.current?.focus()
  }, [])
  useDismiss(wrapperRef, close, view !== 'closed')

  useEffect(() => {
    if (view === 'menu') {
      const checked = menuRef.current?.querySelector<HTMLElement>('[aria-checked="true"]')
      ;(checked ?? menuRef.current?.querySelector<HTMLElement>(ITEM_SELECTOR))?.focus()
    } else if (view === 'calendar') {
      calendarRef.current?.querySelector<HTMLElement>('button[tabindex="0"][data-date]')?.focus()
    }
  }, [view])

  const handleMenuKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const items = Array.from(menuRef.current?.querySelectorAll<HTMLElement>(ITEM_SELECTOR) ?? [])
    const index = items.findIndex((item) => item === document.activeElement)
    let next: number | null = null
    if (event.key === 'ArrowDown') next = (index + 1) % items.length
    else if (event.key === 'ArrowUp') next = (index - 1 + items.length) % items.length
    else if (event.key === 'Home') next = 0
    else if (event.key === 'End') next = items.length - 1
    else if (event.key === 'Tab') setView('closed')
    if (next !== null) {
      event.preventDefault()
      items[next]?.focus()
    }
  }

  const selectPreset = (range: PresetRange) => {
    onChange({ range })
    close()
  }

  const applyCustom = (start: Date, end: Date) => {
    onChange({ range: 'custom', start, end })
    close()
  }

  const custom = selection.range === 'custom' ? selection : { ...DEFAULT_CUSTOM_RANGE }

  return (
    <div ref={wrapperRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setView(view === 'closed' ? 'menu' : 'closed')}
        aria-haspopup="menu"
        aria-expanded={view !== 'closed'}
        aria-controls={view === 'closed' ? undefined : popoverId}
        className="flex h-11 w-full items-center gap-2.5 rounded-full border border-brand-pink/25 bg-brand-pink-soft/40 px-4 type-body font-medium text-ink transition-colors hover:bg-brand-pink-soft sm:w-auto sm:min-w-[210px]"
      >
        <Icon name="calendar" className="size-[18px] text-brand-pink" />
        <span className="flex-1 text-left">{rangeLabel(selection)}</span>
        <Icon name={view === 'menu' ? 'chevronUp' : 'chevronDown'} className="size-4 text-body" />
      </button>

      {view === 'menu' && (
        <TrendRangeMenu
          id={popoverId}
          ref={menuRef}
          selection={selection}
          onPreset={selectPreset}
          onCustom={() => setView('calendar')}
          onKeyDown={handleMenuKeyDown}
        />
      )}

      {view === 'calendar' && (
        <div
          id={popoverId}
          ref={calendarRef}
          role="group"
          aria-label="Custom range"
          className="absolute top-[calc(100%+12px)] right-0 z-20 w-[min(330px,calc(100vw-3rem))] rounded-[26px] border border-brand-pink/15 bg-white p-4 shadow-pop sm:p-[18px]"
        >
          <CustomDateRangePicker
            title="Custom Range"
            initialStart={custom.start}
            initialEnd={custom.end}
            maxDate={ANCHOR_DATE}
            onApply={applyCustom}
            onCancel={close}
          />
        </div>
      )}
    </div>
  )
}
