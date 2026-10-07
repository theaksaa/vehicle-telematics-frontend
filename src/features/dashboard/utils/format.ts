import type { Telemetry, TelemetryPoint } from '../types'

const dateFormatter = new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
const timeFormatter = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit' })
const relativeTimeFormatter = new Intl.RelativeTimeFormat('en', { numeric: 'auto' })

export function formatDate(value: string) {
  return dateFormatter.format(new Date(value))
}

export function formatTime(value: string) {
  return timeFormatter.format(new Date(value))
}

export function formatRelativeTime(value?: string | null) {
  if (!value) return 'never'
  const seconds = Math.round((new Date(value).getTime() - Date.now()) / 1000)
  if (Math.abs(seconds) < 60) return relativeTimeFormatter.format(seconds, 'second')
  const minutes = Math.round(seconds / 60)
  if (Math.abs(minutes) < 60) return relativeTimeFormatter.format(minutes, 'minute')
  const hours = Math.round(minutes / 60)
  if (Math.abs(hours) < 24) return relativeTimeFormatter.format(hours, 'hour')
  return relativeTimeFormatter.format(Math.round(hours / 24), 'day')
}

export function formatDuration(startedAt: string, endedAt?: string | null) {
  const milliseconds = Math.max(0, new Date(endedAt ?? Date.now()).getTime() - new Date(startedAt).getTime())
  const totalMinutes = Math.round(milliseconds / 60_000)
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  return hours > 0 ? `${hours} h ${minutes} min` : `${minutes} min`
}

export function formatCoordinate(latitude?: number | null, longitude?: number | null) {
  if (latitude == null || longitude == null) return 'Location unavailable'
  return `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`
}

function distanceBetween(a: TelemetryPoint, b: TelemetryPoint) {
  if (a.latitude == null || a.longitude == null || b.latitude == null || b.longitude == null) return 0
  const toRadians = (degrees: number) => (degrees * Math.PI) / 180
  const earthRadiusKm = 6371
  const latitudeDelta = toRadians(b.latitude - a.latitude)
  const longitudeDelta = toRadians(b.longitude - a.longitude)
  const startLatitude = toRadians(a.latitude)
  const endLatitude = toRadians(b.latitude)
  const haversine = Math.sin(latitudeDelta / 2) ** 2
    + Math.cos(startLatitude) * Math.cos(endLatitude) * Math.sin(longitudeDelta / 2) ** 2
  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine))
}

export function calculateDistance(points: TelemetryPoint[]) {
  return points.slice(1).reduce((total, point, index) => total + distanceBetween(points[index], point), 0)
}

export function toChartTelemetry(points: TelemetryPoint[]): Telemetry[] {
  return points.map((point, index) => {
    const speed = point.vehicleSpeedKph ?? point.gnssSpeedKph ?? 0
    const previous = points[index - 1]
    const previousSpeed = previous?.vehicleSpeedKph ?? previous?.gnssSpeedKph ?? speed
    const seconds = previous
      ? Math.max(1, (new Date(point.recordedAt).getTime() - new Date(previous.recordedAt).getTime()) / 1000)
      : 1

    return {
      time: formatTime(point.recordedAt),
      speed: Math.round(speed),
      rpm: point.rpm ?? 0,
      acceleration: Number((((speed - previousSpeed) / 3.6) / seconds).toFixed(2)),
      x: point.longitude ?? 0,
      y: point.latitude ?? 0,
    }
  })
}
