import { useEffect, useState } from 'react'
import { reverseGeocode } from '../api'
import type { ReverseGeocodingResponse } from '../types'

const locationRequests = new Map<string, Promise<string | null>>()

function coordinateKey(latitude: number, longitude: number) {
  return `${latitude.toFixed(5)},${longitude.toFixed(5)}`
}

function formatLocation(result: ReverseGeocodingResponse) {
  const street = [result.address.road, result.address.houseNumber].filter(Boolean).join(' ')
  const locality = result.address.city
    ?? result.address.municipality
    ?? result.address.suburb
    ?? result.address.neighbourhood
    ?? result.address.county
  const parts = [street, locality].filter(
    (part, index, values): part is string => Boolean(part) && values.indexOf(part) === index,
  )

  return parts.length > 0 ? parts.join(', ') : result.displayName?.trim() || null
}

function resolveLocation(latitude: number, longitude: number) {
  const key = coordinateKey(latitude, longitude)
  const existingRequest = locationRequests.get(key)
  if (existingRequest) return existingRequest

  const request = reverseGeocode(latitude, longitude)
    .then(formatLocation)
    .catch(() => {
      locationRequests.delete(key)
      return null
    })
  locationRequests.set(key, request)
  return request
}

export function useReverseGeocoding(latitude?: number | null, longitude?: number | null) {
  const key = latitude != null && longitude != null ? coordinateKey(latitude, longitude) : null
  const [resolved, setResolved] = useState<{ key: string; location: string | null } | null>(null)

  useEffect(() => {
    if (latitude == null || longitude == null || key == null) return
    let cancelled = false

    resolveLocation(latitude, longitude).then((location) => {
      if (!cancelled) setResolved({ key, location })
    })

    return () => { cancelled = true }
  }, [key, latitude, longitude])

  return {
    location: resolved?.key === key ? resolved.location : null,
    loading: key != null && resolved?.key !== key,
  }
}
