export const CYCLE_TABS = ['Overview', 'Calendar', 'Daily Log', 'Insights', 'Settings'] as const

interface CycleTabsProps {
  active: string
  onSelect: (tab: string) => void
}

export function CycleTabs({ active, onSelect }: CycleTabsProps) {
  return (
    <nav
      aria-label="Cycle Tracker"
      className="mt-4 grid grid-cols-5 gap-0.5 rounded-full border border-line bg-gradient-to-r from-brand-pink-soft/70 via-white to-brand-pink-soft/60 p-1 sm:flex sm:gap-3 sm:p-1.5 lg:gap-6"
    >
      {CYCLE_TABS.map((tab) => {
        const isActive = tab === active
        return (
          <button
            key={tab}
            type="button"
            aria-current={isActive ? 'page' : undefined}
            onClick={() => onSelect(tab)}
            className={`h-11 min-w-0 rounded-full px-0.5 text-[11px] font-medium whitespace-nowrap transition-colors min-[360px]:text-xs min-[390px]:text-[13px] sm:type-nav sm:px-6 ${
              isActive
                ? 'bg-white font-semibold text-brand-pink shadow-[0_6px_16px_-6px_rgb(236_72_153/0.45)]'
                : 'text-body hover:bg-white/60 hover:text-brand-pink'
            }`}
          >
            {tab}
          </button>
        )
      })}
    </nav>
  )
}
