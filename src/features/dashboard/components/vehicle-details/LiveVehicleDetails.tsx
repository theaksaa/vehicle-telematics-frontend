import { Fingerprint, Gauge, Zap } from 'lucide-react'
import type { TelemetryPoint, Vehicle } from '../../types'
import { LocationMetric } from './LocationMetric'
import { MetricGrid, type Metric } from './MetricGrid'
import { SpeedReading } from './SpeedReading'

type LiveVehicleDetailsProps = {
  vehicle: Vehicle
  sample?: TelemetryPoint
}

export function LiveVehicleDetails({ vehicle, sample }: LiveVehicleDetailsProps) {
  const speed = sample?.vehicleSpeedKph ?? sample?.gnssSpeedKph ?? vehicle.state?.speedKph ?? 0
  const rpm = sample?.rpm ?? vehicle.state?.rpm
  const metrics: Metric[] = [
    { label: 'RPM', value: rpm?.toLocaleString('en-US').replace(',', ' ') ?? '—', Icon: Gauge, wide: false },
    { label: 'Accelerator', value: sample?.acceleratorPct != null ? `${Math.round(sample.acceleratorPct)}%` : '—', Icon: Zap, wide: false },
    { label: 'VIN', value: vehicle.vin ?? 'Not provided', Icon: Fingerprint, wide: true },
  ]
  return <><SpeedReading speed={speed} /><MetricGrid metrics={metrics} /><LocationMetric label="Current location" latitude={sample?.latitude ?? vehicle.state?.latitude} longitude={sample?.longitude ?? vehicle.state?.longitude} debounceMs={500} /></>
}
