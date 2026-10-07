import { Fingerprint, Gauge, Zap } from 'lucide-react'
import type { TelemetryPoint, Vehicle } from '../../types'
import { LocationMetric } from './LocationMetric'
import { MetricGrid, type Metric } from './MetricGrid'
import { SpeedReading } from './SpeedReading'

export function TripPlaybackDetails({ vehicle, sample }: { vehicle: Vehicle; sample?: TelemetryPoint }) {
  if (!sample) return <div className="mt-4 rounded-2xl border border-white/20 bg-white/25 px-3.5 py-4 text-center text-xs text-muted-foreground">No telemetry is available for this trip.</div>
  const metrics: Metric[] = [
    { label: 'RPM', value: sample.rpm?.toLocaleString('en-US').replace(',', ' ') ?? '—', Icon: Gauge, wide: false },
    { label: 'Accelerator', value: sample.acceleratorPct != null ? `${Math.round(sample.acceleratorPct)}%` : '—', Icon: Zap, wide: false },
    { label: 'VIN', value: vehicle.vin ?? 'Not provided', Icon: Fingerprint, wide: true },
  ]
  return <><SpeedReading speed={sample.vehicleSpeedKph ?? sample.gnssSpeedKph ?? 0} /><MetricGrid metrics={metrics} /><LocationMetric label="Recorded location" latitude={sample.latitude} longitude={sample.longitude} /></>
}
