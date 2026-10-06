import { routePoints } from '../data/dashboardData'
import type { Telemetry, Trip, Vehicle } from '../types'

export function getTelemetry(vehicle: Vehicle, trip: Trip): Telemetry[] {
  const historicalOffset = trip.live ? 0 : Number(trip.id.slice(1)) * 3

  return routePoints.map(([x, y], index) => {
    const minute = 5 + index * 9
    const hour = 14 + Math.floor(minute / 60)
    const mm = minute % 60

    return {
      time: `${String(hour).padStart(2, '0')}:${String(mm).padStart(2, '0')}`,
      speed: Math.max(0, Math.round(28 + 33 * Math.sin(index * 0.72) + (vehicle.id.charCodeAt(1) % 8) - historicalOffset)),
      rpm: Math.round(1150 + 920 * Math.abs(Math.sin(index * 0.57 + 0.5)) + historicalOffset * 16),
      acceleration: Number((Math.sin(index * 1.12) * 1.8).toFixed(1)),
      x: Math.min(88, x + (Number(vehicle.id.slice(1)) - 1) * 1.7),
      y: Math.max(12, y + (Number(vehicle.id.slice(1)) - 1) * 0.8),
    }
  })
}
