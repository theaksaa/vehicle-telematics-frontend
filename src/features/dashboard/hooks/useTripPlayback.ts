import { useEffect, useState } from 'react'
import { getTrip, getTripTelemetry } from '../api'
import type { TelemetryPoint, Trip } from '../types'
import { getPlaybackPosition } from '../utils/playback'
import { handleLoadError } from './errors'

type PlaybackResult = {
  tripId: number
  trip: Trip | null
  telemetry: TelemetryPoint[]
  error: string | null
}

export function useTripPlayback(tripId: number | null, onUnauthorized: () => void) {
  const [result, setResult] = useState<PlaybackResult | null>(null)
  const [sampleIndex, setSampleIndex] = useState(0)

  useEffect(() => {
    if (tripId == null) return
    let cancelled = false

    Promise.all([getTrip(tripId), getTripTelemetry(tripId)])
      .then(([trip, telemetry]) => {
        if (cancelled) return
        setResult({ tripId, trip, telemetry: telemetry.content, error: null })
        setSampleIndex(Math.max(0, telemetry.content.length - 1))
      })
      .catch((error: unknown) => {
        const message = handleLoadError(error, 'Could not open this trip.', onUnauthorized)
        if (!cancelled && message) setResult({ tripId, trip: null, telemetry: [], error: message })
      })

    return () => { cancelled = true }
  }, [onUnauthorized, tripId])

  const currentResult = result?.tripId === tripId ? result : null
  const telemetry = currentResult?.telemetry ?? []
  const { safeIndex } = getPlaybackPosition(telemetry.length, sampleIndex)

  return {
    trip: currentResult?.trip ?? null,
    telemetry,
    loading: tripId != null && currentResult == null,
    error: currentResult?.error ?? null,
    sampleIndex,
    setSampleIndex,
    selectedSample: telemetry[safeIndex],
  }
}
