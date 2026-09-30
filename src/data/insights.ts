export type MetricCategory = 'cycle' | 'symptoms' | 'fertility' | 'lifestyle' | 'hormones'

export const FILTERS: { id: 'all' | MetricCategory; label: string }[] = [
  { id: 'all', label: 'All Metrics' },
  { id: 'cycle', label: 'Cycle' },
  { id: 'symptoms', label: 'Symptoms' },
  { id: 'fertility', label: 'Fertility' },
  { id: 'lifestyle', label: 'Lifestyle' },
  { id: 'hormones', label: 'Hormones' },
]

export const PATIENT = {
  name: 'Jimmy Alexa',
  id: 'PT-2048',
  details: ['Age: 28 • Female', 'Height: 165 cm • Weight: 58 kg', 'Cycle Length: 28 days (avg)', 'BMI: 22'],
}

export const HEALTH_SCORE = {
  score: 68,
  label: 'Good',
  summary: 'Based on your recent logs, mood, sleep, hydration, and activity patterns.',
  change: '+4 from last week',
}

export const HEALTH_SCORE_FACTORS: { id: string; label: string; weight: number; score: number; description: string }[] = [
  {
    id: 'regularity',
    label: 'Cycle Regularity',
    weight: 25,
    score: 78,
    description: 'Based on cycle length consistency, period regularity, and cycle-to-cycle variation.',
  },
  {
    id: 'menstrual',
    label: 'Menstrual Health',
    weight: 20,
    score: 72,
    description: 'Based on period duration, flow pattern, blood colour, and period symptoms.',
  },
  {
    id: 'symptoms',
    label: 'Symptoms & Mood',
    weight: 20,
    score: 65,
    description: 'Based on logged symptoms, pain levels, mood changes, and emotional well-being.',
  },
  {
    id: 'lifestyle',
    label: 'Lifestyle & Wellness',
    weight: 15,
    score: 80,
    description: 'Based on sleep, physical activity, hydration, stress levels, and daily habits.',
  },
  {
    id: 'fertility',
    label: 'Fertility & Hormonal Patterns',
    weight: 10,
    score: 70,
    description: 'Based on ovulation data, BBT, cervical mucus, LH results, and cycle patterns.',
  },
  {
    id: 'tracking',
    label: 'Tracking Consistency',
    weight: 10,
    score: 68,
    description: 'Based on how consistently you log periods, symptoms, mood, and daily health info.',
  },
]

export const SCORE_TIPS = [
  'Maintain a regular sleep schedule (7–9 hours)',
  'Track your symptoms and mood daily',
  'Stay hydrated and maintain a balanced diet',
  'Exercise regularly and manage stress',
  'Keep your cycle and health information updated',
]

export const PREDICTIONS: {
  id: string
  title: string
  subtitle: string
  value: string
  note: string
  icon: 'drop' | 'target' | 'heart'
  valueTone: 'pink' | 'purple'
}[] = [
  {
    id: 'next-period',
    title: 'Next Period',
    subtitle: 'Based on your average cycle length',
    value: 'In 16 days',
    note: '92% confidence',
    icon: 'drop',
    valueTone: 'pink',
  },
  {
    id: 'ovulation',
    title: 'Ovulation',
    subtitle: 'Predicted ovulation date',
    value: 'In 3 days',
    note: '80% confidence',
    icon: 'target',
    valueTone: 'purple',
  },
  {
    id: 'fertile-window',
    title: 'Fertile Window',
    subtitle: 'Best days to conceive',
    value: '3–7 days',
    note: 'High',
    icon: 'heart',
    valueTone: 'pink',
  },
]

export const RECOMMENDATIONS = [
  {
    id: 'iron',
    title: 'Increase iron-rich foods',
    body: 'Your logs show lower energy during your period. Try spinach, lentils, and dark chocolate.',
  },
  {
    id: 'yoga',
    title: 'Gentle yoga for cramps',
    body: 'A 15-minute yoga flow can help reduce cramp severity by 30%.',
  },
  {
    id: 'sleep',
    title: 'Prioritize sleep',
    body: 'Your average sleep is below 7h. Aim for 7–9 hours for optimal hormone balance.',
  },
]

export const SUMMARY_METRICS: {
  id: string
  value: string
  label: string
  delta: string
  trend: 'up' | 'down'
  icon: 'pulse' | 'drop' | 'thermo'
  tone: 'purple' | 'pink' | 'blue'
}[] = [
  { id: 'avg-cycle', value: '29.3d', label: 'Avg Cycle', delta: '+0.4', trend: 'up', icon: 'pulse', tone: 'purple' },
  { id: 'period-length', value: '5.2d', label: 'Period Length', delta: '-0.1', trend: 'down', icon: 'drop', tone: 'pink' },
  { id: 'bbt', value: '98.2°F', label: 'BBT Today', delta: '+0.6', trend: 'up', icon: 'thermo', tone: 'blue' },
]

