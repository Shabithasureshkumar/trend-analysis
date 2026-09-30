import { useId, type ReactNode } from 'react'

interface RingGaugeProps {
  value: number
  max?: number
  size: number
  strokeWidth: number
  gradient: [string, string]
  trackColor: string
  ariaLabel: string
  children?: ReactNode
  /** Fill of the inner disc; transparent when omitted. */
  innerFill?: string
}

export function RingGauge({
  value,
  max = 100,
  size,
  strokeWidth,
  gradient,
  trackColor,
  ariaLabel,
  children,
  innerFill = 'transparent',
}: RingGaugeProps) {
  const uid = useId()
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const progress = Math.min(Math.max(value / max, 0), 1)

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} role="img" aria-label={ariaLabel} className="-rotate-90">
        <defs>
          <linearGradient id={uid} x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor={gradient[0]} />
            <stop offset="100%" stopColor={gradient[1]} />
          </linearGradient>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={radius - strokeWidth / 2} fill={innerFill} />
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={trackColor} strokeWidth={strokeWidth} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={`url(#${uid})`}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={`${circumference * progress} ${circumference}`}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">{children}</div>
    </div>
  )
}
