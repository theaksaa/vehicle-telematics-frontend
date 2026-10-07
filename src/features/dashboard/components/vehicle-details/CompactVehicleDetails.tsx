import { Gauge, MapPin, Radio, Zap } from 'lucide-react'
import van from '../../../../assets/van.jpg'
import type { TelemetryPoint, Trip, Vehicle } from '../../types'
import { formatRelativeTime } from '../../utils/format'
import { LocationLabel } from '../LocationLabel'

type CompactVehicleDetailsProps = {
  vehicle: Vehicle
  trip?: Trip | null
  sample?: TelemetryPoint
}

export function CompactVehicleDetails({ vehicle, trip, sample }: CompactVehicleDetailsProps) {
  const online = Boolean(vehicle.state?.online)
  const speed = sample?.vehicleSpeedKph ?? sample?.gnssSpeedKph ?? vehicle.state?.speedKph
  const rpm = sample?.rpm ?? vehicle.state?.rpm
  const accelerator = sample?.acceleratorPct
  const latitude = sample?.latitude ?? vehicle.state?.latitude
  const longitude = sample?.longitude ?? vehicle.state?.longitude

  return (
    <section className="glass absolute left-1/2 top-[72px] z-30 w-[calc(100%-1.5rem)] -translate-x-1/2 rounded-3xl p-3 sm:left-auto sm:right-6 sm:top-20 sm:w-[360px] sm:translate-x-0 lg:hidden" aria-label="Selected vehicle details">
      <div className="flex min-w-0 items-center gap-3">
        <img src={van} alt="" width={912} height={736} className="h-12 w-14 shrink-0 rounded-2xl object-cover" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{vehicle.manufacturer} {vehicle.model}</p>
          <p className="truncate text-[11px] text-muted-foreground">{vehicle.registration}{!trip && ` · ${formatRelativeTime(vehicle.state?.lastTelemetryAt)}`}</p>
        </div>
        <span className={`flex shrink-0 items-center gap-1.5 rounded-full px-2 py-1 text-[10px] font-semibold ${online ? 'bg-online/10 text-online' : 'bg-muted text-muted-foreground'}`}>
          <span className={`h-1.5 w-1.5 rounded-full ${online ? 'bg-online' : 'bg-offline'}`} />
          {online ? 'ONLINE' : 'OFFLINE'}
        </span>
      </div>

      <dl className="mt-3 grid grid-cols-3 gap-2 border-t border-glass pt-3">
        <div className="min-w-0">
          <dt className="flex items-center gap-1 text-[10px] text-muted-foreground"><Gauge className="h-3 w-3" />Speed</dt>
          <dd className="mt-0.5 truncate text-xs font-semibold tabular-nums">{speed != null ? `${Math.round(speed)} km/h` : '—'}</dd>
        </div>
        <div className="min-w-0">
          <dt className="flex items-center gap-1 text-[10px] text-muted-foreground"><Radio className="h-3 w-3" />RPM</dt>
          <dd className="mt-0.5 truncate text-xs font-semibold tabular-nums">{rpm?.toLocaleString() ?? '—'}</dd>
        </div>
        <div className="min-w-0">
          <dt className="flex items-center gap-1 text-[10px] text-muted-foreground"><Zap className="h-3 w-3" />{trip ? 'Accelerator' : 'Year'}</dt>
          <dd className="mt-0.5 truncate text-xs font-semibold tabular-nums">{trip ? (accelerator != null ? `${Math.round(accelerator)}%` : '—') : (vehicle.year ?? '—')}</dd>
        </div>
      </dl>

      <div className="mt-3 flex min-w-0 items-center gap-2 border-t border-glass pt-3 text-[11px] text-muted-foreground">
        <MapPin className="h-3.5 w-3.5 shrink-0 text-route" aria-hidden="true" />
        <LocationLabel
          latitude={latitude}
          longitude={longitude}
          className="truncate"
          emptyLabel="Location unavailable"
          debounceMs={300}
        />
      </div>
    </section>
  )
}
