import { useEffect, useState } from 'react'
import { getVehicleTrips } from '../api'
import type { Trip } from '../types'
import { handleLoadError } from './errors'

type TripsResult = {
  vehicleId: number
  trips: Trip[]
  error: string | null
}

export function useVehicleTrips(vehicleId: number | null, onUnauthorized: () => void) {
  const [result, setResult] = useState<TripsResult | null>(null)

  useEffect(() => {
    if (vehicleId == null) return
    let cancelled = false

    const load = () => getVehicleTrips(vehicleId)
      .then((page) => {
        if (!cancelled) setResult({ vehicleId, trips: page.content, error: null })
      })
      .catch((error: unknown) => {
        const message = handleLoadError(error, 'Could not load trips.', onUnauthorized)
        if (!cancelled && message) setResult({ vehicleId, trips: [], error: message })
      })

    void load()
    const interval = window.setInterval(load, 5_000)

    return () => {
      cancelled = true
      window.clearInterval(interval)
    }
  }, [onUnauthorized, vehicleId])

  const currentResult = result?.vehicleId === vehicleId ? result : null
  return {
    trips: currentResult?.trips ?? [],
    loading: vehicleId != null && currentResult == null,
    error: currentResult?.error ?? null,
  }
}
