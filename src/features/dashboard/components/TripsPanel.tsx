import { ArrowLeft, CalendarDays, Clock3, Flag, MapPin } from 'lucide-react'
import { Button } from '../../../components/ui/Button'
import type { Trip } from '../types'
import { formatDate, formatDuration, formatTime } from '../utils/format'
import { LocationLabel } from './LocationLabel'

type TripsPanelProps = {
  trips: Trip[]
  selectedTripId: number | null
  loading: boolean
  error: string | null
  onBack: () => void
  onTripSelect: (trip: Trip) => void
  vehicleOnline?: boolean
  variant?: 'card' | 'fullscreen'
}

export function TripsPanel({ trips, selectedTripId, loading, error, onBack, onTripSelect, vehicleOnline = false, variant = 'card' }: TripsPanelProps) {
  const fullscreen = variant === 'fullscreen'
  const orderedTrips = [...trips].sort((a, b) => {
    if (a.status !== b.status) return a.status === 'OPEN' ? -1 : 1
    return new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()
  })
  return (
    <div className={`animate-fade-in ${fullscreen ? 'flex min-h-0 flex-1 flex-col' : ''}`}>
      {!fullscreen && <div className="flex h-5 items-center gap-1.5">
          <Button variant="ghost" size="icon" onClick={onBack} className="h-5 w-5 rounded-full [&_svg]:size-3.5" aria-label="Deselect vehicle and return to vehicles">
            <ArrowLeft />
          </Button>
        <h2 className="text-sm font-semibold">Trips</h2>
      </div>}
      {vehicleOnline && <div className="mt-3 flex items-center gap-2 rounded-xl bg-online/10 px-3 py-2 text-[11px] font-semibold text-online"><span className="h-2 w-2 animate-pulse rounded-full bg-online" />Vehicle is online · Live tracking available</div>}
      <ul className={`glass-scrollbar mt-3 space-y-2 overflow-y-auto ${fullscreen ? 'max-h-none flex-1 pb-4' : 'max-h-[52vh]'}`}>
        {loading && <li className="px-3 py-6 text-center text-xs text-muted-foreground">Loading trips…</li>}
        {error && <li className="rounded-xl bg-danger/10 px-3 py-3 text-xs text-danger">{error}</li>}
        {!loading && !error && trips.length === 0 && <li className="px-3 py-6 text-center text-xs text-muted-foreground">This vehicle has no trips yet.</li>}
        {orderedTrips.map((trip) => {
          const isLive = trip.status === 'OPEN' && vehicleOnline
          return <li key={trip.id}>
            <Button
              variant="ghost"
              onClick={() => onTripSelect(trip)}
              className={`h-auto w-full flex-col items-stretch gap-2.5 rounded-2xl px-3 py-3 text-left ${trip.id === selectedTripId ? 'bg-card shadow-sm hover:bg-card' : 'hover:bg-card/60'}`}
            >
              <span className="flex items-center justify-between">
                <span className="text-sm font-semibold">{isLive ? 'Live tracking' : `Trip #${trip.id}`}</span>
                <span className={`flex items-center gap-1.5 text-[11px] font-semibold ${isLive ? 'text-online' : 'text-muted-foreground'}`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${isLive ? 'bg-online' : 'bg-offline'}`} />
                  {isLive ? 'LIVE' : trip.status === 'OPEN' ? 'FINALIZING' : 'COMPLETED'}
                </span>
              </span>
              <span className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-normal text-muted-foreground">
                <span className="flex items-center gap-1.5"><CalendarDays className="h-3.5 w-3.5" />{formatDate(trip.startedAt)}</span>
                <span className="flex items-center gap-1.5"><Clock3 className="h-3.5 w-3.5" />{formatTime(trip.startedAt)} — {trip.endedAt ? formatTime(trip.endedAt) : 'now'} · {formatDuration(trip.startedAt, trip.endedAt)}</span>
              </span>
              <span className="space-y-1.5 text-[11px] font-normal text-muted-foreground">
                <span className="flex min-w-0 items-start gap-1.5">
                  <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  <LocationLabel latitude={trip.startLatitude} longitude={trip.startLongitude} className="truncate" emptyLabel="Start location unavailable" />
                </span>
                <span className="flex min-w-0 items-start gap-1.5">
                  <Flag className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  {isLive ? <span>—</span> : <LocationLabel latitude={trip.endLatitude} longitude={trip.endLongitude} className="truncate" emptyLabel="Destination unavailable" />}
                </span>
              </span>
            </Button>
          </li>
        })}
      </ul>
    </div>
  )
}
