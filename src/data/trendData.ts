import { addDays } from '../lib/date'
import { ANCHOR_DATE, PERIOD_CYCLES } from './periodCycles'
import { cycleLength, heatmap as heatmapSample } from './insights'

export type TrendId =
  | 'cycle-length'
  | 'period-length'
  | 'flow'
  | 'pain'
  | 'mood'
  | 'sleep'
  | 'water'
  | 'exercise'
  | 'weight'
  | 'bbt'
  | 'hormones'
  | 'regularity'
  | 'heatmap'

export type TrendKind = 'line' | 'bar' | 'multiline' | 'heatmap'

export interface Observation {
  date: Date
  values: number[]
  /** Day within the menstrual cycle (1 = first day of period). */
  cycleDay?: number
}

export interface SeriesMeta {
  id: string
  label: string
  color: string
}

export interface TrendDefinition {
  id: TrendId
  title: string
  /** Subtitle lead; the selected range is appended ("Duration of bleeding · last 12 cycles"). */
  lead: string
  kind: TrendKind
  series: SeriesMeta[]
  gradient?: [string, string]
  observations: Observation[]
  /** How raw observations collapse into chart buckets. */
  aggregate: 'mean' | 'max'
  /** Cyclic trends show the average profile per cycle day instead of a calendar timeline. */
  byCycleDay?: boolean
  yDomain: [number, number]
  yTicks: number[]
  formatTick?: (value: number) => string
  formatValue: (value: number) => string
  noun: string
  highLabel: string
  lowLabel: string
  countLabel: string
  spread: string
  assess: (average: number) => string
  peakText: (max: number, count: number, date: string) => string
  reference?: { kind: 'average' } | { kind: 'goal'; value: number; label: string }
}

const round1 = (n: number) => Math.round(n * 10) / 10
const fixed = (digits: number, suffix: string) => (value: number) => `${Number(value.toFixed(digits))}${suffix}`
const gaussian = (x: number, center: number, spread: number) => Math.exp(-(((x - center) / spread) ** 2))
const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max)

/** Deterministic pseudo-random value in [0, 1) so the demo data is stable between renders. */
function noise(index: number, salt: number) {
  const x = Math.sin(index * 12.9898 + salt * 78.233) * 43758.5453
  return x - Math.floor(x)
}

interface DayContext {
  date: Date
  index: number
  cycleDay: number
  cycleLength: number
  ovulationDay: number
}

function buildDays(): DayContext[] {
  const starts = PERIOD_CYCLES.map((cycle) => cycle.start)
  const first = starts[0]
  if (!first) return []
  const days: DayContext[] = []
  let cursor = 0
  for (let date = first, index = 0; date.getTime() <= ANCHOR_DATE.getTime(); date = addDays(date, 1), index += 1) {
    while (starts[cursor + 1] && (starts[cursor + 1]?.getTime() ?? Infinity) <= date.getTime()) cursor += 1
    const start = starts[cursor] ?? first
    const next = starts[cursor + 1] ?? addDays(start, 28)
    const length = Math.round((next.getTime() - start.getTime()) / 86_400_000)
    const cycleDay = Math.round((date.getTime() - start.getTime()) / 86_400_000) + 1
    days.push({ date, index, cycleDay, cycleLength: length, ovulationDay: length - 14 })
  }
  return days
}

const DAYS = buildDays()

const daily = (build: (day: DayContext) => number[]): Observation[] =>
  DAYS.map((day) => ({ date: day.date, cycleDay: day.cycleDay, values: build(day) }))

const perCycle = (values: number[]): Observation[] =>
  PERIOD_CYCLES.map((cycle, i) => ({ date: cycle.start, values: [values[i] ?? 0] }))

const FLOW = [2.5, 3.3, 4, 3, 2, 1, 0.5]
const PAIN = [6, 8, 5, 3, 2, 1, 0.5]

