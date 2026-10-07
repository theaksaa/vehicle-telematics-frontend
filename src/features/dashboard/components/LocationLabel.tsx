import { useEffect, useState } from 'react'
import { reverseGeocode } from '../api'
import { formatCoordinate } from '../utils/format'

const locationRequests = new Map<string, Promise<string | null>>()

function resolveLocation(latitude: number, longitude: number) {
  const key = `${latitude.toFixed(5)},${longitude.toFixed(5)}`
  const existingRequest = locationRequests.get(key)
  if (existingRequest) return existingRequest

  const request = reverseGeocode(latitude, longitude)
    .then((result) => {
      const street = [result.address.road, result.address.houseNumber].filter(Boolean).join(' ')
      const locality = result.address.city
        ?? result.address.municipality
        ?? result.address.suburb
        ?? result.address.neighbourhood
        ?? result.address.county
      const parts = [street, locality].filter(
        (part, index, values): part is string => Boolean(part) && values.indexOf(part) === index,
      )
      if (parts.length > 0) return parts.join(', ')
      return result.displayName?.trim() || null
    })
    .catch(() => null)
  locationRequests.set(key, request)
  return request
}

type LocationLabelProps = {
  latitude?: number | null
  longitude?: number | null
  className?: string
  emptyLabel?: string
}

export function LocationLabel({ latitude, longitude, className, emptyLabel }: LocationLabelProps) {
  const fallback = latitude == null || longitude == null ? emptyLabel ?? formatCoordinate(latitude, longitude) : formatCoordinate(latitude, longitude)
  const coordinateKey = latitude != null && longitude != null ? `${latitude},${longitude}` : null
  const [resolved, setResolved] = useState<{ key: string; location: string | null } | null>(null)

  useEffect(() => {
    let cancelled = false
    if (latitude == null || longitude == null || coordinateKey == null) return

    resolveLocation(latitude, longitude).then((resolvedLocation) => {
      if (cancelled) return
      setResolved({ key: coordinateKey, location: resolvedLocation })
    })

    return () => { cancelled = true }
  }, [coordinateKey, latitude, longitude])

  const location = resolved?.key === coordinateKey ? resolved.location : null
  const loading = coordinateKey != null && resolved?.key !== coordinateKey
  const label = loading ? 'Resolving location…' : location ?? fallback
  return <span className={className} title={location ?? fallback}>{label}</span>
}
