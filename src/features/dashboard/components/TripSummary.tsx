import { CalendarDays, Clock3, Flag, MapPin, Navigation, Route, Timer } from 'lucide-react'
import type { Trip } from '../types'

type TripSummaryProps = {
  trip: Trip
  progress: number
}

export function TripSummary({ trip, progress }: TripSummaryProps) {
  const hasDestination = Boolean(trip.to)
  const isOpenEndedLiveTrip = trip.live && !hasDestination

  return (
    <section className="glass absolute bottom-3 left-1/2 z-30 w-[min(620px,calc(100%-1.5rem))] -translate-x-1/2 rounded-3xl px-5 py-4 sm:bottom-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-2.5">
          <Navigation className="h-5 w-5 shrink-0 text-route" strokeWidth={1.8} aria-hidden="true" />
          <p className="truncate text-sm font-semibold">Trip details</p>
        </div>
        <span className={`flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold ${trip.live ? 'bg-online/10 text-online' : 'bg-muted text-muted-foreground'}`}>
          <span className={`h-1.5 w-1.5 rounded-full ${trip.live ? 'bg-online' : 'bg-offline'}`} />
          {trip.live ? 'LIVE' : 'COMPLETED'}
        </span>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] text-muted-foreground">
        <span className="flex items-center gap-1.5"><CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />{trip.date}</span>
        <span className="flex items-center gap-1.5"><Clock3 className="h-3.5 w-3.5" aria-hidden="true" />{trip.time}</span>
        <span className="flex items-center gap-1.5"><Route className="h-3.5 w-3.5" aria-hidden="true" />{trip.distance}</span>
        <span className="flex items-center gap-1.5"><Timer className="h-3.5 w-3.5" aria-hidden="true" />{trip.duration}</span>
      </div>

      <div
        className="relative mt-3 h-1.5 rounded-full bg-muted"
        role="progressbar"
        aria-label={isOpenEndedLiveTrip ? 'Live trip with unknown destination' : 'Trip progress'}
        aria-valuemin={isOpenEndedLiveTrip ? undefined : 0}
        aria-valuemax={isOpenEndedLiveTrip ? undefined : 100}
        aria-valuenow={isOpenEndedLiveTrip ? undefined : progress}
      >
        <div className="absolute inset-y-0 left-0 rounded-full bg-route" style={{ width: `${progress}%` }} />
        {isOpenEndedLiveTrip && (
          <div
            className="absolute inset-y-0 right-0 opacity-35"
            style={{
              left: `${progress}%`,
              backgroundImage: 'repeating-linear-gradient(to right, var(--route) 0 6px, transparent 6px 11px)',
            }}
          />
        )}
        <span className="absolute -top-1 left-0 h-3.5 w-3.5 -translate-x-1/2 rounded-full border-2 border-route-contrast bg-route" />
        <span className="absolute -top-1.5 h-[18px] w-[18px] -translate-x-1/2 rounded-full border-[3px] border-route-contrast bg-route shadow-[0_4px_12px_-2px_var(--route)]" style={{ left: `${progress}%` }} />
      </div>

      <div className="mt-2.5 grid grid-cols-2 items-center gap-3 text-[11px] text-muted-foreground">
        <span className="flex min-w-0 items-center gap-1.5"><MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden="true" /><span className="truncate">{trip.from}</span></span>
        <span className="flex min-w-0 items-center justify-end gap-1.5"><Flag className="h-3.5 w-3.5 shrink-0" aria-hidden="true" /><span className="truncate text-right">{trip.to ?? 'Destination not set'}</span></span>
      </div>
    </section>
  )
}
