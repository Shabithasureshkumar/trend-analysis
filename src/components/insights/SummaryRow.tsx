import { HEALTH_SCORE, PREDICTIONS, RECOMMENDATIONS } from '../../data/insights'
import { RingGauge } from '../charts/RingGauge'
import { Icon } from '../ui/Icon'

const SECTION_TITLE = 'mb-3 type-heading font-bold text-ink'

interface SummaryRowProps {
  onViewScore: () => void
}

export function SummaryRow({ onViewScore }: SummaryRowProps) {
  return (
    <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
      <section aria-labelledby="health-score-title" className="flex min-w-0 flex-col">
        <h2 id="health-score-title" className={SECTION_TITLE}>
          Health Score
        </h2>
        <div className="relative flex flex-1 items-center justify-between gap-4 overflow-hidden rounded-[28px] border border-line bg-white p-5 shadow-card sm:p-6">
          <div
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_0%_0%,#FFF0F6_0%,transparent_50%)]"
            aria-hidden="true"
          />
          <div className="relative min-w-0">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="type-card font-bold text-ink">{HEALTH_SCORE.label}</span>
              <button type="button" onClick={onViewScore} className="-my-2 inline-flex h-11 items-center">
                <span className="inline-flex h-7 items-center gap-1 rounded-full border border-brand-pink/30 bg-brand-pink-soft px-2.5 type-button font-semibold text-brand-pink">
                  <Icon name="eye" className="size-3" />
                  View more
                </span>
                <span className="sr-only"> about your health score</span>
              </button>
            </div>
            <p className="mt-2 max-w-[200px] type-secondary text-muted">{HEALTH_SCORE.summary}</p>
            <p className="mt-3 inline-flex items-center gap-1.5 type-secondary font-semibold text-success">
              <Icon name="trendUp" className="size-3.5" />
              {HEALTH_SCORE.change}
            </p>
          </div>
          <RingGauge
            value={HEALTH_SCORE.score}
            size={120}
            strokeWidth={14}
            gradient={['#F34F97', '#8b6cf5']}
            trackColor="#f0e6f8"
            ariaLabel={`Health score ${HEALTH_SCORE.score} out of 100`}
          >
            <span className="type-score font-bold text-ink">{HEALTH_SCORE.score}</span>
            <span className="mt-0.5 type-label text-muted">/ 100</span>
          </RingGauge>
        </div>
      </section>

      <section aria-labelledby="predictions-title" className="flex min-w-0 flex-col">
        <h2 id="predictions-title" className={SECTION_TITLE}>
          Predictions
        </h2>
        <ul className="flex flex-1 flex-col gap-2.5">
          {PREDICTIONS.map((item) => (
            <li
              key={item.id}
              className="flex flex-1 items-center gap-3 rounded-[22px] border border-line bg-white px-4 py-2.5 shadow-card"
            >
              <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-brand-pink-soft text-brand-pink">
                <Icon name={item.icon} className="size-[18px]" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="type-card-sm font-semibold text-ink">{item.title}</div>
                <div className="type-label text-muted">{item.subtitle}</div>
              </div>
              <div className="shrink-0 text-right">
                <div
                  className={`type-card-sm font-bold ${item.valueTone === 'pink' ? 'text-brand-pink' : 'text-brand-purple'}`}
                >
                  {item.value}
                </div>
                <div className="type-label text-muted">{item.note}</div>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="recommendations-title" className="flex min-w-0 flex-col md:col-span-2 lg:col-span-1">
        <h2 id="recommendations-title" className={SECTION_TITLE}>
          AI Recommendations
        </h2>
        <ul className="flex flex-1 flex-col gap-2.5">
          {RECOMMENDATIONS.map((item) => (
            <li
              key={item.id}
              className="flex flex-1 items-center gap-3 rounded-[22px] bg-gradient-to-r from-brand-purple-soft/80 to-brand-pink-soft/70 px-4 py-2.5"
            >
              <span className="grid size-7 shrink-0 place-items-center rounded-full border border-brand-pink/25 bg-white text-brand-pink">
                <Icon name="sparkle" className="size-3.5" />
              </span>
              <div className="min-w-0">
                <div className="type-card-sm font-semibold text-ink">{item.title}</div>
                <p className="mt-0.5 type-secondary text-body">{item.body}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
