import { ArrowLeft, CalendarDays, Clock3, MapPin } from 'lucide-react'
import { Button } from '../../../components/ui/Button'
import type { Trip, Vehicle } from '../types'

type TripsPanelProps = {
  activeVehicle: Vehicle
  trips: Trip[]
  selectedTripId: string
  onBack: () => void
  onTripSelect: (trip: Trip) => void
}

export function TripsPanel({ activeVehicle, trips, selectedTripId, onBack, onTripSelect }: TripsPanelProps) {
  return (
    <div className="animate-fade-in">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={onBack} className="h-8 w-8 rounded-full" aria-label="Deselect vehicle and return to vehicles">
          <ArrowLeft />
        </Button>
        <div>
          <h2 className="text-sm font-semibold">Trips</h2>
          <p className="text-xs text-muted-foreground">{activeVehicle.name} · {activeVehicle.plate}</p>
        </div>
      </div>
      <ul className="glass-scrollbar mt-3 max-h-[52vh] space-y-2 overflow-y-auto">
        {trips.map((trip) => (
          <li key={trip.id}>
            <Button
              variant="ghost"
              onClick={() => onTripSelect(trip)}
              className={`h-auto w-full flex-col items-stretch gap-2 rounded-2xl px-3 py-3 text-left ${trip.id === selectedTripId ? 'bg-card shadow-sm hover:bg-card' : 'hover:bg-card/60'}`}
            >
              <span className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-xs font-normal text-muted-foreground"><CalendarDays className="h-3.5 w-3.5" />{trip.date}</span>
                <span className={`flex items-center gap-1.5 text-[11px] font-semibold ${trip.live ? 'text-online' : 'text-muted-foreground'}`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${trip.live ? 'bg-online' : 'bg-offline'}`} />
                  {trip.live ? 'LIVE' : 'COMPLETED'}
                </span>
              </span>
              <span className="flex items-center gap-1.5 text-xs font-normal text-muted-foreground"><Clock3 className="h-3.5 w-3.5" />{trip.time}</span>
              <span className="flex items-center justify-between text-xs font-normal"><span>{trip.distance}</span><span className="text-muted-foreground">{trip.duration}</span></span>
              <span className="flex items-start gap-1.5 text-[11px] font-normal text-muted-foreground">
                <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{trip.to ? `${trip.from} → ${trip.to}` : `${trip.from} · No destination`}</span>
              </span>
            </Button>
          </li>
        ))}
      </ul>
    </div>
  )
}
