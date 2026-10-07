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
}

export function TripsPanel({ trips, selectedTripId, loading, error, onBack, onTripSelect }: TripsPanelProps) {
  return (
    <div className="animate-fade-in">
      <div className="flex h-5 items-center gap-1.5">
        <Button variant="ghost" size="icon" onClick={onBack} className="h-5 w-5 rounded-full [&_svg]:size-3.5" aria-label="Deselect vehicle and return to vehicles">
          <ArrowLeft />
        </Button>
        <h2 className="text-sm font-semibold">Trips</h2>
      </div>
      <ul className="glass-scrollbar mt-3 max-h-[52vh] space-y-2 overflow-y-auto">
        {loading && <li className="px-3 py-6 text-center text-xs text-muted-foreground">Loading trips…</li>}
        {error && <li className="rounded-xl bg-danger/10 px-3 py-3 text-xs text-danger">{error}</li>}
        {!loading && !error && trips.length === 0 && <li className="px-3 py-6 text-center text-xs text-muted-foreground">This vehicle has no trips yet.</li>}
        {trips.map((trip) => (
          <li key={trip.id}>
            <Button
              variant="ghost"
              onClick={() => onTripSelect(trip)}
              className={`h-auto w-full flex-col items-stretch gap-2.5 rounded-2xl px-3 py-3 text-left ${trip.id === selectedTripId ? 'bg-card shadow-sm hover:bg-card' : 'hover:bg-card/60'}`}
            >
              <span className="flex items-center justify-between">
                <span className="text-sm font-semibold">Trip #{trip.id}</span>
                <span className={`flex items-center gap-1.5 text-[11px] font-semibold ${trip.status === 'OPEN' ? 'text-online' : 'text-muted-foreground'}`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${trip.status === 'OPEN' ? 'bg-online' : 'bg-offline'}`} />
                  {trip.status === 'OPEN' ? 'LIVE' : 'COMPLETED'}
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
                  <LocationLabel
                    latitude={trip.endLatitude}
                    longitude={trip.endLongitude}
                    className="truncate"
                    emptyLabel={trip.status === 'OPEN' ? 'In progress' : 'Destination unavailable'}
                  />
                </span>
              </span>
            </Button>
          </li>
        ))}
      </ul>
    </div>
  )
}
