import { useCallback, useRef, type PointerEvent as ReactPointerEvent } from 'react'
import { Activity, CalendarDays, Gauge, RefreshCw, Zap } from 'lucide-react'
import type { Telemetry } from '../types'
import { TelemetryChart } from './TelemetryChart'

const metrics = [
  { dataKey: 'speed', label: 'Speed', unit: 'km/h', Icon: Gauge },
  { dataKey: 'rpm', label: 'RPM', unit: '', Icon: RefreshCw },
  { dataKey: 'acceleration', label: 'Acceleration', unit: 'm/s²', Icon: Zap },
] as const

const CHART_OFFSET = 96

type AnalyticsPanelProps = {
  telemetry: Telemetry[]
  sampleIndex: number
  onSampleIndexChange: (index: number) => void
}

export function AnalyticsPanel({ telemetry, sampleIndex, onSampleIndexChange }: AnalyticsPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  const updateFromPointer = useCallback((clientX: number) => {
    const bounds = panelRef.current?.getBoundingClientRect()
    if (!bounds) return
    const plotStart = bounds.left + CHART_OFFSET
    const plotWidth = Math.max(1, bounds.width - CHART_OFFSET)
    const ratio = Math.min(1, Math.max(0, (clientX - plotStart) / plotWidth))
    onSampleIndexChange(Math.round(ratio * (telemetry.length - 1)))
  }, [onSampleIndexChange, telemetry.length])

  const handlePointer = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.type === 'pointerdown') event.currentTarget.setPointerCapture(event.pointerId)
    if (event.type !== 'pointermove' || event.buttons > 0 || event.pointerType === 'mouse') updateFromPointer(event.clientX)
  }

  const point = telemetry[sampleIndex] ?? telemetry[0]
  if (!point) return null

  return (
    <section className="glass absolute bottom-3 left-1/2 z-30 w-[min(760px,calc(100%-1.5rem))] -translate-x-1/2 rounded-3xl px-4 py-3 sm:bottom-6" aria-label="Trip analytics">
      <div className="mb-2 flex items-center justify-between">
        <span className="flex items-center gap-2 text-sm font-semibold"><Activity className="h-5 w-5 text-route" strokeWidth={1.8} aria-hidden="true" />Trip analytics</span>
        <span className="flex items-center gap-1.5 text-xs text-muted-foreground"><CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />Today · <strong className="font-semibold text-foreground">{point.time}</strong></span>
      </div>
      <div ref={panelRef} className="touch-none select-none" onPointerDown={handlePointer} onPointerMove={handlePointer} onPointerUp={(event) => {
        if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId)
      }}>
        {metrics.map(({ dataKey, label, unit, Icon }, index) => (
          <TelemetryChart
            key={dataKey}
            dataKey={dataKey}
            label={label}
            unit={unit}
            Icon={Icon}
            telemetry={telemetry}
            index={sampleIndex}
            showTimeAxis={index === 2}
          />
        ))}
      </div>
      <input aria-label="Trip timeline" type="range" min={0} max={telemetry.length - 1} value={sampleIndex} onChange={(event) => onSampleIndexChange(Number(event.target.value))} className="sr-only" />
    </section>
  )
}
