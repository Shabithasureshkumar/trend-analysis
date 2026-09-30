import { useState } from 'react'
import { FILTERS, SUMMARY_METRICS, type MetricCategory } from '../../data/insights'
import type { TrendId } from '../../data/trendData'
import { DEFAULT_RANGE, type TrendRangeSelection } from '../../lib/trendRange'
import { downloadCsv } from '../../lib/csv'
import { TrendExpandedModal } from '../trends/TrendExpandedModal'
import { Icon } from '../ui/Icon'
import { DateRangePicker, formatRange, type DateRange } from './DateRangePicker'
import { HealthScorePanel } from './HealthScorePanel'
import { MetricCards } from './MetricCards'
import { SummaryRow } from './SummaryRow'
import { TrendCard } from './TrendCard'
import { TREND_CARDS } from './trendCards'

interface InsightsPageProps {
  query: string
}

type Filter = 'all' | MetricCategory

const slug = (text: string) => text.toLowerCase().replace(/[^a-z0-9]+/g, '-')

export function InsightsPage({ query }: InsightsPageProps) {
  const [filter, setFilter] = useState<Filter>('all')
  const [reportRange, setReportRange] = useState<DateRange>({ start: new Date(2026, 5, 1), end: new Date(2026, 5, 30) })
  const [scoreOpen, setScoreOpen] = useState(false)
  const [expandedId, setExpandedId] = useState<TrendId | null>(null)
  const [range, setRange] = useState<TrendRangeSelection>(DEFAULT_RANGE)

  const normalizedQuery = query.trim().toLowerCase()
  const visibleCards = TREND_CARDS.filter(
    (card) =>
      (filter === 'all' || card.categories.includes(filter)) &&
      (normalizedQuery === '' || card.title.toLowerCase().includes(normalizedQuery)),
  )
  const openTrend = (id: TrendId) => {
    setRange(DEFAULT_RANGE)
    setExpandedId(id)
  }

  const exportReport = () => {
    const rows: (string | number)[][] = [
      ['Trend Analysis report'],
      ['Range', formatRange(reportRange)],
      [],
      ['Summary metric', 'Value', 'Change'],
      ...SUMMARY_METRICS.map((metric) => [metric.label, metric.value, metric.delta]),
    ]
    for (const card of TREND_CARDS) rows.push([], [card.title], ...card.csv())
    downloadCsv('trend-analysis-report.csv', rows)
  }

  return (
    <>
      <SummaryRow onViewScore={() => setScoreOpen(true)} />

      <section aria-labelledby="trend-title" className="mt-9">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-purple-soft px-2.5 py-1 type-badge font-bold tracking-[0.12em] text-brand-purple">
              <Icon name="sparkle" className="size-2.5" />
              ANALYTICS
            </span>
            <h2 id="trend-title" className="mt-2 type-trend-title font-bold text-ink ">
              Trend Analysis
            </h2>
            <p className="mt-1 type-body text-muted">Advanced analytics to understand your menstrual health over time.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <DateRangePicker value={reportRange} onChange={setReportRange} />
            <button
              type="button"
              onClick={exportReport}
              className="flex h-11 items-center gap-2 rounded-full bg-gradient-to-r from-[#F34F97] to-[#F34F97] px-5 type-button font-semibold text-white shadow-[0_10px_22px_-8px_rgb(236_72_153/0.7)]"
            >
              <Icon name="download" className="size-3.5" />
              Export Report
            </button>
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div role="group" aria-label="Filter metrics" className="flex flex-wrap gap-2">
            {FILTERS.map((item) => {
              const active = item.id === filter
              return (
                <button
                  key={item.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setFilter(item.id)}
                  className="group inline-flex h-11 items-center"
                >
                  <span
                    className={`inline-flex h-11 items-center rounded-full px-4 type-button font-medium transition-colors sm:h-9 sm:px-5 ${
                      active
                        ? 'bg-gradient-to-r from-[#4b2fd8] to-[#6C4DE8] font-semibold text-white shadow-[0_8px_18px_-8px_rgb(75_47_216/0.7)]'
                        : 'border border-line bg-white text-body group-hover:bg-brand-purple-soft/60'
                    }`}
                  >
                    {item.label}
                  </span>
                </button>
              )
            })}
          </div>
          <div role="group" className="flex items-center gap-4 type-label text-muted" aria-label="Current cycle phase">
            <span className="inline-flex items-center gap-1.5">
              <span className="size-1.5 rounded-full bg-muted/60" aria-hidden="true" />
              Follicular
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-purple-soft px-3 py-1.5 font-semibold text-brand-purple">
              <Icon name="moon" className="size-3" />
              Luteal · Day 22
            </span>
          </div>
        </div>

        <MetricCards />

        {visibleCards.length > 0 ? (
          <div className="mt-5 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {visibleCards.map((card) => (
              <TrendCard
                key={card.id}
                title={card.title}
                subtitle={card.subtitle}
                tint={card.tint}
                insight={card.insight}
                insightTitle={card.insightTitle}
                className={card.fullWidth ? 'md:col-span-2 xl:col-span-3' : ''}
                onExpand={() => openTrend(card.id)}
                onDownload={() => downloadCsv(`${slug(card.title)}.csv`, card.csv())}
              >
                {card.render()}
              </TrendCard>
            ))}
          </div>
        ) : (
          <p role="status" className="mt-6 rounded-[24px] border border-line bg-white p-8 text-center type-body text-muted">
            No trend cards match your search or filter.
          </p>
        )}
      </section>

      {scoreOpen && <HealthScorePanel onClose={() => setScoreOpen(false)} />}
      {expandedId && (
        <TrendExpandedModal
          trendType={expandedId}
          selectedRange={range}
          onRangeChange={setRange}
          onClose={() => setExpandedId(null)}
        />
      )}
    </>
  )
}
