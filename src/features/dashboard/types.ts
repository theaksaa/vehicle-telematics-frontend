export type VehicleState = {
  vehicleId: number
  online: boolean
  speedKph: number | null
  rpm: number | null
  latitude: number | null
  longitude: number | null
  lastTelemetryAt: string | null
  lastLocationAt: string | null
  updatedAt: string
}

export type Vehicle = {
  id: number
  registration: string
  manufacturer: string
  model: string
  year: number | null
  vin: string | null
  description: string | null
  active: boolean
  deviceId: string | null
  createdAt: string
  updatedAt: string
  state: VehicleState | null
}

export type TripStatus = 'OPEN' | 'CLOSED'

export type Trip = {
  id: number
  vehicleId: number
  startedAt: string
  endedAt: string | null
  lastTelemetryAt: string | null
  status: TripStatus
  startLatitude: number | null
  startLongitude: number | null
  endLatitude: number | null
  endLongitude: number | null
  telemetryCount: number
}

export type TelemetryPoint = {
  id: number
  deviceId: string
  vehicleId: number | null
  tripId: number | null
  protocolVersion: number
  bootId: number
  sequenceNumber: number
  recordedAt: string
  receivedAt: string
  latitude: number | null
  longitude: number | null
  gnssSpeedKph: number | null
  vehicleSpeedKph: number | null
  rpm: number | null
  acceleratorPct: number | null
  rssiDbm: number | null
}

export type Telemetry = {
  time: string
  speed: number
  rpm: number
  acceleration: number
  x: number
  y: number
}

export type DashboardMode = 'tracking' | 'analytics'

export type PageResponse<T> = {
  content: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
}

export type ReverseGeocodingResponse = {
  latitude: number
  longitude: number
  displayName: string | null
  address: {
    houseNumber: string | null
    road: string | null
    neighbourhood: string | null
    suburb: string | null
    city: string | null
    municipality: string | null
    county: string | null
    state: string | null
    postcode: string | null
    country: string | null
    countryCode: string | null
  }
}
