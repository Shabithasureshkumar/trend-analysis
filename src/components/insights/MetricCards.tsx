import { SUMMARY_METRICS } from '../../data/insights'
import { Icon } from '../ui/Icon'

const TONES = {
  purple: 'bg-brand-purple-soft text-brand-purple',
  pink: 'bg-brand-pink-soft text-brand-pink',
  blue: 'bg-sky-50 text-sky-500',
} as const

export function MetricCards() {
  return (
    <ul className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-6">
      {SUMMARY_METRICS.map((metric) => (
        <li key={metric.id} className="rounded-[24px] border border-line bg-white p-5 shadow-card">
          <div className="flex items-center justify-between">
            <span className={`grid size-9 place-items-center rounded-xl ${TONES[metric.tone]}`}>
              <Icon name={metric.icon} className="size-[18px]" />
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-2 py-0.5 type-badge font-semibold text-success">
              <Icon name={metric.trend === 'up' ? 'trendUp' : 'trendDown'} className="size-3" />
              {metric.delta}
              <span className="sr-only"> change</span>
            </span>
          </div>
          <div className="mt-4 type-metric font-bold text-ink">{metric.value}</div>
          <div className="mt-1.5 type-secondary text-muted">{metric.label}</div>
        </li>
      ))}
    </ul>
  )
}
