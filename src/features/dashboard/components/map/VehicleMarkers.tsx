import { CircleMarker, Tooltip } from 'react-leaflet'
import type { Vehicle } from '../../types'

type VehicleMarkersProps = {
  vehicles: Vehicle[]
  selectedVehicleId: number | null
  selectedTripId: number | null
  live: boolean
  onVehicleSelect: (vehicle: Vehicle) => void
}

export function VehicleMarkers({ vehicles, selectedVehicleId, selectedTripId, live, onVehicleSelect }: VehicleMarkersProps) {
  return vehicles.map((vehicle) => {
    if (vehicle.state?.latitude == null || vehicle.state.longitude == null) return null
    if ((selectedTripId != null || live) && vehicle.id === selectedVehicleId) return null
    const selected = vehicle.id === selectedVehicleId

    return (
      <CircleMarker
        key={`${vehicle.id}:${vehicle.state.latitude}:${vehicle.state.longitude}`}
        center={[vehicle.state.latitude, vehicle.state.longitude]}
        radius={selected ? 10 : 7}
        pathOptions={{
          color: '#ffffff',
          weight: selected ? 4 : 3,
          fillColor: vehicle.state.online ? '#22c55e' : '#94a3b8',
          fillOpacity: 1,
        }}
        eventHandlers={{ click: () => onVehicleSelect(vehicle) }}
      >
        <Tooltip direction="top" offset={[0, -8]}>
          <strong>{vehicle.manufacturer} {vehicle.model}</strong><br />{vehicle.registration}
        </Tooltip>
      </CircleMarker>
    )
  })
}
