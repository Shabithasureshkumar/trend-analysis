import { TRENDS, type TrendDefinition, type TrendId } from '../../data/trendData'
import { bucketLabel, buildTrendView, type InsightSentence, type TrendView } from '../../lib/trendSummary'
import { rangePhrase, type TrendRangeSelection } from '../../lib/trendRange'
import { BarChart } from '../charts/BarChart'
import { LineChart } from '../charts/LineChart'
import { IntensityLegend, SymptomHeatmap } from '../insights/SymptomHeatmap'
import { Dialog } from '../ui/Dialog'
import { Icon } from '../ui/Icon'
import { TrendRangeSelector } from './TrendRangeSelector'

interface TrendExpandedModalProps {
  trendType: TrendId
  selectedRange: TrendRangeSelection
  onRangeChange: (selection: TrendRangeSelection) => void
  onClose: () => void
}

const chartHeight = (width: number) => (width < 520 ? 250 : 340)

function TrendChart({ def, view }: { def: TrendDefinition; view: TrendView }) {
  const labels = view.buckets.map(bucketLabel)
  const primary = view.buckets.map((bucket) => bucket.values[0] ?? 0)
  const points = view.buckets.length
  const referenceLines = (() => {
    if (!def.reference) return []
    if (def.reference.kind === 'goal') return [{ value: def.reference.value, label: def.reference.label, color: '#93c5fd' }]
    return view.average === null
      ? []
      : [{ value: view.average, label: `Avg ${def.formatValue(view.average)}`, color: '#cfc6ea', labelPosition: 'below' as const }]
  })()
  const common = {

    yDomain: def.yDomain,
    yTicks: def.yTicks,
    formatY: def.formatTick,
    height: chartHeight,
    margin: def.formatTick ? { left: 46 } : undefined,
  }

  if (def.kind === 'heatmap') {
    const peak = Math.max(...view.buckets.flatMap((bucket) => bucket.values), 0.01)
    return (
      <>
        <div className="mb-3">
          <IntensityLegend />
        </div>
        <SymptomHeatmap
          columnLabels={view.buckets.map((bucket) => String(bucket.date.getDate()))}
          rows={def.series.map((series, i) => ({
            symptom: series.label,
            levels: view.buckets.map((b) => ((b.values[i] ?? 0) / peak) * 4),
          }))}
        />
        <p className="mt-3 type-secondary text-muted">
          Each column averages the days from the date shown; colour is relative to your highest value ({view.bucketDays} {view.bucketDays === 1 ? 'day' : 'days'} per column).
        </p>
      </>
    )
  }
  if (def.kind === 'bar') {
    return (
      <BarChart
        {...common}
        labels={labels}
        ariaLabel={`${def.title} for the selected range`}
        values={primary}
        gradient={def.gradient ?? ['#f9a8d4', '#F34F97']}
        referenceLines={referenceLines}
      />
    )
  }
  const lineSeries =
    def.kind === 'multiline'
      ? def.series.map((series, i) => ({
          id: series.id,
          color: series.color,
          values: view.buckets.map((b) => b.values[i] ?? 0),
          dots: 'none' as const,
        }))
      : [
          {
            id: def.id,
            color: def.series[0]?.color ?? '#F34F97',
            gradient: def.gradient,
            values: primary,
            fill: true,
            dots: points <= 16 ? ('all' as const) : ('none' as const),
          },
        ]
  return (
    <LineChart
      {...common}
      xLabels={labels}
      ariaLabel={`${def.title} for the selected range`}
      series={lineSeries}
      referenceLines={def.kind === 'multiline' ? [] : referenceLines}
    />
  )
}

function Sentence({ parts }: { parts: InsightSentence }) {
  return (
    <p>
      {parts.map((part, i) =>
        typeof part === 'string' ? (
          part
        ) : (
          <strong key={i} className="font-semibold text-ink">
            {part.bold}
          </strong>
        ),
      )}
    </p>
  )
}

/** The single expanded-trend modal; only the trend data changes between cards. */
export function TrendExpandedModal({ trendType, selectedRange, onRangeChange, onClose }: TrendExpandedModalProps) {
  const def = TRENDS[trendType]
  const view = buildTrendView(def, selectedRange)

  return (
    <Dialog
      label={def.title}
      onClose={onClose}
      panelClassName="max-h-[calc(100dvh-1rem)] w-full max-w-[1060px] overflow-y-auto rounded-[28px] bg-white p-5 shadow-pop sm:max-h-[calc(100dvh-2.5rem)] sm:rounded-[36px] sm:p-8 lg:p-10"
    >
      <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-4">
        <div className="min-w-0 flex-1">
          <h2 className="type-section font-bold text-ink ">{def.title}</h2>
          <p className="mt-1.5 type-body text-muted ">
            {def.lead} · {rangePhrase(selectedRange)}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="order-2 grid size-11 shrink-0 place-items-center rounded-full text-body transition-colors hover:bg-brand-purple-soft sm:order-3"
        >
          <Icon name="close" className="size-5" />
        </button>
        <div className="order-3 w-full sm:order-2 sm:w-auto">
          <TrendRangeSelector selection={selectedRange} onChange={onRangeChange} />
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_200px] lg:gap-8">
        <div className="min-h-[260px] min-w-0">
          {view.buckets.length > 0 ? (
            <TrendChart def={def} view={view} />
          ) : (
            <div className="grid h-[260px] place-items-center rounded-3xl bg-brand-purple-soft/40 px-4 text-center type-body text-muted">
              No data in this range. Try a wider range.
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-1 lg:content-start">
          {(view.cards.length > 0 ? view.cards : [{ label: def.countLabel, value: '0', dot: '#22c55e' }]).map((card) => (
            <div key={card.label} className="min-w-0 rounded-[22px] border border-line bg-white/80 px-3.5 py-3.5 sm:px-4 shadow-sm">
              <div className="flex items-center gap-2 type-secondary text-body">
                <span className="size-2 shrink-0 rounded-full" style={{ backgroundColor: card.dot }} aria-hidden="true" />
                <span>{card.label}</span>
              </div>
              <div className="mt-1 break-words type-metric font-bold text-ink">{card.value}</div>
            </div>
          ))}
        </div>
      </div>

      <section
        aria-labelledby="key-insights-title"
        className="mt-6 rounded-[24px] bg-gradient-to-r from-brand-purple-soft via-[#fbf1fa] to-brand-pink-soft p-5 sm:p-6"
      >
        <h3 id="key-insights-title" className="mb-3 flex items-center gap-2.5 type-card font-semibold text-ink">
          <Icon name="sparkle" className="size-5 text-brand-purple" />
          Key Insights
        </h3>
        {view.insights.length > 0 ? (
          <div className="grid grid-cols-1 gap-3 type-body text-body md:grid-cols-3 md:gap-8">
            {view.insights.map((parts, i) => (
              <Sentence key={i} parts={parts} />
            ))}
          </div>
        ) : (
          <p className="type-body text-body">No logged data falls in this range. Try a wider range.</p>
        )}
      </section>
    </Dialog>
  )
}
