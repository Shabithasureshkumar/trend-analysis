import { HEALTH_SCORE, HEALTH_SCORE_FACTORS, SCORE_TIPS } from '../../data/insights'
import { RingGauge } from '../charts/RingGauge'
import { Dialog } from '../ui/Dialog'
import { Icon } from '../ui/Icon'

interface HealthScorePanelProps {
  onClose: () => void
}

export function HealthScorePanel({ onClose }: HealthScorePanelProps) {
  return (
    <Dialog
      label="About your health score"
      onClose={onClose}
      placement="top-end"
      panelClassName="max-h-[calc(100dvh-1rem)] w-full max-w-[516px] overflow-y-auto rounded-[28px] bg-white p-5 shadow-pop sm:max-h-[calc(100dvh-2.5rem)] sm:p-6"
    >
      <div className="flex items-start justify-between gap-3">
        <h2 className="type-card font-bold text-ink">About Your Health Score</h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="-mt-2 -mr-2 grid size-11 place-items-center rounded-full text-body hover:bg-brand-purple-soft"
        >
          <Icon name="close" className="size-[18px]" />
        </button>
      </div>
      <p className="mt-1 type-secondary text-muted">
        Your health score is calculated using multiple factors from your cycle data, lifestyle, and symptoms. It helps
        you understand your overall wellness patterns.
      </p>
      <p className="mt-2 type-label text-muted">
        This is a wellness indicator and does not diagnose medical conditions.
      </p>

      <div className="mt-4 flex items-center gap-4">
        <RingGauge
          value={HEALTH_SCORE.score}
          size={92}
          strokeWidth={11}
          gradient={['#F34F97', '#8b6cf5']}
          trackColor="#f0e6f8"
          ariaLabel={`Health score ${HEALTH_SCORE.score} out of 100`}
        >
          <span className="type-metric font-bold text-ink">{HEALTH_SCORE.score}</span>
          <span className="type-label text-muted">/ 100</span>
        </RingGauge>
        <div className="flex-1 rounded-2xl bg-brand-pink-soft p-4">
          <div className="type-card-sm font-bold text-brand-pink">{HEALTH_SCORE.label}</div>
          <p className="mt-1 type-secondary text-body">
            Your overall wellness is in a good range. A few areas can be improved.
          </p>
        </div>
      </div>

      <h3 className="mt-5 mb-3 type-card-sm font-bold text-ink">How is your score calculated?</h3>
      <ul className="space-y-2.5">
        {HEALTH_SCORE_FACTORS.map((factor) => (
          <li key={factor.id} className="rounded-2xl border border-line bg-white p-3.5">
            <div className="flex items-center justify-between gap-3 type-secondary">
              <span className="font-semibold text-ink">
                {factor.label} <span className="font-medium text-brand-pink">{factor.weight}%</span>
              </span>
              <span className="shrink-0 font-semibold text-body">{factor.score}/100</span>
            </div>
            <div
              role="progressbar"
              aria-label={`${factor.label} score`}
              aria-valuenow={factor.score}
              aria-valuemin={0}
              aria-valuemax={100}
              className="mt-2 h-1 overflow-hidden rounded-full bg-brand-purple-soft"
            >
              <div
                className="h-full rounded-full bg-gradient-to-r from-brand-pink to-[#8b6cf5]"
                style={{ width: `${factor.score}%` }}
              />
            </div>
            <p className="mt-2 type-label text-muted">{factor.description}</p>
          </li>
        ))}
      </ul>

      <section className="mt-4 rounded-2xl bg-brand-pink-soft p-4">
        <h3 className="flex items-center gap-2 type-card-sm font-bold text-ink">
          <Icon name="trendUp" className="size-4" />
          How can you improve your score?
        </h3>
        <ul className="mt-2 list-disc space-y-1 pl-5 type-secondary text-body marker:text-brand-pink">
          {SCORE_TIPS.map((tip) => (
            <li key={tip}>{tip}</li>
          ))}
        </ul>
      </section>
    </Dialog>
  )
}
