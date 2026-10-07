import { Calendar, Fingerprint, Gauge } from 'lucide-react'
import type { Vehicle } from '../../types'
import { MetricGrid, type Metric } from './MetricGrid'
import { SpeedReading } from './SpeedReading'

export function LiveVehicleDetails({ vehicle }: { vehicle: Vehicle }) {
  const metrics: Metric[] = [
    { label: 'RPM', value: vehicle.state?.rpm?.toLocaleString('en-US').replace(',', ' ') ?? '—', Icon: Gauge, wide: false },
    { label: 'Year', value: vehicle.year?.toString() ?? '—', Icon: Calendar, wide: false },
    { label: 'VIN', value: vehicle.vin ?? 'Not provided', Icon: Fingerprint, wide: true },
  ]
  return <><SpeedReading speed={vehicle.state?.speedKph ?? 0} /><MetricGrid metrics={metrics} /></>
}
