import { CalendarDays, Clock3, Flag, MapPin, Navigation, Route, Timer } from 'lucide-react'
import { useMemo } from 'react'
import type { TelemetryPoint, Trip } from '../types'
import { calculateCumulativeDistances, formatDate, formatDuration, formatTime } from '../utils/format'
import { getPlaybackPosition } from '../utils/playback'
import { usePointerScrubber } from '../hooks/usePointerScrubber'
import { LocationLabel } from './LocationLabel'

type TripSummaryProps = {
  trip: Trip
  telemetry: TelemetryPoint[]
  sampleIndex: number
  onSampleIndexChange: (index: number) => void
}

export function TripSummary({ trip, telemetry, sampleIndex, onSampleIndexChange }: TripSummaryProps) {
  const { maximumIndex, safeIndex, progress } = getPlaybackPosition(telemetry.length, sampleIndex)
  const currentSample = telemetry[safeIndex]
  const currentTimestamp = currentSample?.recordedAt ?? trip.startedAt
  const cumulativeDistances = useMemo(() => calculateCumulativeDistances(telemetry), [telemetry])
  const distance = cumulativeDistances[safeIndex] ?? 0
  const { scrubberRef, onPointerDown, onPointerMove, onPointerUp } = usePointerScrubber({
    itemCount: telemetry.length,
    onIndexChange: onSampleIndexChange,
  })

  return (
    <section className="glass absolute bottom-3 left-1/2 z-30 w-[min(620px,calc(100%-1.5rem))] -translate-x-1/2 rounded-3xl px-5 py-4 sm:bottom-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-2.5">
          <Navigation className="h-5 w-5 shrink-0 text-route" strokeWidth={1.8} aria-hidden="true" />
          <p className="truncate text-sm font-semibold">Trip #{trip.id}</p>
        </div>
        <span className={`flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold ${trip.status === 'OPEN' ? 'bg-online/10 text-online' : 'bg-muted text-muted-foreground'}`}>
          <span className={`h-1.5 w-1.5 rounded-full ${trip.status === 'OPEN' ? 'bg-online' : 'bg-offline'}`} />
          {trip.status === 'OPEN' ? 'LIVE' : 'COMPLETED'}
        </span>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] text-muted-foreground">
        <span className="flex items-center gap-1.5"><CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />{formatDate(currentTimestamp)}</span>
        <span className="flex items-center gap-1.5"><Clock3 className="h-3.5 w-3.5" aria-hidden="true" />{formatTime(currentTimestamp)}</span>
        <span className="flex items-center gap-1.5"><Route className="h-3.5 w-3.5" aria-hidden="true" />{distance.toFixed(1)} km</span>
        <span className="flex items-center gap-1.5"><Timer className="h-3.5 w-3.5" aria-hidden="true" />{formatDuration(trip.startedAt, currentTimestamp)}</span>
      </div>

      <div
        ref={scrubberRef}
        className="relative my-1 h-8 touch-none select-none"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
      >
        <div className="pointer-events-none absolute inset-x-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-offline/55" />
        <div className="pointer-events-none absolute left-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-route" style={{ width: `${progress}%` }} />
        <span className="pointer-events-none absolute left-0 top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-route-contrast bg-route" />
        <span
          className="pointer-events-none absolute top-1/2 h-[18px] w-[18px] -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-route-contrast bg-route shadow-[0_4px_12px_-2px_var(--route)]"
          style={{ left: `${progress}%` }}
        />
      </div>

      <input
        type="range"
        min={0}
        max={maximumIndex}
        value={safeIndex}
        disabled={telemetry.length < 2}
        onChange={(event) => onSampleIndexChange(Number(event.target.value))}
        className="sr-only"
        aria-label="Trip playback position"
      />

      <div className="grid grid-cols-2 items-center gap-3 text-[11px] text-muted-foreground">
        <span className="flex min-w-0 items-center gap-1.5"><MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden="true" /><LocationLabel latitude={trip.startLatitude} longitude={trip.startLongitude} className="truncate" /></span>
        <span className="flex min-w-0 items-center justify-end gap-1.5"><Flag className="h-3.5 w-3.5 shrink-0" aria-hidden="true" /><LocationLabel latitude={trip.endLatitude} longitude={trip.endLongitude} className="truncate text-right" /></span>
      </div>
    </section>
  )
}
