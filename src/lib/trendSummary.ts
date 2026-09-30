import type { Observation, TrendDefinition } from '../data/trendData'
import { formatAxisDate, startOfDay } from './date'
import { isWithin, rangeBounds, rangeScope, type TrendRangeSelection } from './trendRange'

export interface Bucket {
  date: Date
  values: number[]
  /** Overrides the date-based axis label (e.g. "D14"). */
  label?: string
}

export interface StatCard {
  label: string
  value: string
  dot: string
}

/** A sentence made of plain and bold segments. */
export type InsightSentence = (string | { bold: string })[]

export interface TrendView {
  observationCount: number
  buckets: Bucket[]
  average: number | null
  cards: StatCard[]
  insights: InsightSentence[]
  /** Days covered by one chart bucket (1 for cycle-based trends). */
  bucketDays: number
}

const MAX_BUCKETS = 24
const MAX_HEATMAP_COLUMNS = 14
const DOTS = ['#F34F97', '#6C4DE8', '#0ea5e9', '#22c55e', '#f59e0b']

const mean = (values: number[]) => values.reduce((sum, v) => sum + v, 0) / values.length

function bucketize(observations: Observation[], limit: number, aggregate: 'mean' | 'max'): Bucket[] {
  const size = Math.max(1, Math.ceil(observations.length / limit))
  const buckets: Bucket[] = []
  for (let i = 0; i < observations.length; i += size) {
    const chunk = observations.slice(i, i + size)
    const first = chunk[0]
    if (!first) continue
    const values = first.values.map((_, series) => {
      const column = chunk.map((o) => o.values[series] ?? 0)
      return aggregate === 'max' ? Math.max(...column) : mean(column)
    })
    buckets.push({ date: first.date, values })
  }
  return buckets
}

const MAX_CYCLE_DAY = 28

/** Average value per cycle day (D1–D28) across every cycle in the range. */
function cycleDayProfile(observations: Observation[]): Bucket[] {
  const groups = new Map<number, Observation[]>()
  for (const observation of observations) {
    const day = observation.cycleDay
    if (day === undefined || day > MAX_CYCLE_DAY) continue
    groups.set(day, [...(groups.get(day) ?? []), observation])
  }
  return [...groups.entries()]
    .sort(([a], [b]) => a - b)
    .flatMap(([day, group]) => {
      const first = group[0]
      if (!first) return []
      const values = first.values.map((_, series) => mean(group.map((o) => o.values[series] ?? 0)))
      return [{ date: first.date, values, label: `D${day}` }]
    })
}

function heatmapSummary(def: TrendDefinition, buckets: Bucket[], scope: string) {
  const averages = def.series.map((series, i) => ({
    label: series.label,
    value: mean(buckets.map((b) => b.values[i] ?? 0)),
  }))
  const sorted = [...averages].sort((a, b) => b.value - a.value)
  const top = sorted[0]
  const bottom = sorted[sorted.length - 1]
  if (!top || !bottom) return null
  const overall = mean(averages.map((a) => a.value))
  return {
    cards: [
      { label: 'Most frequent', value: top.label, dot: DOTS[0] ?? '' },
      { label: 'Least frequent', value: bottom.label, dot: DOTS[1] ?? '' },
      { label: 'Avg intensity', value: `${overall.toFixed(1)} / 4`, dot: DOTS[2] ?? '' },
    ],
    insights: [
      ['Across ', scope, ', ', { bold: top.label }, ` was your most frequent symptom (avg ${top.value.toFixed(1)} / 4).`],
      [{ bold: bottom.label }, ` was the least frequent (avg ${bottom.value.toFixed(1)} / 4).`],
      ['Overall symptom intensity averaged ', { bold: `${overall.toFixed(1)} / 4` }, ' over the range.'],
    ] satisfies InsightSentence[],
  }
}