const days = (n: number, prefix = 'D') => Array.from({ length: n }, (_, i) => `${prefix}${i + 1}`)
const gaussian = (x: number, center: number, spread: number) => Math.exp(-(((x - center) / spread) ** 2))
const round1 = (n: number) => Math.round(n * 10) / 10

export const cycleLength = {
  labels: days(12, 'C'),
  values: [29, 31, 28, 30, 32, 28, 29, 31, 27, 29, 30, 28],
}

export const flow = {
  labels: days(7),
  values: [2.5, 3.25, 4, 3, 2, 1, 0],
  levels: ['None', 'Spot', 'Light', 'Med', 'Heavy'],
}

export const pain = { labels: days(7), values: [6, 8, 5, 3, 2, 1, 0] }

export const mood = {
  labels: days(25),
  values: [3.5, 4.2, 4.7, 4.9, 4.2, 3.6, 3.3, 3.9, 4.3, 3.4, 2.4, 1.9, 1.1, 1.4, 1.2, 2.8, 3.4, 3.2, 3.9, 4.4, 4.9, 4.5, 3.4, 3.9, 4.3],
}

export const sleep = {
  labels: ['Jun 6', 'Jun 7', 'Jun 8', 'Jun 9', 'Jun 10', 'Jun 11', 'Jun 12'],
  values: [6.6, 7.8, 8.0, 7.6, 6.0, 7.2, 8.4],
}

const WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export const water = { labels: WEEK, values: [2.6, 3.0, 2.7, 3.4, 2.5, 3.0, 3.3], goal: 3.0 }

export const exercise = { labels: WEEK, values: [45, 60, 30, 70, 35, 85, 53], average: 54 }

export const weight = {
  labels: ['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7', 'W8'],
  current: [64.0, 63.6, 63.4, 63.2, 63.0, 62.9, 62.6, 62.5],
  previous: [64.8, 64.6, 64.5, 64.4, 64.3, 64.2, 64.1, 64.1],
}

export const bbt = {
  labels: days(25),
  values: [
    97.1, 97.2, 97.1, 97.3, 97.2, 97.3, 97.4, 97.3, 97.4, 97.5, 97.4, 97.5, 97.4, 97.6, 98.2, 98.3, 98.1, 98.4,
    98.2, 98.4, 98.3, 98.5, 98.3, 98.4, 98.2,
  ],
  baseline: 97.5,
}

const hormoneDays = Array.from({ length: 25 }, (_, i) => i + 1)
export const hormones = {
  labels: days(25),
  estrogen: hormoneDays.map((d) =>
    round1(Math.min(100, 15 + 62 * gaussian(d, 12.5, 2.8) + 32 * gaussian(d, 21, 3.5))),
  ),
  progesterone: hormoneDays.map((d) => round1(6 + 52 * gaussian(d, 20.5, 3.2))),
  lh: hormoneDays.map((d) => round1(8 + 92 * gaussian(d, 14, 1.1))),
  fsh: hormoneDays.map((d) => round1(24 + 48 * gaussian(d, 13.2, 1.7))),
}

export const regularity = { score: 92, label: 'Excellent', change: '+4% vs last quarter' }

export const HEATMAP_DAYS = Array.from({ length: 14 }, (_, i) => i + 1)

/** Intensity 0 (none) – 4 (very high) per day, days 1–14. */
export const heatmap: { symptom: string; levels: number[] }[] = [
  { symptom: 'Cramps', levels: [3, 4, 3, 2, 2, 1, 4, 2, 3, 1, 2, 4, 3, 4] },
  { symptom: 'Headache', levels: [0, 4, 3, 1, 3, 1, 0, 2, 1, 0, 3, 1, 4, 3] },
  { symptom: 'Bloating', levels: [4, 3, 1, 4, 0, 3, 1, 3, 2, 0, 3, 4, 1, 3] },
  { symptom: 'Fatigue', levels: [1, 3, 1, 4, 2, 0, 3, 1, 3, 2, 0, 3, 2, 1] },
  { symptom: 'Acne', levels: [4, 1, 0, 3, 0, 2, 4, 0, 1, 3, 0, 1, 3, 0] },
  { symptom: 'Mood Swings', levels: [1, 3, 1, 0, 2, 3, 1, 3, 4, 1, 2, 3, 1, 2] },
  { symptom: 'Breast Tenderness', levels: [0, 1, 4, 2, 1, 0, 3, 1, 2, 4, 1, 0, 2, 3] },
  { symptom: 'Nausea', levels: [3, 0, 1, 3, 1, 3, 0, 2, 1, 0, 3, 1, 2, 4] },
]

export const INTENSITY_LEVELS = ['None', 'Low', 'Med', 'High', 'V.High']
