import type { PageResponse, ReverseGeocodingResponse, TelemetryPoint, Trip, Vehicle, VehicleState } from './types'

export class ApiError extends Error {
  readonly status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    ...init,
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      ...init?.headers,
    },
  })

  if (!response.ok) {
    throw new ApiError(response.status, response.status === 401 ? 'Your session has expired.' : `Request failed (${response.status}).`)
  }

  if (response.status === 204) return undefined as T
  return response.json() as Promise<T>
}

export async function getVehicles(): Promise<Vehicle[]> {
  const vehicles = await request<Omit<Vehicle, 'state'>[]>('/api/vehicles')

  return Promise.all(
    vehicles.map(async (vehicle) => {
      try {
        const state = await request<VehicleState>(`/api/vehicles/${vehicle.id}/state`)
        return { ...vehicle, state }
      } catch (error) {
        if (!(error instanceof ApiError) || error.status === 401) throw error
        // Vehicles without an assigned device may not have initialized state yet.
        return { ...vehicle, state: null }
      }
    }),
  )
}

export function getVehicleState(vehicleId: number) {
  return request<VehicleState>(`/api/vehicles/${vehicleId}/state`, { cache: 'no-store' })
}

export function getVehicleTrips(vehicleId: number) {
  return request<PageResponse<Trip>>(`/api/vehicles/${vehicleId}/trips?size=100`)
}

export function getTrip(tripId: number) {
  return request<Trip>(`/api/trips/${tripId}`)
}

export function getTripTelemetry(tripId: number) {
  return request<PageResponse<TelemetryPoint>>(`/api/trips/${tripId}/telemetry?size=1000`)
}

export async function getLatestVehicleTelemetry(vehicleId: number) {
  const page = await request<PageResponse<TelemetryPoint>>(`/api/vehicles/${vehicleId}/telemetry?size=1`, { cache: 'no-store' })
  return page.content[0] ?? null
}

export async function getAllTripTelemetry(tripId: number) {
  const points: TelemetryPoint[] = []
  let page = 0
  let totalPages = 1

  while (page < totalPages) {
    const response = await request<PageResponse<TelemetryPoint>>(`/api/trips/${tripId}/telemetry?size=1000&page=${page}`, { cache: 'no-store' })
    points.push(...response.content)
    totalPages = response.totalPages
    page += 1
  }

  return points
}

export function reverseGeocode(latitude: number, longitude: number) {
  const query = new URLSearchParams({ lat: latitude.toString(), lon: longitude.toString() })
  return request<ReverseGeocodingResponse>(`/api/geocoding/reverse?${query}`)
}
