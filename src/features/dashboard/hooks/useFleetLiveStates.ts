import { Client, type IMessage, type StompSubscription } from '@stomp/stompjs'
import { useEffect, useMemo, useState } from 'react'
import { getVehicleState } from '../api'
import type { TelemetryPoint, Vehicle, VehicleState } from '../types'

function websocketUrl() {
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
  return `${protocol}//${window.location.host}/ws`
}

type DeviceStateMessage = {
  deviceId?: string
  status?: string
  lastSeenAt?: string | null
}

function parseState(message: IMessage): DeviceStateMessage | null {
  try {
    const state = JSON.parse(message.body) as unknown
    return state && typeof state === 'object' ? state as DeviceStateMessage : null
  } catch {
    return null
  }
}

function parseTelemetry(message: IMessage): TelemetryPoint | null {
  try {
    const point = JSON.parse(message.body) as Partial<TelemetryPoint>
    return typeof point.deviceId === 'string' && typeof point.recordedAt === 'string'
      ? point as TelemetryPoint
      : null
  } catch {
    return null
  }
}

export function useFleetLiveStates(vehicles: Vehicle[]) {
  const [states, setStates] = useState<Record<number, VehicleState>>({})
  const [latestTelemetry, setLatestTelemetry] = useState<Record<number, TelemetryPoint>>({})
  const devices = useMemo(
    () => vehicles.flatMap((vehicle) => vehicle.deviceId ? [{ vehicleId: vehicle.id, deviceId: vehicle.deviceId }] : []),
    [vehicles],
  )
  const deviceKey = devices.map(({ vehicleId, deviceId }) => `${vehicleId}:${deviceId}`).join('|')

  useEffect(() => {
    if (devices.length === 0) return
    let cancelled = false
    const subscriptions: StompSubscription[] = []
    const client = new Client({
      brokerURL: websocketUrl(),
      reconnectDelay: 3_000,
      heartbeatIncoming: 10_000,
      heartbeatOutgoing: 10_000,
      onConnect: () => {
        devices.forEach(({ vehicleId, deviceId }) => {
          subscriptions.push(client.subscribe(`/topic/devices/${deviceId}/state`, (message) => {
            const messageState = parseState(message)
            if (!messageState || cancelled || (messageState.deviceId && messageState.deviceId !== deviceId)) return
            const normalizedStatus = messageState.status?.toUpperCase()
            if (normalizedStatus !== 'ONLINE' && normalizedStatus !== 'OFFLINE') return
            setStates((current) => {
              const fallback = vehicles.find((vehicle) => vehicle.id === vehicleId)?.state
              const previous = current[vehicleId] ?? fallback
              const base: VehicleState = previous ?? {
                vehicleId,
                online: false,
                speedKph: null,
                rpm: null,
                latitude: null,
                longitude: null,
                lastTelemetryAt: null,
                lastLocationAt: null,
                updatedAt: new Date().toISOString(),
              }
              const changedAt = messageState.lastSeenAt ?? new Date().toISOString()
              return {
                ...current,
                [vehicleId]: {
                  ...base,
                  vehicleId,
                  online: normalizedStatus === 'ONLINE',
                  updatedAt: changedAt,
                },
              }
            })
          }))
          subscriptions.push(client.subscribe(`/topic/devices/${deviceId}/telemetry`, (message) => {
            const point = parseTelemetry(message)
            if (!point || point.deviceId !== deviceId || cancelled) return
            setLatestTelemetry((current) => ({ ...current, [vehicleId]: point }))
            setStates((current) => {
              const fallback = vehicles.find((vehicle) => vehicle.id === vehicleId)?.state
              const previous = current[vehicleId] ?? fallback
              const base: VehicleState = previous ?? {
                vehicleId,
                online: false,
                speedKph: null,
                rpm: null,
                latitude: null,
                longitude: null,
                lastTelemetryAt: null,
                lastLocationAt: null,
                updatedAt: point.receivedAt,
              }
              const hasLocation = point.latitude != null && point.longitude != null
              return {
                ...current,
                [vehicleId]: {
                  ...base,
                  vehicleId,
                  online: true,
                  speedKph: point.vehicleSpeedKph ?? point.gnssSpeedKph ?? base.speedKph,
                  rpm: point.rpm ?? base.rpm,
                  latitude: hasLocation ? point.latitude : base.latitude,
                  longitude: hasLocation ? point.longitude : base.longitude,
                  lastTelemetryAt: point.recordedAt,
                  lastLocationAt: hasLocation ? point.recordedAt : base.lastLocationAt,
                  updatedAt: point.receivedAt,
                },
              }
            })
          }))
        })
      },
    })

    client.activate()

    let statePolling = false
    const reconcileFleetStates = async () => {
      if (statePolling || cancelled) return
      statePolling = true
      try {
        const results = await Promise.allSettled(devices.map(async ({ vehicleId }) => ({
          vehicleId,
          state: await getVehicleState(vehicleId),
        })))
        if (cancelled) return
        setStates((current) => {
          const next = { ...current }
          results.forEach((result) => {
            if (result.status === 'fulfilled') next[result.value.vehicleId] = result.value.state
          })
          return next
        })
      } finally {
        statePolling = false
      }
    }

    void reconcileFleetStates()
    const stateReconciliationInterval = window.setInterval(reconcileFleetStates, 5_000)

    return () => {
      cancelled = true
      window.clearInterval(stateReconciliationInterval)
      subscriptions.forEach((subscription) => subscription.unsubscribe())
      void client.deactivate()
    }
  // deviceKey intentionally represents the subscription set without reconnecting for state updates.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deviceKey])

  return { states, latestTelemetry }
}
