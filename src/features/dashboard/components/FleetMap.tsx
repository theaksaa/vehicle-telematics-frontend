import 'leaflet/dist/leaflet.css'
import { useEffect, useRef } from 'react'
import type { LatLngBoundsExpression, LatLngExpression } from 'leaflet'
import { CircleMarker, MapContainer, Polyline, TileLayer, Tooltip, useMap, ZoomControl } from 'react-leaflet'
import type { TelemetryPoint, Vehicle } from '../types'

const BELGRADE_CENTER: [number, number] = [44.8125, 20.4612]

type FleetMapProps = {
  vehicles: Vehicle[]
  selectedVehicleId: number | null
  selectedTripId: number | null
  telemetry: TelemetryPoint[]
  sampleIndex: number
  onVehicleSelect: (vehicle: Vehicle) => void
}

function MapViewport({ vehicles, selectedVehicleId, selectedTripId, telemetry }: Pick<FleetMapProps, 'vehicles' | 'selectedVehicleId' | 'selectedTripId' | 'telemetry'>) {
  const map = useMap()
  const fleetPositioned = useRef(false)
  const lastRouteKey = useRef('')
  const lastCenteredVehicleId = useRef<number | null>(null)

  useEffect(() => {
    const route = telemetry
      .filter((point) => point.latitude != null && point.longitude != null)
      .map((point) => [point.latitude!, point.longitude!] as LatLngExpression)

    if (selectedTripId == null) lastRouteKey.current = ''

    if (selectedTripId != null && route.length > 0) {
      const first = route[0]
      const last = route[route.length - 1]
      const routeKey = `${selectedTripId}-${first.toString()}-${last.toString()}-${route.length}`

      if (routeKey !== lastRouteKey.current) {
        if (route.length > 1) {
          map.fitBounds(route as LatLngBoundsExpression, { padding: [80, 80], maxZoom: 15 })
        } else {
          map.setView(route[0], 15, { animate: true })
        }
        lastRouteKey.current = routeKey
      }
      return
    }

    const selectedVehicle = vehicles.find((vehicle) => vehicle.id === selectedVehicleId)
    if (
      selectedVehicleId != null
      && selectedVehicleId !== lastCenteredVehicleId.current
      && selectedVehicle?.state?.latitude != null
      && selectedVehicle.state.longitude != null
    ) {
      map.setView([selectedVehicle.state.latitude, selectedVehicle.state.longitude], Math.max(map.getZoom(), 14), { animate: true })
      lastCenteredVehicleId.current = selectedVehicleId
      return
    }

    if (selectedVehicleId == null) lastCenteredVehicleId.current = null

    if (fleetPositioned.current) return

    const vehiclePositions = vehicles
      .filter((vehicle) => vehicle.state?.latitude != null && vehicle.state.longitude != null)
      .map((vehicle) => [vehicle.state!.latitude!, vehicle.state!.longitude!] as LatLngExpression)

    if (vehiclePositions.length > 1) {
      map.fitBounds(vehiclePositions as LatLngBoundsExpression, { padding: [80, 80], maxZoom: 15 })
      fleetPositioned.current = true
    } else if (vehiclePositions.length === 1) {
      map.setView(vehiclePositions[0], 14)
      fleetPositioned.current = true
    }
  }, [map, selectedTripId, selectedVehicleId, telemetry, vehicles])

  return null
}

export function FleetMap({ vehicles, selectedVehicleId, selectedTripId, telemetry, sampleIndex, onVehicleSelect }: FleetMapProps) {
  const route = telemetry
    .filter((point) => point.latitude != null && point.longitude != null)
    .map((point) => [point.latitude!, point.longitude!] as LatLngExpression)
  const safeIndex = Math.min(Math.max(sampleIndex, 0), Math.max(0, telemetry.length - 1))
  const travelledRoute = telemetry
    .slice(0, safeIndex + 1)
    .filter((point) => point.latitude != null && point.longitude != null)
    .map((point) => [point.latitude!, point.longitude!] as LatLngExpression)
  const playbackPosition = travelledRoute[travelledRoute.length - 1]

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
        <MapViewport vehicles={vehicles} selectedVehicleId={selectedVehicleId} selectedTripId={selectedTripId} telemetry={telemetry} />
        {route.length > 1 && <Polyline positions={route} pathOptions={{ color: '#94a3b8', weight: 5, opacity: 0.72 }} />}
        {travelledRoute.length > 1 && <Polyline positions={travelledRoute} pathOptions={{ color: '#3b82f6', weight: 5, opacity: 0.95 }} />}
        {vehicles.map((vehicle) => {
          if (vehicle.state?.latitude == null || vehicle.state.longitude == null) return null
          if (selectedTripId != null && vehicle.id === selectedVehicleId) return null
          const selected = vehicle.id === selectedVehicleId
          return (
            <CircleMarker
              key={vehicle.id}
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
        })}
        {selectedTripId != null && playbackPosition && (
          <CircleMarker
            center={playbackPosition}
            radius={8}
            pathOptions={{ color: '#ffffff', weight: 3, fillColor: '#3b82f6', fillOpacity: 1 }}
          />
        )}
        <ZoomControl position="bottomright" />
      </MapContainer>
    </div>
  )
}
