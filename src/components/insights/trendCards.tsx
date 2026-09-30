import type { ReactNode } from 'react'
import * as data from '../../data/insights'
import type { MetricCategory } from '../../data/insights'
import type { TrendId } from '../../data/trendData'
import { PERIOD_CYCLES } from '../../data/periodCycles'
import { BarChart } from '../charts/BarChart'
import { LineChart } from '../charts/LineChart'
import { RingGauge } from '../charts/RingGauge'
import moodCalm from '../../assets/mood_calm.png'
import moodHappy from '../../assets/mood_happy.png'
import moodIrritable from '../../assets/mood_irritable.png'
import moodNeutral from '../../assets/mood_neutral.png'
import moodSad from '../../assets/mood_sad.png'
import { Icon } from '../ui/Icon'
import { IntensityLegend, SymptomHeatmap } from './SymptomHeatmap'
import { Legend, Strong, type Tint } from './TrendCard'

export interface TrendCardSpec {
  id: TrendId
  title: string
  subtitle: string
  categories: MetricCategory[]
  tint: Tint
  insight: string
  insightTitle?: string
  fullWidth?: boolean
  csv: () => (string | number)[][]
  render: () => ReactNode
}

const MOOD_FACES = [
  { label: 'Sad', src: moodSad },
  { label: 'Irritable', src: moodIrritable },
  { label: 'Neutral', src: moodNeutral },
  { label: 'Calm', src: moodCalm },
  { label: 'Happy', src: moodHappy },
]

const PURPLE = '#6C4DE8'
const PINK = '#F34F97'
const DAYS_IN_WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

const cardChartHeight = (width: number) => (width < 300 ? 190 : width < 420 ? 250 : 320)
const weightChartHeight = (width: number) => (width < 300 ? 150 : width < 420 ? 170 : 235)

const series = (header: string[], labels: string[], ...columns: number[][]) => [
  header,
  ...labels.map((label, i) => [label, ...columns.map((column) => column[i] ?? '')]),
]

const D_TICKS = [0, 4, 8, 12, 16, 20, 24]

