import type { TelemetryPoint, Trip, Vehicle } from '../types'
import { LiveVehicleDetails } from './vehicle-details/LiveVehicleDetails'
import { OfflineVehicleDetails } from './vehicle-details/OfflineVehicleDetails'
import { TripPlaybackDetails } from './vehicle-details/TripPlaybackDetails'
import { VehicleHeader } from './vehicle-details/VehicleHeader'

type VehicleDetailsProps = {
  vehicle: Vehicle
  trip?: Trip | null
  sample?: TelemetryPoint
}

export function VehicleDetails({ vehicle, trip, sample }: VehicleDetailsProps) {
  return (
    <section className="glass absolute right-6 top-24 z-30 hidden w-[320px] rounded-3xl p-4 lg:block">
      <VehicleHeader vehicle={vehicle} trip={trip} sample={sample} />
      {trip ? (
        <TripPlaybackDetails vehicle={vehicle} sample={sample} />
      ) : vehicle.state?.online ? (
        <LiveVehicleDetails vehicle={vehicle} />
      ) : (
        <OfflineVehicleDetails vehicle={vehicle} />
      )}
      {vehicle.description && <p className="mt-4 text-xs leading-relaxed text-muted-foreground">{vehicle.description}</p>}
    </section>
  )
}
