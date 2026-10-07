import type { LatLngTuple } from 'leaflet'
import type { TelemetryPoint } from '../../types'

export function toRoutePositions(telemetry: TelemetryPoint[]): LatLngTuple[] {
  return telemetry
    .filter((point) => point.latitude != null && point.longitude != null)
    .map((point) => [point.latitude!, point.longitude!])
}