export const TREND_CARDS: TrendCardSpec[] = [
  {
    id: 'cycle-length',
    title: 'Cycle Length Trend',
    subtitle: 'Last 12 cycles · days between periods',
    categories: ['cycle'],
    tint: 'purple',
    insight:
      'Your cycle length is stable within the healthy 26–32 day range. Slight variance suggests strong hormonal rhythm.',
    csv: () => series(['Cycle', 'Days'], data.cycleLength.labels, data.cycleLength.values),
    render: () => (
      <>
        <Legend
          items={[
            { label: 'Cycle length', color: PURPLE },
            { label: 'Current cycle', color: PINK },
          ]}
        />
        <p className="-mt-1 mb-2 type-label text-muted">
          Avg <Strong>29.3d</Strong> · Longest <Strong>32d</Strong> · Shortest <Strong>27d</Strong>
        </p>
        <LineChart
          ariaLabel="Cycle length in days across the last 12 cycles"
          xLabels={data.cycleLength.labels}
          yDomain={[20, 40]}
          yTicks={[20, 25, 30, 35, 40]}
          height={cardChartHeight}
          series={[
            { id: 'cycle', color: PURPLE, values: data.cycleLength.values, dots: 'last', lastDotColor: PINK },
          ]}
        />
      </>
    ),
  },
  {
    id: 'period-length',
    title: 'Period Length Trend',
    subtitle: 'Duration of bleeding · last 12 cycles',
    categories: ['cycle'],
    tint: 'pink',
    insight: 'Period length averages 5.2 days — well within normal range (3–7 days).',
    csv: () => [['Cycle start', 'Days'], ...PERIOD_CYCLES.map((c) => [c.start.toISOString().slice(0, 10), c.days])],
    render: () => (
      <>
        <Legend
          items={[
            { label: 'Period days', color: PINK },
            { label: 'Current', color: '#5b3fe4' },
          ]}
        />
        <BarChart
          ariaLabel="Period length in days across the last 12 cycles"
          labels={data.cycleLength.labels}
          values={PERIOD_CYCLES.map((c) => c.days)}
          yDomain={[2, 10]}
          yTicks={[2, 4, 6, 8, 10]}
          height={cardChartHeight}
          gradient={['#f9a8d4', PINK]}
          highlight={{ index: PERIOD_CYCLES.length - 1, gradient: ['#8b6cf5', '#5b3fe4'] }}
        />
      </>
    ),
  },
  {
    id: 'flow',
    title: 'Flow Trend',
    subtitle: 'Intensity across current period',
    categories: ['cycle'],
    tint: 'pink',
    insight: 'Peak flow on Day 3 is typical. Tapering afterwards indicates healthy shedding.',
    csv: () =>
      series(['Day', 'Flow level (0 none – 4 heavy)'], data.flow.labels, data.flow.values),
    render: () => (
      <>
        <Legend items={[{ label: 'Flow intensity', color: PINK }]}>
          <span>
            Today: <Strong>D3 · Heavy</Strong>
          </span>
        </Legend>
        <LineChart
          ariaLabel="Flow intensity across the seven days of the current period, peaking on day 3"
          xLabels={data.flow.labels}
          yDomain={[0, 4.4]}
          yTicks={[0, 1, 2, 3, 4]}
          formatY={(v) => data.flow.levels[v] ?? ''}
          height={cardChartHeight}
          curve="linear"
          margin={{ left: 46 }}
          markers={[{ index: 2, label: 'Current', color: '#5b3fe4' }]}
          series={[
            { id: 'flow', color: PINK, values: data.flow.values, fill: true, dots: 'none', highlightIndex: 2 },
          ]}
        />
      </>
    ),
  },
  {
    id: 'pain',
    title: 'Pain Trend',
    subtitle: 'Severity through current period',
    categories: ['symptoms'],
    tint: 'red',
    insight: 'Peak pain on Day 2 (8/10) — consider magnesium and heat therapy on high-pain days.',
    csv: () => series(['Day', 'Pain (0-10)'], data.pain.labels, data.pain.values),
    render: () => (
      <>
        <Legend items={[{ label: 'Pain', color: '#ef4444' }]}>
          <span>
            Peak <Strong>8/10</Strong>
          </span>
          <span>
            Avg <Strong>3.6</Strong>
          </span>
        </Legend>
        <LineChart
          ariaLabel="Pain severity across the current period, peaking at 8 out of 10 on day 2"
          xLabels={data.pain.labels}
          yDomain={[0, 10]}
          yTicks={[0, 3, 6, 10]}
          height={cardChartHeight}
          series={[{ id: 'pain', color: '#ef4444', values: data.pain.values, dots: 'none', highlightIndex: 1 }]}
        />
      </>
    ),
  },
  {
    id: 'mood',
    title: 'Mood Trend',
    subtitle: 'Daily mood across the cycle',
    categories: ['symptoms'],
    tint: 'orange',
    insight: 'Mood dips on Days 25–28 correlate with luteal phase. Extra rest and light exercise can help.',
    csv: () => series(['Day', 'Mood (1-5)'], data.mood.labels, data.mood.values),
    render: () => (
      <>
        <div className="mb-3 flex gap-2">
          {MOOD_FACES.map((face) => (
            <img key={face.label} src={face.src} alt={face.label} width={20} height={20} className="size-5 rounded-full object-cover" />
          ))}
        </div>
        <LineChart
          ariaLabel="Daily mood score across the cycle, dipping around day 13"
          xLabels={data.mood.labels}
          xTickIndexes={D_TICKS}
          yDomain={[1, 5]}
          yTicks={[1, 2, 3, 4, 5]}
          height={cardChartHeight}
          series={[{ id: 'mood', color: '#f59e0b', values: data.mood.values, dots: 'none' }]}
        />
      </>
    ),
  },
  {
    id: 'sleep',
    title: 'Sleep Trend',
    subtitle: 'Hours slept · last 7 days',
    categories: ['lifestyle'],
    tint: 'purple',
    insight: 'Averaging 7.4h — great baseline. Aim for consistent bedtime to boost recovery.',
    csv: () => series(['Date', 'Hours slept'], data.sleep.labels, data.sleep.values),
    render: () => (
      <>
        <Legend items={[{ label: 'Sleep hours', color: PURPLE }]}>
          <span>
            Today: <Strong>8.4h</Strong>
          </span>
        </Legend>
        <LineChart
          ariaLabel="Hours slept over the last seven days, 8.4 hours today"
          xLabels={data.sleep.labels}
          yDomain={[4, 10]}
          yTicks={[4, 6, 8, 10]}
          height={cardChartHeight}
          series={[{ id: 'sleep', color: PURPLE, values: data.sleep.values, dots: 'last', lastDotColor: PINK }]}
        />
      </>
    ),
  },
  {
    id: 'water',
    title: 'Water Intake',
    subtitle: 'Litres per day · goal 3.0L',
    categories: ['lifestyle'],
    tint: 'blue',
    insight: 'You hit the daily 3L goal 4 of 7 days. Try adding a morning glass to lift the streak.',
    csv: () => series(['Day', 'Litres'], data.water.labels, data.water.values),
    render: () => (
      <>
        <Legend
          items={[
            { label: 'Intake', color: '#3b82f6' },
            { label: 'Goal 3.0L', color: '#93c5fd', dashed: true },
          ]}
        />
        <BarChart
          ariaLabel="Litres of water per day this week against a 3 litre goal"
          labels={data.water.labels}
          values={data.water.values}
          yDomain={[0, 4]}
          yTicks={[0, 1, 2, 3, 4]}
          height={cardChartHeight}
          gradient={['#7ab8ff', '#3b82f6']}
          referenceLines={[{ value: data.water.goal, label: '', color: '#93c5fd' }]}
        />
      </>
    ),
  },
  {
    id: 'exercise',
    title: 'Exercise Trend',
    subtitle: 'Minutes per day · this week',
    categories: ['lifestyle'],
    tint: 'green',
    insight: 'Weekly average 54m — consistent movement supports hormone regulation.',
    csv: () => series(['Day', 'Minutes'], DAYS_IN_WEEK, data.exercise.values),
    render: () => (
      <>
        <Legend items={[{ label: 'Minutes', color: '#22c55e' }]}>
          <span>
            Weekly avg <Strong>54m</Strong>
          </span>
        </Legend>
        <BarChart
          ariaLabel="Exercise minutes per day this week, averaging 54 minutes"
          labels={data.exercise.labels}
          values={data.exercise.values}
          yDomain={[0, 120]}
          yTicks={[0, 30, 60, 90, 120]}
          height={cardChartHeight}
          gradient={['#4ade80', '#16a34a']}
          referenceLines={[{ value: data.exercise.average, label: '', color: '#4ade80' }]}
        />
      </>
    ),
  },
  {
    id: 'weight',
    title: 'Weight Trend',
    subtitle: 'Weekly average • Compare with previous cycle',
    categories: ['lifestyle'],
    tint: 'pink',
    insightTitle: 'Stable downward trend',
    insight: 'Your weight is 1.6 kg lower than your previous cycle.',
    csv: () => series(['Week', 'Current cycle (kg)', 'Previous cycle (kg)'], data.weight.labels, data.weight.current, data.weight.previous),
    render: () => (
      <>
        <Legend
          items={[
            { label: 'Current Cycle (kg)', color: '#ef4444' },
            { label: 'Previous Cycle (kg)', color: '#f472b6' },
          ]}
        />
        <LineChart
          ariaLabel="Weekly average weight for the current and previous cycle in kilograms"
          xLabels={data.weight.labels}
          yDomain={[45, 81]}
          yTicks={[45, 54, 63, 72, 81]}
          height={weightChartHeight}
          series={[
            { id: 'previous', color: '#f472b6', values: data.weight.previous, dots: 'last' },
            { id: 'current', color: '#ef4444', values: data.weight.current, dots: 'last' },
          ]}
        />
        <dl className="mt-3 grid grid-cols-3 gap-2">
          {[
            ['Current cycle', '62.5 kg', 'Last 8 weeks', 'text-ink'],
            ['Previous cycle', '64.1 kg', 'Last 8 weeks', 'text-ink'],
            ['Change', '-1.6 kg', 'Over prior cycle', 'text-success'],
          ].map(([label, value, note, tone]) => (
            <div key={label} className="min-w-0 rounded-xl border border-line bg-white/80 px-2.5 py-2">
              <dt className="truncate type-label text-muted">{label}</dt>
              <dd className={`type-card font-bold  ${tone}`}>{value}</dd>
              <dd className="truncate type-label text-muted">{note}</dd>
            </div>
          ))}
        </dl>
      </>
    ),
  },
  {
    id: 'bbt',
    title: 'Basal Body Temperature',
    subtitle: 'Ovulation confirmation via biphasic pattern',
    categories: ['fertility', 'hormones'],
    tint: 'pink',
    insight: 'Clear thermal shift on Day 15 confirms ovulation. Luteal phase is a healthy 13 days.',
    csv: () => series(['Day', 'BBT (°F)'], data.bbt.labels, data.bbt.values),
    render: () => (
      <>
        <Legend
          items={[
            { label: 'BBT °F', color: PINK },
            { label: 'Baseline', color: '#c4b8ee', dashed: true },
          ]}
        >
          <span>
            Today: <Strong>98.2°F</Strong>
          </span>
        </Legend>
        <LineChart
          ariaLabel="Basal body temperature in degrees Fahrenheit, rising on day 15 which confirms ovulation"
          xLabels={data.bbt.labels}
          xTickIndexes={D_TICKS}
          yDomain={[96.5, 99.5]}
          yTicks={[96.5, 97.25, 98, 98.75, 99.5]}
          height={cardChartHeight}
          markers={[{ index: 14, label: 'Ovulation', color: PURPLE }]}
          referenceLines={[{ value: data.bbt.baseline, label: '', color: '#c4b8ee' }]}
          series={[{ id: 'bbt', color: PINK, values: data.bbt.values, dots: 'none' }]}
        />
      </>
    ),
  },
  {
    id: 'hormones',
    title: 'Hormone Analysis',
    subtitle: 'Estrogen, Progesterone, LH, FSH across cycle',
    categories: ['hormones', 'fertility'],
    tint: 'purple',
    insight: 'LH surge peaks on Day 14 followed by strong progesterone rise — textbook ovulatory cycle.',
    csv: () =>
      series(
        ['Day', 'Estrogen', 'Progesterone', 'LH', 'FSH'],
        data.hormones.labels,
        data.hormones.estrogen,
        data.hormones.progesterone,
        data.hormones.lh,
        data.hormones.fsh,
      ),
    render: () => (
      <>
        <Legend
          items={[
            { label: 'Estrogen', color: PURPLE },
            { label: 'Progesterone', color: PINK },
            { label: 'LH', color: '#22c55e' },
            { label: 'FSH', color: '#3b82f6' },
          ]}
        />
        <LineChart
          ariaLabel="Estrogen, progesterone, LH and FSH levels across the cycle, with an LH surge on day 14"
          xLabels={data.hormones.labels}
          xTickIndexes={D_TICKS}
          yDomain={[0, 100]}
          yTicks={[0, 25, 50, 75, 100]}
          height={cardChartHeight}
          markers={[{ index: 13, label: 'Ovulation', color: PURPLE }]}
          series={[
            { id: 'estrogen', color: PURPLE, values: data.hormones.estrogen, dots: 'none' },
            { id: 'progesterone', color: PINK, values: data.hormones.progesterone, dots: 'none' },
            { id: 'lh', color: '#22c55e', values: data.hormones.lh, dots: 'none' },
            { id: 'fsh', color: '#3b82f6', values: data.hormones.fsh, dots: 'none' },
          ]}
        />
      </>
    ),
  },
  {
    id: 'regularity',
    title: 'Cycle Regularity',
    subtitle: 'Consistency score · last 12 cycles',
    categories: ['cycle'],
    tint: 'green',
    insight: '92% regularity — excellent. Your cycles vary by less than ±2 days month over month.',
    csv: () => [['Metric', 'Value'], ['Regularity score (%)', data.regularity.score], ['Change vs last quarter (%)', 4]],
    render: () => (
      <div className="flex flex-1 items-center justify-center py-2">
        <RingGauge
          value={data.regularity.score}
          size={188}
          strokeWidth={20}
          gradient={['#34d399', '#16a34a']}
          trackColor="#e2f6ea"
          innerFill="#ffffff"
          ariaLabel={`Cycle regularity ${data.regularity.score} percent, ${data.regularity.label}`}
        >
          <span className="type-score font-extrabold text-ink">
            {data.regularity.score}
            <span className="type-card font-bold">%</span>
          </span>
          <span className="mt-1 type-secondary font-semibold text-success">{data.regularity.label}</span>
          <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-success/100 px-2 py-0.5 type-badge font-semibold text-white">
            <Icon name="trendUp" className="size-2.5" />
            {data.regularity.change}
          </span>
        </RingGauge>
      </div>
    ),
  },
  {
    id: 'heatmap',
    title: 'Symptom Frequency Heatmap',
    subtitle: 'Reported symptoms · last 14 days',
    categories: ['symptoms'],
    tint: 'purple',
    fullWidth: true,
    insight: 'Cramps and bloating cluster on Days 1–4, consistent with menstrual phase. Mood swings show mid-cycle.',
    csv: () => [
      ['Symptom', ...data.HEATMAP_DAYS.map((d) => `Day ${d}`)],
      ...data.heatmap.map((row) => [row.symptom, ...row.levels]),
    ],
    render: () => (
      <>
        <div className="mb-3">
          <IntensityLegend />
        </div>
        <SymptomHeatmap rows={data.heatmap} columnLabels={data.HEATMAP_DAYS.map(String)} />
      </>
    ),
  },
]
