import { Calendar, Clock3, Fingerprint, WifiOff } from 'lucide-react'
import type { Vehicle } from '../../types'
import { formatRelativeTime } from '../../utils/format'
import { LocationMetric } from './LocationMetric'
import { MetricGrid, type Metric } from './MetricGrid'

export function OfflineVehicleDetails({ vehicle }: { vehicle: Vehicle }) {
  const metrics: Metric[] = [
    { label: 'Last seen', value: formatRelativeTime(vehicle.state?.lastTelemetryAt), Icon: Clock3, wide: false },
    { label: 'Year', value: vehicle.year?.toString() ?? '—', Icon: Calendar, wide: false },
    { label: 'VIN', value: vehicle.vin ?? 'Not provided', Icon: Fingerprint, wide: true },
  ]
  return <><div className="mt-4 flex items-center gap-3 rounded-2xl border border-white/20 bg-white/25 px-3.5 py-3">
    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-muted"><WifiOff className="h-4.5 w-4.5 text-muted-foreground" strokeWidth={1.8} aria-hidden="true" /></span>
    <div><p className="text-xs font-semibold">Vehicle is offline</p><p className="mt-0.5 text-[11px] text-muted-foreground">Live telemetry is currently unavailable.</p></div>
  </div><MetricGrid metrics={metrics} /><LocationMetric label="Last known location" latitude={vehicle.state?.latitude} longitude={vehicle.state?.longitude} /></>
}
