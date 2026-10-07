import { Calendar, Clock3, Fingerprint, Gauge, MapPin, WifiOff, Zap } from 'lucide-react'
import van from '../../../assets/van.jpg'
import type { TelemetryPoint, Trip, Vehicle } from '../types'
import { formatDate, formatRelativeTime, formatTime } from '../utils/format'
import { LocationLabel } from './LocationLabel'

type VehicleDetailsProps = {
  vehicle: Vehicle
  trip?: Trip | null
  sample?: TelemetryPoint
}

type Metric = {
  label: string
  value: string
  Icon: typeof Gauge
  wide: boolean
}

function Metrics({ metrics }: { metrics: Metric[] }) {
  return (
    <dl className="mt-4 grid grid-cols-2 gap-2">
      {metrics.map(({ label, value, Icon, wide }) => (
        <div key={label} className={`flex items-center gap-2.5 rounded-2xl border border-white/20 bg-white/20 px-3 py-2.5 ${wide ? 'col-span-2' : ''}`}>
          <Icon className="h-5 w-5 shrink-0 text-route" strokeWidth={1.8} aria-hidden="true" />
          <div className="min-w-0">
            <dt className="truncate text-[10px] text-muted-foreground">{label}</dt>
            <dd className="truncate text-sm font-medium tabular-nums">{value}</dd>
          </div>
        </div>
      ))}
    </dl>
  )
}

export function VehicleDetails({ vehicle, trip, sample }: VehicleDetailsProps) {
  const online = Boolean(vehicle.state?.online)
  const showingTrip = Boolean(trip)
  const tripStatusActive = trip?.status === 'OPEN'
  const currentMetrics: Metric[] = [
    { label: 'RPM', value: vehicle.state?.rpm?.toLocaleString('en-US').replace(',', ' ') ?? '—', Icon: Gauge, wide: false },
    { label: 'Year', value: vehicle.year?.toString() ?? '—', Icon: Calendar, wide: false },
    { label: 'VIN', value: vehicle.vin ?? 'Not provided', Icon: Fingerprint, wide: true },
  ]
  const tripMetrics: Metric[] = sample ? [
    { label: 'RPM', value: sample.rpm?.toLocaleString('en-US').replace(',', ' ') ?? '—', Icon: Gauge, wide: false },
    { label: 'Accelerator', value: sample.acceleratorPct != null ? `${Math.round(sample.acceleratorPct)}%` : '—', Icon: Zap, wide: false },
    { label: 'VIN', value: vehicle.vin ?? 'Not provided', Icon: Fingerprint, wide: true },
  ] : []
  const offlineMetrics: Metric[] = [
    { label: 'Last seen', value: formatRelativeTime(vehicle.state?.lastTelemetryAt), Icon: Clock3, wide: false },
    { label: 'Year', value: vehicle.year?.toString() ?? '—', Icon: Calendar, wide: false },
    { label: 'VIN', value: vehicle.vin ?? 'Not provided', Icon: Fingerprint, wide: true },
  ]
  const speed = sample?.vehicleSpeedKph ?? sample?.gnssSpeedKph ?? vehicle.state?.speedKph ?? 0

  return (
    <section className="glass absolute right-6 top-24 z-30 hidden w-[320px] rounded-3xl p-4 lg:block">
      <div className="flex items-center gap-3">
        <img src={van} alt={`${vehicle.manufacturer} ${vehicle.model}`} loading="lazy" width={912} height={736} className="h-14 w-16 rounded-2xl object-cover" />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{vehicle.manufacturer} {vehicle.model}</p>
          <p className="text-xs text-muted-foreground">{vehicle.registration}</p>
          {showingTrip ? (
            <p className="mt-1 flex items-center gap-1.5 text-[11px]">
              <span className={`h-1.5 w-1.5 rounded-full ${tripStatusActive ? 'bg-online' : 'bg-offline'}`} />
              <span className={tripStatusActive ? 'text-online' : 'text-muted-foreground'}>Trip #{trip?.id}</span>
              {sample && <span className="truncate text-muted-foreground">· {formatDate(sample.recordedAt)} · {formatTime(sample.recordedAt)}</span>}
            </p>
          ) : (
            <p className="mt-1 flex items-center gap-1.5 text-xs">
              <span className={`h-1.5 w-1.5 rounded-full ${online ? 'bg-online' : 'bg-offline'}`} />
              <span className={online ? 'text-online' : 'text-muted-foreground'}>{online ? 'Online' : 'Offline'}</span>
              <span className="text-muted-foreground">· {formatRelativeTime(vehicle.state?.lastTelemetryAt)}</span>
            </p>
          )}
        </div>
      </div>

      {showingTrip ? (
        sample ? (
          <>
            <div className="mt-4 flex items-end gap-2">
              <span className="text-5xl font-semibold leading-none tabular-nums">{Math.round(speed)}</span>
              <span className="pb-1 text-sm text-muted-foreground">km/h</span>
            </div>
            <Metrics metrics={tripMetrics} />
            <dl className="mt-2">
              <div className="flex items-center gap-2.5 rounded-2xl border border-white/20 bg-white/20 px-3 py-2.5">
                <MapPin className="h-5 w-5 shrink-0 text-route" strokeWidth={1.8} aria-hidden="true" />
                <div className="min-w-0">
                  <dt className="truncate text-[10px] text-muted-foreground">Recorded location</dt>
                  <dd className="truncate text-sm font-medium"><LocationLabel latitude={sample.latitude} longitude={sample.longitude} /></dd>
                </div>
              </div>
            </dl>
          </>
        ) : (
          <div className="mt-4 rounded-2xl border border-white/20 bg-white/25 px-3.5 py-4 text-center text-xs text-muted-foreground">
            No telemetry is available for this trip.
          </div>
        )
      ) : online ? (
        <>
          <div className="mt-4 flex items-end gap-2">
            <span className="text-5xl font-semibold leading-none tabular-nums">{Math.round(speed)}</span>
            <span className="pb-1 text-sm text-muted-foreground">km/h</span>
          </div>
          <Metrics metrics={currentMetrics} />
        </>
      ) : (
        <>
          <div className="mt-4 flex items-center gap-3 rounded-2xl border border-white/20 bg-white/25 px-3.5 py-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-muted">
              <WifiOff className="h-4.5 w-4.5 text-muted-foreground" strokeWidth={1.8} aria-hidden="true" />
            </span>
            <div>
              <p className="text-xs font-semibold">Vehicle is offline</p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">Live telemetry is currently unavailable.</p>
            </div>
          </div>
          <Metrics metrics={offlineMetrics} />
          <dl className="mt-2">
            <div className="flex items-center gap-2.5 rounded-2xl border border-white/20 bg-white/20 px-3 py-2.5">
              <MapPin className="h-5 w-5 shrink-0 text-route" strokeWidth={1.8} aria-hidden="true" />
              <div className="min-w-0">
                <dt className="truncate text-[10px] text-muted-foreground">Last known location</dt>
                <dd className="truncate text-sm font-medium"><LocationLabel latitude={vehicle.state?.latitude} longitude={vehicle.state?.longitude} /></dd>
              </div>
            </div>
          </dl>
        </>
      )}
      {vehicle.description && <p className="mt-4 text-xs leading-relaxed text-muted-foreground">{vehicle.description}</p>}
    </section>
  )
}
