export type Vehicle = {
  id: string
  name: string
  plate: string
  speed: number
  updated: string
  online: boolean
  fuelLevel: number
  coolantTemperature: number
  signalStrength: number
  x: number
  y: number
}

export type Trip = {
  id: string
  date: string
  time: string
  duration: string
  distance: string
  from: string
  to?: string
  live?: boolean
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

export type VehicleEvent = {
  kind: string
  tone: 'danger' | 'warning' | 'muted'
  time: string
  where: string
}