const hormoneSeries = (d: DayContext) => {
  const x = d.cycleDay
  const od = d.ovulationDay
  return [
    round1(clamp(15 + 62 * gaussian(x, od - 1.5, 2.8) + 32 * gaussian(x, od + 7, 3.5), 0, 100)),
    round1(6 + 52 * gaussian(x, od + 6.5, 3.2)),
    round1(8 + 92 * gaussian(x, od, 1.1)),
    round1(24 + 48 * gaussian(x, od - 0.8, 1.7)),
  ]
}

const SYMPTOMS = heatmapSample.map((row) => row.symptom)

const symptomLevels = (d: DayContext, n: number) => {
  const x = d.cycleDay
  const len = d.cycleLength
  const od = d.ovulationDay
  const base = [
    x <= 4 ? 3.4 : x <= 6 ? 2 : 0.6,
    1.2 + gaussian(x, od, 2),
    x <= 4 ? 3 : x > len - 6 ? 2.6 : 0.8,
    x <= 3 ? 3 : x > len - 4 ? 2.5 : 1,
    x > len - 8 ? 2.6 : 0.8,
    x > len - 5 ? 3 : 0.6 + 2 * gaussian(x, od, 2),
    x > len - 9 ? 2.8 : 0.5,
    x <= 2 ? 2 : 0.5,
  ]
  return base.map((value, i) => clamp(Math.round(value + (noise(d.index, i + n) - 0.5) * 2.2), 0, 4))
}

