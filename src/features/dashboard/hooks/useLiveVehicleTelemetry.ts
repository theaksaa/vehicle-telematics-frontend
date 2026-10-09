import { Client, type IMessage } from '@stomp/stompjs'
import { useEffect, useMemo, useRef, useState } from 'react'
import { ApiError, getAllTripTelemetry, getLatestVehicleTelemetry, getVehicleState, getVehicleTrips } from '../api'
import type { TelemetryPoint, Trip, Vehicle, VehicleState } from '../types'
import { handleLoadError } from './errors'

type LiveResult = {
  generation: number
  vehicleId: number
  trip: Trip | null
  telemetry: TelemetryPoint[]
  state: VehicleState | null
  loading: boolean
  error: string | null
}

function pointKey(point: TelemetryPoint) {
  return `${point.deviceId}:${point.bootId}:${point.sequenceNumber}`
}

function mergeTelemetry(current: TelemetryPoint[], incoming: TelemetryPoint[]) {
  const byId = new Map(current.map((point) => [pointKey(point), point]))
  incoming.forEach((point) => byId.set(pointKey(point), point))
  return [...byId.values()].sort((a, b) => {
    if (a.deviceId === b.deviceId && a.bootId === b.bootId) return a.sequenceNumber - b.sequenceNumber
    return new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime()
  })
}

function isTelemetryPoint(value: unknown): value is TelemetryPoint {
  if (!value || typeof value !== 'object') return false
  const point = value as Partial<TelemetryPoint>
  return typeof point.deviceId === 'string'
    && typeof point.bootId === 'number'
    && typeof point.sequenceNumber === 'number'
    && typeof point.recordedAt === 'string'
}

function parseMessage<T>(message: IMessage): T | null {
  try {
    return JSON.parse(message.body) as T
  } catch {
    return null
  }
}

function stateFromPoint(vehicleId: number, previous: VehicleState | null, point: TelemetryPoint): VehicleState {
  const speed = point.vehicleSpeedKph ?? point.gnssSpeedKph
  return {
    vehicleId,
    online: true,
    speedKph: speed ?? previous?.speedKph ?? null,
    rpm: point.rpm ?? previous?.rpm ?? null,
    latitude: point.latitude ?? previous?.latitude ?? null,
    longitude: point.longitude ?? previous?.longitude ?? null,
    lastTelemetryAt: point.recordedAt,
    lastLocationAt: point.latitude != null && point.longitude != null ? point.recordedAt : previous?.lastLocationAt ?? null,
    updatedAt: point.receivedAt ?? point.recordedAt,
  }
}

function websocketUrl() {
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
  return `${protocol}//${window.location.host}/ws`
}

