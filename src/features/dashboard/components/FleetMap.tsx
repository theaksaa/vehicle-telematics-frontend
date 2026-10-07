import 'leaflet/dist/leaflet.css'
import { MapContainer, TileLayer, ZoomControl } from 'react-leaflet'
import type { TelemetryPoint, Vehicle } from '../types'
import { MapViewportController } from './map/MapViewportController'
import { TripRoute } from './map/TripRoute'
import { VehicleMarkers } from './map/VehicleMarkers'

const BELGRADE_CENTER: [number, number] = [44.8125, 20.4612]

type FleetMapProps = {
  vehicles: Vehicle[]
  selectedVehicleId: number | null
  selectedTripId: number | null
  telemetry: TelemetryPoint[]
  sampleIndex: number
  onVehicleSelect: (vehicle: Vehicle) => void
}

export function FleetMap({ vehicles, selectedVehicleId, selectedTripId, telemetry, sampleIndex, onVehicleSelect }: FleetMapProps) {
  return (
    <div className="absolute inset-0 z-0" aria-label="Interactive fleet map">
      <MapContainer
        center={BELGRADE_CENTER}
        zoom={12}
        minZoom={3}
        maxZoom={19}
        zoomControl={false}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapViewportController vehicles={vehicles} selectedVehicleId={selectedVehicleId} selectedTripId={selectedTripId} telemetry={telemetry} />
        <TripRoute selectedTripId={selectedTripId} telemetry={telemetry} sampleIndex={sampleIndex} />
        <VehicleMarkers vehicles={vehicles} selectedVehicleId={selectedVehicleId} selectedTripId={selectedTripId} onVehicleSelect={onVehicleSelect} />
        <ZoomControl position="bottomright" />
      </MapContainer>
    </div>
  )
}