export const TRENDS: Record<TrendId, TrendDefinition> = {
  'cycle-length': {
    id: 'cycle-length',
    title: 'Cycle Length Trend',
    lead: 'Days between periods',
    kind: 'line',
    series: [{ id: 'length', label: 'Cycle length', color: '#6C4DE8' }],
    gradient: ['#6C4DE8', '#F34F97'],
    observations: perCycle(cycleLength.values),
    aggregate: 'mean',
    yDomain: [20, 40],
    yTicks: [20, 25, 30, 35, 40],
    formatValue: fixed(1, ' days'),
    noun: 'cycle length',
    highLabel: 'Longest',
    lowLabel: 'Shortest',
    countLabel: 'Cycles in range',
    spread: 'between longest and shortest cycles',
    assess: (avg) =>
      avg >= 21 && avg <= 35 ? 'within the healthy 21–35 day range.' : 'outside the typical 21–35 day range.',
    peakText: (max, _count, date) => `Your longest cycle was ${max} days, starting ${date}.`,
    reference: { kind: 'average' },
  },
  'period-length': {
    id: 'period-length',
    title: 'Period Length Trend',
    lead: 'Duration of bleeding',
    kind: 'line',
    series: [{ id: 'days', label: 'Period days', color: '#F34F97' }],
    gradient: ['#f472b6', '#6C4DE8'],
    observations: perCycle(PERIOD_CYCLES.map((cycle) => cycle.days)),
    aggregate: 'mean',
    yDomain: [2, 10],
    yTicks: [2, 4, 6, 8, 10],
    formatValue: fixed(1, ' days'),
    noun: 'period',
    highLabel: 'Longest',
    lowLabel: 'Shortest',
    countLabel: 'Cycles in range',
    spread: 'between longest and shortest periods.',
    assess: (avg) =>
      avg >= 3 && avg <= 7 ? 'within the healthy 3–7 day range.' : 'outside the typical 3–7 day range.',
    peakText: (max, count) =>
      max >= 7
        ? `${count === 1 ? 'One period' : `${count} periods`} reached ${max} days — worth noting if it repeats.`
        : `No period lasted longer than ${max} days.`,
    reference: { kind: 'average' },
  },
  flow: {
    id: 'flow',
    title: 'Flow Trend',
    lead: 'Peak flow intensity',
    kind: 'line',
    series: [{ id: 'flow', label: 'Flow intensity', color: '#F34F97' }],
    gradient: ['#F34F97', '#f472b6'],
    observations: daily((d) => [d.cycleDay <= 7 ? clamp((FLOW[d.cycleDay - 1] ?? 0) + (noise(d.index, 1) - 0.5) * 0.4, 0, 4) : 0]),
    aggregate: 'max',
    yDomain: [0, 4.4],
    yTicks: [0, 1, 2, 3, 4],
    formatTick: (v) => ['None', 'Spot', 'Light', 'Med', 'Heavy'][v] ?? '',
    formatValue: fixed(1, ' / 4'),
    noun: 'peak flow',
    highLabel: 'Heaviest',
    lowLabel: 'Lightest',
    countLabel: 'Days in range',
    spread: 'between your heaviest and lightest flow peaks.',
    assess: (avg) => (avg >= 2.5 ? 'a typical medium-to-heavy flow.' : 'a lighter flow than usual.'),
    peakText: (max, _count, date) => `Heaviest flow (${max.toFixed(1)} / 4) was logged around ${date}.`,
  },
  pain: {
    id: 'pain',
    title: 'Pain Trend',
    lead: 'Peak pain severity',
    kind: 'line',
    series: [{ id: 'pain', label: 'Pain', color: '#ef4444' }],
    gradient: ['#ef4444', '#f87171'],
    observations: daily((d) => [
      clamp((d.cycleDay <= 7 ? (PAIN[d.cycleDay - 1] ?? 0) : d.cycleDay === d.ovulationDay ? 2 : 0.4) + (noise(d.index, 2) - 0.5) * 1.2, 0, 10),
    ]),
    aggregate: 'max',
    yDomain: [0, 10],
    yTicks: [0, 2, 4, 6, 8, 10],
    formatValue: fixed(1, ' / 10'),
    noun: 'peak pain',
    highLabel: 'Highest',
    lowLabel: 'Lowest',
    countLabel: 'Days in range',
    spread: 'between your highest and lowest pain peaks.',
    assess: (avg) => (avg <= 5 ? 'a manageable severity.' : 'a high severity worth discussing with a clinician.'),
    peakText: (max, _count, date) => `Pain peaked at ${max.toFixed(1)} / 10 around ${date} — consider magnesium and heat therapy.`,
  },
  mood: {
    id: 'mood',
    title: 'Mood Trend',
    lead: 'Daily mood score',
    kind: 'line',
    series: [{ id: 'mood', label: 'Mood', color: '#f59e0b' }],
    gradient: ['#f59e0b', '#fbbf24'],
    observations: daily((d) => [
      clamp(3.8 - 2.2 * gaussian(d.cycleDay, d.ovulationDay - 1, 1.8) - 0.8 * gaussian(d.cycleDay, d.cycleLength - 2, 2) + (noise(d.index, 3) - 0.5) * 0.7, 1, 5),
    ]),
    aggregate: 'mean',
    yDomain: [1, 5],
    yTicks: [1, 2, 3, 4, 5],
    formatValue: fixed(1, ' / 5'),
    noun: 'mood score',
    highLabel: 'Best',
    lowLabel: 'Lowest',
    countLabel: 'Days in range',
    spread: 'between your best and lowest mood.',
    assess: (avg) => (avg >= 3.5 ? 'a generally positive mood.' : 'a lower mood than usual.'),
    peakText: (max, _count, date) => `Mood was at its best (${max.toFixed(1)} / 5) around ${date}.`,
    reference: { kind: 'average' },
  },
  sleep: {
    id: 'sleep',
    title: 'Sleep Trend',
    lead: 'Hours slept',
    kind: 'line',
    series: [{ id: 'sleep', label: 'Sleep hours', color: '#6C4DE8' }],
    gradient: ['#6C4DE8', '#a78bfa'],
    observations: daily((d) => [clamp(7.3 + (noise(d.index, 4) - 0.5) * 2.4 - (d.cycleDay <= 3 ? 0.3 : 0), 4.5, 9.5)]),
    aggregate: 'mean',
    yDomain: [4, 10],
    yTicks: [4, 6, 8, 10],
    formatValue: fixed(1, ' h'),
    noun: 'sleep',
    highLabel: 'Longest',
    lowLabel: 'Shortest',
    countLabel: 'Days in range',
    spread: 'between your longest and shortest nights.',
    assess: (avg) => (avg >= 7 ? 'meeting the 7–9 hour target.' : 'below the 7–9 hour target.'),
    peakText: (max, _count, date) => `Your longest sleep averaged ${max.toFixed(1)} h around ${date}.`,
    reference: { kind: 'average' },
  },
  water: {
    id: 'water',
    title: 'Water Intake',
    lead: 'Litres per day',
    kind: 'bar',
    series: [{ id: 'water', label: 'Intake', color: '#3b82f6' }],
    gradient: ['#7ab8ff', '#3b82f6'],
    observations: daily((d) => [clamp(2.9 + (noise(d.index, 5) - 0.5) * 1.4, 1.5, 4)]),
    aggregate: 'mean',
    yDomain: [0, 4],
    yTicks: [0, 1, 2, 3, 4],
    formatValue: fixed(1, ' L'),
    noun: 'water intake',
    highLabel: 'Highest',
    lowLabel: 'Lowest',
    countLabel: 'Days in range',
    spread: 'between your highest and lowest intake.',
    assess: (avg) => (avg >= 3 ? 'meeting your 3 L daily goal.' : 'below your 3 L daily goal.'),
    peakText: (max, _count, date) => `Best hydration was ${max.toFixed(1)} L around ${date}.`,
    reference: { kind: 'goal', value: 3, label: 'Goal 3.0L' },
  },
  exercise: {
    id: 'exercise',
    title: 'Exercise Trend',
    lead: 'Minutes per day',
    kind: 'bar',
    series: [{ id: 'exercise', label: 'Minutes', color: '#22c55e' }],
    gradient: ['#4ade80', '#16a34a'],
    observations: daily((d) => [clamp(54 + (noise(d.index, 6) - 0.5) * 70, 0, 120)]),
    aggregate: 'mean',
    yDomain: [0, 120],
    yTicks: [0, 30, 60, 90, 120],
    formatValue: fixed(0, ' min'),
    noun: 'daily exercise',
    highLabel: 'Highest',
    lowLabel: 'Lowest',
    countLabel: 'Days in range',
    spread: 'between your most and least active periods.',
    assess: (avg) => (avg >= 30 ? 'above the 30-minute daily guideline.' : 'below the 30-minute daily guideline.'),
    peakText: (max, _count, date) => `Your most active stretch averaged ${Math.round(max)} min around ${date}.`,
    reference: { kind: 'average' },
  },
  weight: {
    id: 'weight',
    title: 'Weight Trend',
    lead: 'Weekly average weight',
    kind: 'line',
    series: [{ id: 'weight', label: 'Weight (kg)', color: '#ef4444' }],
    gradient: ['#ef4444', '#f472b6'],
    observations: daily((d) => [64.8 - (d.index / Math.max(DAYS.length - 1, 1)) * 2.3 + (noise(d.index, 7) - 0.5) * 0.4]),
    aggregate: 'mean',
    yDomain: [61, 66],
    yTicks: [61, 62, 63, 64, 65, 66],
    formatValue: fixed(1, ' kg'),
    noun: 'weight',
    highLabel: 'Highest',
    lowLabel: 'Lowest',
    countLabel: 'Days in range',
    spread: 'between your highest and lowest weight.',
    assess: () => 'a gradual downward trend.',
    peakText: (max, _count, date) => `Your highest weight was ${max.toFixed(1)} kg around ${date}.`,
    reference: { kind: 'average' },
  },
  bbt: {
    id: 'bbt',
    title: 'Basal Body Temperature',
    lead: 'Ovulation confirmation via biphasic pattern',
    kind: 'line',
    series: [{ id: 'bbt', label: 'BBT °F', color: '#F34F97' }],
    gradient: ['#F34F97', '#6C4DE8'],
    observations: daily((d) => [round1(d.cycleDay < d.ovulationDay + 1 ? 97.2 + noise(d.index, 8) * 0.4 : 98.1 + noise(d.index, 8) * 0.5)]),
    aggregate: 'mean',
    byCycleDay: true,
    yDomain: [96.5, 99.5],
    yTicks: [96.5, 97.25, 98, 98.75, 99.5],
    formatValue: fixed(1, '°F'),
    noun: 'basal temperature',
    highLabel: 'Highest',
    lowLabel: 'Lowest',
    countLabel: 'Days in range',
    spread: 'between your warmest and coolest readings.',
    assess: () => 'consistent with a biphasic pattern.',
    peakText: (max, _count, date) => `The warmest reading (${max.toFixed(1)}°F) came around ${date}, in the luteal phase.`,
    reference: { kind: 'average' },
  },
  hormones: {
    id: 'hormones',
    title: 'Hormone Analysis',
    lead: 'Estrogen, Progesterone, LH, FSH',
    kind: 'multiline',
    series: [
      { id: 'estrogen', label: 'Estrogen', color: '#6C4DE8' },
      { id: 'progesterone', label: 'Progesterone', color: '#F34F97' },
      { id: 'lh', label: 'LH', color: '#22c55e' },
      { id: 'fsh', label: 'FSH', color: '#3b82f6' },
    ],
    observations: daily(hormoneSeries),
    aggregate: 'mean',
    byCycleDay: true,
    yDomain: [0, 100],
    yTicks: [0, 25, 50, 75, 100],
    formatValue: fixed(0, ''),
    noun: 'hormone level',
    highLabel: 'Highest',
    lowLabel: 'Lowest',
    countLabel: 'Days in range',
    spread: '',
    assess: () => '',
    peakText: () => '',
  },
  regularity: {
    id: 'regularity',
    title: 'Cycle Regularity',
    lead: 'Consistency score',
    kind: 'line',
    series: [{ id: 'score', label: 'Regularity', color: '#16a34a' }],
    gradient: ['#34d399', '#16a34a'],
    observations: perCycle([94, 90, 88, 93, 86, 95, 91, 89, 96, 92, 94, 92]),
    aggregate: 'mean',
    yDomain: [60, 100],
    yTicks: [60, 70, 80, 90, 100],
    formatTick: (v) => `${v}%`,
    formatValue: fixed(0, '%'),
    noun: 'regularity score',
    highLabel: 'Best',
    lowLabel: 'Lowest',
    countLabel: 'Cycles in range',
    spread: 'between your best and lowest scores.',
    assess: (avg) => (avg >= 85 ? 'excellent consistency.' : 'there is room to improve consistency.'),
    peakText: (max, _count, date) => `Your best regularity (${max}%) was for the cycle starting ${date}.`,
    reference: { kind: 'average' },
  },
  heatmap: {
    id: 'heatmap',
    title: 'Symptom Frequency Heatmap',
    lead: 'Reported symptoms',
    kind: 'heatmap',
    series: SYMPTOMS.map((symptom) => ({ id: symptom, label: symptom, color: '#6C4DE8' })),
    observations: daily((d) => symptomLevels(d, 9)),
    aggregate: 'mean',
    yDomain: [0, 4],
    yTicks: [0, 1, 2, 3, 4],
    formatValue: fixed(1, ' / 4'),
    noun: 'symptom intensity',
    highLabel: 'Most frequent',
    lowLabel: 'Least frequent',
    countLabel: 'Days in range',
    spread: '',
    assess: () => '',
    peakText: () => '',
  },
}
