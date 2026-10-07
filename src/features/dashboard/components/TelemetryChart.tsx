import type { LucideIcon } from 'lucide-react'
import type { Telemetry } from '../types'

type MetricKey = 'speed' | 'rpm' | 'acceleration'

type TelemetryChartProps = {
  label: string
  unit: string
  dataKey: MetricKey
  Icon: LucideIcon
  telemetry: Telemetry[]
  index: number
  showTimeAxis?: boolean
}

export function TelemetryChart({ label, unit, dataKey, Icon, telemetry, index, showTimeAxis = false }: TelemetryChartProps) {
  const safeIndex = Math.min(Math.max(index, 0), telemetry.length - 1)
  const point = telemetry[safeIndex]
  if (!point) return null

  const values = telemetry.map((sample) => Number.isFinite(sample[dataKey]) ? sample[dataKey] : 0)
  const minimum = Math.min(...values)
  const maximum = Math.max(...values)
  const range = maximum - minimum || 1
  const xForIndex = (sampleIndex: number) => telemetry.length === 1 ? 50 : (sampleIndex / (telemetry.length - 1)) * 100
  const yForValue = (value: number) => 7 + (1 - (value - minimum) / range) * 26
  const selectedX = xForIndex(safeIndex)
  const selectedY = yForValue(values[safeIndex])
  const linePoints = values.map((value, sampleIndex) => `${xForIndex(sampleIndex)},${yForValue(value)}`).join(' ')
  const value = values[safeIndex]

  return (
    <div className="grid grid-cols-[88px_minmax(0,1fr)] items-center gap-2 border-t border-glass py-1.5 first:border-t-0" role="img" aria-label={`${label}: ${value} ${unit}`}>
      <div className="flex min-w-0 items-center gap-2">
        <Icon className="h-4 w-4 shrink-0 text-route" strokeWidth={1.8} aria-hidden="true" />
        <div className="min-w-0">
          <p className="truncate text-[10px] text-muted-foreground">{label}</p>
          <p className="truncate text-xs font-semibold tabular-nums">
            {value.toLocaleString()} <span className="font-normal text-muted-foreground">{unit}</span>
          </p>
        </div>
      </div>

      <div className={`relative min-w-0 ${showTimeAxis ? 'h-16' : 'h-12'}`}>
        <svg className="absolute inset-x-0 top-0 h-12 w-full overflow-visible" viewBox="0 0 100 40" preserveAspectRatio="none" aria-hidden="true">
          <line x1="0" x2="100" y1="7" y2="7" stroke="var(--glass-border)" strokeDasharray="1 1" vectorEffect="non-scaling-stroke" />
          <line x1="0" x2="100" y1="20" y2="20" stroke="var(--glass-border)" strokeDasharray="1 1" vectorEffect="non-scaling-stroke" />
          <line x1="0" x2="100" y1="33" y2="33" stroke="var(--glass-border)" strokeDasharray="1 1" vectorEffect="non-scaling-stroke" />
          <polyline points={linePoints} fill="none" stroke="var(--route)" strokeWidth="2" vectorEffect="non-scaling-stroke" />
          <line x1={selectedX} x2={selectedX} y1="4" y2="36" stroke="var(--foreground)" strokeOpacity="0.25" vectorEffect="non-scaling-stroke" />
        </svg>
        <span
          className="absolute h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-route-contrast bg-route"
          style={{ left: `${selectedX}%`, top: `${(selectedY / 40) * 48}px` }}
        />
        {showTimeAxis && (
          <span className="absolute inset-x-0 bottom-0 flex justify-between text-[9px] text-muted-foreground">
            <span>{telemetry[0]?.time}</span>
            <span>{telemetry[telemetry.length - 1]?.time}</span>
          </span>
        )}
      </div>
    </div>
  )
}
