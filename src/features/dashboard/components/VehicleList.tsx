import { ChevronRight } from 'lucide-react'
import { Button } from '../../../components/ui/Button'
import type { Vehicle } from '../types'
import { formatRelativeTime } from '../utils/format'

type VehicleListProps = {
  vehicles: Vehicle[]
  selectedId: number | null
  query: string
  loading: boolean
  error: string | null
  onQueryChange: (value: string) => void
  onVehicleSelect: (vehicle: Vehicle) => void
}

export function VehicleList({ vehicles, selectedId, query, loading, error, onQueryChange, onVehicleSelect }: VehicleListProps) {
  const onlineCount = vehicles.filter((vehicle) => vehicle.state?.online).length
  const offlineCount = vehicles.length - onlineCount

  return (
    <div className="animate-fade-in">
      <div className="flex items-baseline justify-between">
        <h2 className="text-sm font-semibold">Vehicles</h2>
        <span className="text-xs text-muted-foreground">{onlineCount} online · {offlineCount} offline</span>
      </div>
      <input
        value={query}
        onChange={(event) => onQueryChange(event.target.value)}
        placeholder="Search vehicle or plate"
        className="mt-3 w-full rounded-xl border border-glass bg-card/70 px-3 py-2 text-xs outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
      />
      <ul className="glass-scrollbar mt-3 max-h-[46vh] space-y-1 overflow-y-auto">
        {loading && <li className="px-3 py-6 text-center text-xs text-muted-foreground">Loading vehicles…</li>}
        {error && <li className="rounded-xl bg-danger/10 px-3 py-3 text-xs text-danger">{error}</li>}
        {!loading && !error && vehicles.length === 0 && <li className="px-3 py-6 text-center text-xs text-muted-foreground">No vehicles found.</li>}
        {vehicles.map((vehicle) => (
          <li key={vehicle.id}>
            <Button
              variant="ghost"
              onClick={() => onVehicleSelect(vehicle)}
              className={`h-auto w-full justify-start gap-3 rounded-2xl px-3 py-2.5 text-left ${vehicle.id === selectedId ? 'bg-card shadow-sm hover:bg-card' : 'hover:bg-card/60'}`}
            >
              <span className={`h-2 w-2 shrink-0 rounded-full ${vehicle.state?.online ? 'bg-online' : 'bg-offline'}`} />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium">{vehicle.manufacturer} {vehicle.model}</span>
                <span className="block text-xs font-normal text-muted-foreground">{vehicle.registration} · {formatRelativeTime(vehicle.state?.lastTelemetryAt)}</span>
              </span>
              <ChevronRight className="text-muted-foreground" />
            </Button>
          </li>
        ))}
      </ul>
    </div>
  )
}
