import type { ReactNode } from 'react'
import { Icon } from '../ui/Icon'

export type Tint = 'pink' | 'purple' | 'blue' | 'green' | 'orange' | 'red'

const TINTS: Record<Tint, string> = {
  pink: '#FFF0F6',
  purple: '#ece6ff',
  blue: '#e3f0ff',
  green: '#dff7e9',
  orange: '#ffefdc',
  red: '#ffe6e6',
}

function AiBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-brand-purple-soft px-2 py-0.5 type-badge font-semibold text-brand-purple">
      <Icon name="sparkle" className="size-2.5" />
      AI
    </span>
  )
}

interface TrendCardProps {
  title: string
  subtitle: string
  tint: Tint
  insight: string
  insightTitle?: string
  headerExtra?: ReactNode
  onExpand: () => void
  onDownload: () => void
  className?: string
  children: ReactNode
}

const actionButton =
  'grid size-11 place-items-center rounded-full text-muted transition-colors hover:bg-brand-purple-soft hover:text-brand-purple'

export function TrendCard({
  title,
  subtitle,
  tint,
  insight,
  insightTitle,
  headerExtra,
  onExpand,
  onDownload,
  className = '',
  children,
}: TrendCardProps) {
  return (
    <article
      className={`relative flex min-w-0 flex-col overflow-hidden rounded-[28px] border border-line bg-white p-5 shadow-card sm:p-6 ${className}`}
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: `radial-gradient(circle at 100% 0%, ${TINTS[tint]} 0%, transparent 55%)` }}
        aria-hidden="true"
      />
      <div className="relative flex flex-1 flex-col">
        <header className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="type-card-sm font-semibold text-ink">{title}</h3>
              <AiBadge />
            </div>
            <p className="mt-1 type-card-desc text-muted">{subtitle}</p>
          </div>
          <div className="-mt-2.5 -mr-3.5 -mb-2 flex shrink-0 items-center">
            {headerExtra}
            <button type="button" onClick={onDownload} aria-label={`Download ${title} data`} className={actionButton}>
              <Icon name="download" className="size-[15px]" />
            </button>
            <button type="button" onClick={onExpand} aria-label={`Expand ${title}`} className={actionButton}>
              <Icon name="expand" className="size-[15px]" />
            </button>
          </div>
        </header>

        <div className="mt-3 flex flex-1 flex-col">{children}</div>

        <p className="mt-4 flex items-start gap-2.5 rounded-2xl bg-brand-purple-soft/70 p-3 type-secondary text-body">
          <span className="mt-px grid size-6 shrink-0 place-items-center rounded-full bg-white text-brand-purple" aria-hidden="true">
            <Icon name="sparkle" className="size-3" />
          </span>
          <span>
            {insightTitle && <strong className="block font-semibold text-ink">{insightTitle}</strong>}
            {insight}
          </span>
        </p>
      </div>
    </article>
  )
}

interface LegendItem {
  label: string
  color: string
  dashed?: boolean
}

export function Legend({ items, children }: { items: LegendItem[]; children?: ReactNode }) {
  return (
    <div className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-1 type-label text-muted">
      {items.map((item) => (
        <span key={item.label} className="inline-flex items-center gap-1.5">
          <span
            aria-hidden="true"
            className={item.dashed ? 'h-0 w-3 border-t-2 border-dashed' : 'size-2 rounded-full'}
            style={item.dashed ? { borderColor: item.color } : { backgroundColor: item.color }}
          />
          {item.label}
        </span>
      ))}
      {children}
    </div>
  )
}

export const Strong = ({ children }: { children: ReactNode }) => (
  <strong className="font-semibold text-ink">{children}</strong>
)