export function useLiveVehicleTelemetry(vehicle: Vehicle | undefined, tripHint: Trip | null, onUnauthorized: () => void) {
  const [result, setResult] = useState<LiveResult | null>(null)
  const generationRef = useRef(0)
  const enabled = Boolean(vehicle?.state?.online && vehicle.deviceId)
  const vehicleId = vehicle?.id
  const deviceId = vehicle?.deviceId
  const tripHintId = tripHint?.id

  useEffect(() => {
    if (vehicleId == null || !enabled || !deviceId) return

    let cancelled = false
    let activeTripId = tripHintId
    const generation = ++generationRef.current
    const initialResult: LiveResult = { generation, vehicleId, trip: tripHint, telemetry: [], state: vehicle?.state ?? null, loading: true, error: null }
    const currentResult = (current: LiveResult | null) => current?.generation === generation ? current : initialResult

    const client = new Client({
      brokerURL: websocketUrl(),
      reconnectDelay: 3_000,
      heartbeatIncoming: 10_000,
      heartbeatOutgoing: 10_000,
      onConnect: () => {
        setResult((current) => ({ ...currentResult(current), error: null }))
        client.subscribe(`/topic/devices/${deviceId}/telemetry`, (message) => {
          const point = parseMessage<unknown>(message)
          if (!isTelemetryPoint(point) || cancelled) return
          setResult((current) => {
            current = currentResult(current)
            return {
              ...current,
              telemetry: mergeTelemetry(current.telemetry, [point]),
              state: stateFromPoint(vehicleId, current.state, point),
            }
          })
        })

        client.subscribe(`/topic/devices/${deviceId}/state`, (message) => {
          const state = parseMessage<VehicleState>(message)
          if (!state || cancelled) return
          setResult((current) => {
            const active = currentResult(current)
            return { ...active, state: { ...active.state, ...state } }
          })
        })
      },
      onStompError: (frame) => {
        if (cancelled) return
        setResult((current) => {
          const active = currentResult(current)
          return { ...active, error: frame.headers.message || 'Live connection was rejected.' }
        })
      },
      onWebSocketError: () => {
        if (cancelled) return
        setResult((current) => {
          const active = currentResult(current)
          return { ...active, error: active.error ?? 'Live connection is temporarily unavailable.' }
        })
      },
    })

    client.activate()

    let polling = false
    const reconcileLatestPoint = async () => {
      if (polling || cancelled) return
      polling = true
      try {
        const point = await getLatestVehicleTelemetry(vehicleId)
        if (!point || cancelled) return
        setResult((current) => {
          const active = currentResult(current)
          return {
            ...active,
            telemetry: mergeTelemetry(active.telemetry, [point]),
            state: stateFromPoint(vehicleId, active.state, point),
          }
        })
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) onUnauthorized()
      } finally {
        polling = false
      }
    }
    const reconciliationInterval = window.setInterval(reconcileLatestPoint, 2_000)

    let tripPolling = false
    const reconcileTripTelemetry = async () => {
      if (tripPolling || cancelled || activeTripId == null) return
      tripPolling = true
      try {
        const telemetry = await getAllTripTelemetry(activeTripId)
        if (cancelled) return
        setResult((current) => {
          const active = currentResult(current)
          return { ...active, telemetry: mergeTelemetry(active.telemetry, telemetry) }
        })
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) onUnauthorized()
      } finally {
        tripPolling = false
      }
    }
    const tripReconciliationInterval = window.setInterval(reconcileTripTelemetry, 2_000)

    let statePolling = false
    const reconcileVehicleState = async () => {
      if (statePolling || cancelled) return
      statePolling = true
      try {
        const state = await getVehicleState(vehicleId)
        if (cancelled) return
        setResult((current) => ({ ...currentResult(current), state }))
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) onUnauthorized()
      } finally {
        statePolling = false
      }
    }
    void reconcileVehicleState()
    const stateReconciliationInterval = window.setInterval(reconcileVehicleState, 1_000)

    const loadCurrentTrip = async () => {
      const openTrip = tripHint ?? (await getVehicleTrips(vehicleId)).content.find((trip) => trip.status === 'OPEN') ?? null
      return { openTrip, telemetry: openTrip ? await getAllTripTelemetry(openTrip.id) : [] }
    }

    loadCurrentTrip()
      .then(({ openTrip, telemetry }) => {
        if (cancelled) return
        activeTripId = openTrip?.id
        setResult((current) => {
          const active = currentResult(current)
          return { ...active, trip: openTrip, telemetry: mergeTelemetry(telemetry, active.telemetry), loading: false }
        })
      })
      .catch((error: unknown) => {
        const message = handleLoadError(error, 'Could not load current telemetry.', onUnauthorized)
        if (!cancelled && message) {
          setResult((current) => {
            const active = currentResult(current)
            return { ...active, loading: false, error: message }
          })
        }
      })

    return () => {
      cancelled = true
      window.clearInterval(reconciliationInterval)
      window.clearInterval(tripReconciliationInterval)
      window.clearInterval(stateReconciliationInterval)
      void client.deactivate()
    }
  // State values change for every telemetry point; reconnect only when the selected device or its online status changes.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deviceId, enabled, onUnauthorized, tripHintId, vehicleId])

  return useMemo(() => {
    if (!vehicle || !enabled || result?.vehicleId !== vehicle.id) {
      return { trip: null, telemetry: [], state: vehicle?.state ?? null, loading: enabled, error: null }
    }
    return result
  }, [enabled, result, vehicle])
}
