import { forwardRef, type KeyboardEvent } from 'react'
import { RANGE_OPTIONS, type PresetRange, type TrendRangeSelection } from '../../lib/trendRange'
import { Icon } from '../ui/Icon'

interface TrendRangeMenuProps {
  id: string
  selection: TrendRangeSelection
  onPreset: (range: PresetRange) => void
  onCustom: () => void
  onKeyDown: (event: KeyboardEvent<HTMLDivElement>) => void
}

const ITEM = 'flex h-11 w-full items-center gap-3 rounded-2xl px-3 type-body transition-colors'
const ACTIVE = 'bg-brand-pink-soft font-semibold text-ink'
const IDLE = 'text-body hover:bg-brand-purple-soft/60'

export const TrendRangeMenu = forwardRef<HTMLDivElement, TrendRangeMenuProps>(function TrendRangeMenu(
  { id, selection, onPreset, onCustom, onKeyDown },
  ref,
) {
  return (
    <div
      id={id}
      ref={ref}
      role="menu"
      aria-label="Trend range"
      onKeyDown={onKeyDown}
      className="absolute top-[calc(100%+12px)] right-0 z-20 w-[min(232px,calc(100vw-3rem))] rounded-[24px] border border-brand-pink/15 bg-white p-2 shadow-pop"
    >
      <div className="px-3 pt-2.5 pb-2 type-label font-semibold tracking-[0.1em] text-muted uppercase">Trend Range</div>
      {RANGE_OPTIONS.map((option) => {
        const checked = selection.range === option.range
        return (
          <button
            key={option.range}
            type="button"
            role="menuitemradio"
            aria-checked={checked}
            onClick={() => onPreset(option.range)}
            className={`${ITEM} ${checked ? ACTIVE : IDLE}`}
          >
            <Icon name="calendar" className={`size-[18px] ${checked ? 'text-brand-pink' : 'text-muted'}`} />
            <span className="flex-1 text-left">{option.label}</span>
            {checked && <Icon name="check" className="size-4 text-brand-pink" strokeWidth={2.4} />}
          </button>
        )
      })}
      <div className="mx-2 my-1.5 h-px bg-line" />
      <button
        type="button"
        role="menuitemradio"
        aria-checked={selection.range === 'custom'}
        aria-haspopup="dialog"
        onClick={onCustom}
        className={`${ITEM} ${selection.range === 'custom' ? ACTIVE : IDLE}`}
      >
        <Icon name="calendar" className={`size-[18px] ${selection.range === 'custom' ? 'text-brand-pink' : 'text-muted'}`} />
        <span className="flex-1 text-left">Custom Range</span>
        <Icon name="chevronRight" className="size-4 text-muted" />
      </button>
    </div>
  )
})