function hormoneSummary(def: TrendDefinition, buckets: Bucket[], scope: string) {
  const column = (i: number) => buckets.map((b) => b.values[i] ?? 0)
  const averages = def.series.map((_, i) => mean(column(i)))
  const lhIndex = def.series.findIndex((s) => s.id === 'lh')
  const lhValues = column(lhIndex)
  const lhPeak = Math.max(...lhValues)
  const lhBucket = buckets[lhValues.indexOf(lhPeak)]
  return {
    cards: def.series.map((series, i) => ({
      label: `${series.label} avg`,
      value: averages[i]?.toFixed(0) ?? '—',
      dot: series.color,
    })),
    insights: [
      ['Across ', scope, ', estrogen averaged ', { bold: (averages[0] ?? 0).toFixed(0) }, ' and progesterone ', { bold: (averages[1] ?? 0).toFixed(0) }, ' (relative units).'],
      ['LH peaked at ', { bold: lhPeak.toFixed(0) }, lhBucket ? ` around ${bucketLabel(lhBucket)} — the ovulation surge.` : '.'],
      [`FSH averaged ${(averages[3] ?? 0).toFixed(0)}, consistent with a normal follicular rise.`],
    ] satisfies InsightSentence[],
  }
}

function singleSummary(def: TrendDefinition, buckets: Bucket[], scope: string, observationCount: number) {
  const values = buckets.map((b) => b.values[0] ?? 0)
  const average = mean(values)
  const max = Math.max(...values)
  const min = Math.min(...values)
  const maxCount = values.filter((v) => v === max).length
  const maxBucket = buckets[values.indexOf(max)]
  const fmt = def.formatValue
  return {
    average,
    cards: [
      { label: 'Average', value: fmt(average), dot: DOTS[0] ?? '' },
      { label: def.highLabel, value: fmt(max), dot: DOTS[1] ?? '' },
      { label: def.lowLabel, value: fmt(min), dot: DOTS[2] ?? '' },
      { label: def.countLabel, value: String(observationCount), dot: DOTS[3] ?? '' },
    ],
    insights: [
      ['Across ', scope, `, your ${def.noun} averaged `, { bold: fmt(average) }, ` — ${def.assess(average)}`],
      [
        'Variation of ',
        { bold: fmt(max - min) },
        ` ${def.spread.endsWith('.') ? def.spread : `${def.spread}.`}`,
      ],
      [def.peakText(max, maxCount, maxBucket ? bucketLabel(maxBucket) : '')],
    ] satisfies InsightSentence[],
  }
}

/** Filters a trend's observations to the selected range and derives chart buckets, stats and insights. */
export function buildTrendView(def: TrendDefinition, selection: TrendRangeSelection): TrendView {
  const bounds = rangeBounds(selection)
  const observations = def.observations.filter((o) => isWithin(o.date, bounds))
  const empty: TrendView = { observationCount: 0, buckets: [], average: null, cards: [], insights: [], bucketDays: 1 }
  if (observations.length === 0) return empty

  const limit = def.kind === 'heatmap' ? MAX_HEATMAP_COLUMNS : MAX_BUCKETS
  const buckets = def.byCycleDay ? cycleDayProfile(observations) : bucketize(observations, limit, def.aggregate)
  const bucketDays = def.byCycleDay ? 1 : Math.max(1, Math.ceil(observations.length / limit))
  const scope = rangeScope(selection)
  const countCard: StatCard = { label: def.countLabel, value: String(observations.length), dot: DOTS[3] ?? '' }

  if (def.kind === 'heatmap') {
    const summary = heatmapSummary(def, buckets, scope)
    return { ...empty, observationCount: observations.length, buckets, bucketDays, ...(summary && { cards: [...summary.cards, countCard], insights: summary.insights }) }
  }
  if (def.kind === 'multiline') {
    const summary = hormoneSummary(def, buckets, scope)
    return { ...empty, observationCount: observations.length, buckets, bucketDays, cards: [...summary.cards, countCard], insights: summary.insights }
  }
  const summary = singleSummary(def, buckets, scope, observations.length)
  return { observationCount: observations.length, buckets, bucketDays, average: summary.average, cards: summary.cards, insights: summary.insights }
}

export const bucketLabel = (bucket: Bucket) => bucket.label ?? formatAxisDate(startOfDay(bucket.date))
