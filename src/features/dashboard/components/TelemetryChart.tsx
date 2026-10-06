import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceDot,
  ReferenceLine,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from 'recharts'
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

function formatAxisValue(value: number) {
  if (Math.abs(value) >= 1000) return `${(value / 1000).toFixed(1)}k`
  return Number.isInteger(value) ? String(value) : value.toFixed(1)
}

export function TelemetryChart({ label, unit, dataKey, Icon, telemetry, index, showTimeAxis = false }: TelemetryChartProps) {
  const point = telemetry[index] ?? telemetry[0]
  if (!point) return null

  const value = point[dataKey]

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

      <div className={showTimeAxis ? 'h-16 min-w-0' : 'h-12 min-w-0'}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={telemetry} margin={{ top: 5, right: 8, bottom: showTimeAxis ? 0 : 5, left: 0 }} accessibilityLayer>
            <CartesianGrid vertical={false} stroke="var(--glass-border)" strokeDasharray="3 4" />
            <XAxis
              dataKey="time"
              hide={!showTimeAxis}
              axisLine={false}
              tickLine={false}
              interval="preserveStartEnd"
              minTickGap={40}
              tick={{ fill: 'var(--muted-foreground)', fontSize: 9 }}
              height={18}
            />
            <YAxis
              dataKey={dataKey}
              axisLine={false}
              tickLine={false}
              tickCount={3}
              width={34}
              domain={['dataMin', 'dataMax']}
              tick={{ fill: 'var(--muted-foreground)', fontSize: 9 }}
              tickFormatter={formatAxisValue}
            />
            <Line
              type="monotone"
              dataKey={dataKey}
              stroke="var(--route)"
              strokeWidth={2}
              dot={false}
              activeDot={false}
              isAnimationActive={false}
            />
            <ReferenceLine x={point.time} stroke="var(--foreground)" strokeOpacity={0.25} />
            <ReferenceDot x={point.time} y={value} r={4} fill="var(--route)" stroke="var(--route-contrast)" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
