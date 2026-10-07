import { CircleMarker, Polyline } from 'react-leaflet'
import type { TelemetryPoint } from '../../types'
import { getPlaybackPosition } from '../../utils/playback'
import { toRoutePositions } from './positions'

type TripRouteProps = {
  selectedTripId: number | null
  telemetry: TelemetryPoint[]
  sampleIndex: number
}

export function TripRoute({ selectedTripId, telemetry, sampleIndex }: TripRouteProps) {
  const route = toRoutePositions(telemetry)
  const { safeIndex } = getPlaybackPosition(telemetry.length, sampleIndex)
  const travelledRoute = toRoutePositions(telemetry.slice(0, safeIndex + 1))
  const playbackPosition = travelledRoute[travelledRoute.length - 1]

  return (
    <>
      {route.length > 1 && <Polyline positions={route} pathOptions={{ color: '#94a3b8', weight: 5, opacity: 0.72 }} />}
      {travelledRoute.length > 1 && <Polyline positions={travelledRoute} pathOptions={{ color: '#3b82f6', weight: 5, opacity: 0.95 }} />}
      {selectedTripId != null && playbackPosition && (
        <CircleMarker
          center={playbackPosition}
          radius={8}
          pathOptions={{ color: '#ffffff', weight: 3, fillColor: '#3b82f6', fillOpacity: 1 }}
        />
      )}
    </>
  )
}
