import { useEffect, useRef } from 'react'
import type { LatLngBoundsExpression, LatLngExpression } from 'leaflet'
import { useMap } from 'react-leaflet'
import type { TelemetryPoint, Vehicle } from '../../types'
import { toRoutePositions } from './positions'

type MapViewportControllerProps = {
  vehicles: Vehicle[]
  selectedVehicleId: number | null
  selectedTripId: number | null
  telemetry: TelemetryPoint[]
}

export function MapViewportController({ vehicles, selectedVehicleId, selectedTripId, telemetry }: MapViewportControllerProps) {
  const map = useMap()
  const fleetPositioned = useRef(false)
  const lastRouteKey = useRef('')
  const lastCenteredVehicleId = useRef<number | null>(null)

  useEffect(() => {
    const route = toRoutePositions(telemetry)

    if (selectedTripId == null) lastRouteKey.current = ''

    if (selectedTripId != null && route.length > 0) {
      const first = route[0]
      const last = route[route.length - 1]
      const routeKey = `${selectedTripId}-${first.join(',')}-${last.join(',')}-${route.length}`

      if (routeKey !== lastRouteKey.current) {
        if (route.length > 1) map.fitBounds(route as LatLngBoundsExpression, { padding: [80, 80], maxZoom: 15 })
        else map.setView(route[0], 15, { animate: true })
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
