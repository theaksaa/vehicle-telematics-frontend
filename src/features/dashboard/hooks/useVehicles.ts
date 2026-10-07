import { useEffect, useState } from 'react'
import { getVehicles } from '../api'
import type { Vehicle } from '../types'
import { handleLoadError } from './errors'

type VehiclesResult = {
  vehicles: Vehicle[]
  error: string | null
}

export function useVehicles(onUnauthorized: () => void) {
  const [result, setResult] = useState<VehiclesResult | null>(null)

  useEffect(() => {
    let cancelled = false

    getVehicles()
      .then((vehicles) => {
        if (!cancelled) setResult({ vehicles, error: null })
      })
      .catch((error: unknown) => {
        const message = handleLoadError(error, 'Could not load vehicles.', onUnauthorized)
        if (!cancelled && message) setResult({ vehicles: [], error: message })
      })

    return () => { cancelled = true }
  }, [onUnauthorized])

  return {
    vehicles: result?.vehicles ?? [],
    loading: result == null,
    error: result?.error ?? null,
  }
}
