import { useEffect, useMemo, useState } from 'react'
import { ApiError, getTrip, getTripTelemetry, getVehicles, getVehicleTrips } from './api'
import type { DashboardMode, TelemetryPoint, Trip, Vehicle } from './types'
import { toChartTelemetry } from './utils/format'
import { DashboardHeader } from './components/DashboardHeader'
import { AnalyticsPanel } from './components/AnalyticsPanel'
import { FleetMap } from './components/FleetMap'
import { TripSummary } from './components/TripSummary'
import { TripsPanel } from './components/TripsPanel'
import { VehicleDetails } from './components/VehicleDetails'
import { VehicleList } from './components/VehicleList'

type DashboardProps = {
  onUnauthorized?: () => void
}

const reloadOnUnauthorized = () => window.location.reload()

function errorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback
}

export function Dashboard({ onUnauthorized = reloadOnUnauthorized }: DashboardProps = {}) {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [vehiclesLoading, setVehiclesLoading] = useState(true)
  const [vehiclesError, setVehiclesError] = useState<string | null>(null)
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [panel, setPanel] = useState<'vehicles' | 'trips'>('vehicles')
  const [trips, setTrips] = useState<Trip[]>([])
  const [tripsLoading, setTripsLoading] = useState(false)
  const [tripsError, setTripsError] = useState<string | null>(null)
  const [selectedTripId, setSelectedTripId] = useState<number | null>(null)
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null)
  const [tripTelemetry, setTripTelemetry] = useState<TelemetryPoint[]>([])
  const [tripLoading, setTripLoading] = useState(false)
  const [tripError, setTripError] = useState<string | null>(null)
  const [mode, setMode] = useState<DashboardMode>('tracking')
  const [sampleIndex, setSampleIndex] = useState(0)
  const [query, setQuery] = useState('')

  useEffect(() => {
    let cancelled = false
    getVehicles()
      .then((data) => {
        if (!cancelled) setVehicles(data)
      })
      .catch((error: unknown) => {
        if (error instanceof ApiError && error.status === 401) onUnauthorized()
        else if (!cancelled) setVehiclesError(errorMessage(error, 'Could not load vehicles.'))
      })
      .finally(() => {
        if (!cancelled) setVehiclesLoading(false)
      })
    return () => { cancelled = true }
  }, [onUnauthorized])

  useEffect(() => {
    if (selectedId == null) return
    let cancelled = false
    getVehicleTrips(selectedId)
      .then((page) => {
        if (!cancelled) setTrips(page.content)
      })
      .catch((error: unknown) => {
        if (error instanceof ApiError && error.status === 401) onUnauthorized()
        else if (!cancelled) setTripsError(errorMessage(error, 'Could not load trips.'))
      })
      .finally(() => {
        if (!cancelled) setTripsLoading(false)
      })
    return () => { cancelled = true }
  }, [onUnauthorized, selectedId])

  useEffect(() => {
    if (selectedTripId == null) return
    let cancelled = false
    Promise.all([getTrip(selectedTripId), getTripTelemetry(selectedTripId)])
      .then(([trip, telemetry]) => {
        if (cancelled) return
        setSelectedTrip(trip)
        setTripTelemetry(telemetry.content)
        setSampleIndex(Math.max(0, telemetry.content.length - 1))
      })
      .catch((error: unknown) => {
        if (error instanceof ApiError && error.status === 401) onUnauthorized()
        else if (!cancelled) setTripError(errorMessage(error, 'Could not open this trip.'))
      })
      .finally(() => {
        if (!cancelled) setTripLoading(false)
      })
    return () => { cancelled = true }
  }, [onUnauthorized, selectedTripId])

  const activeVehicle = vehicles.find((vehicle) => vehicle.id === selectedId)
  const chartTelemetry = useMemo(() => toChartTelemetry(tripTelemetry), [tripTelemetry])
  const selectedTelemetry = tripTelemetry[sampleIndex] ?? tripTelemetry[tripTelemetry.length - 1]
  const filteredVehicles = vehicles.filter((vehicle) =>
    `${vehicle.manufacturer} ${vehicle.model} ${vehicle.registration}`.toLowerCase().includes(query.toLowerCase()),
  )

  const selectVehicle = (vehicle: Vehicle) => {
    if (vehicle.id === selectedId && panel === 'trips') return
    setSelectedId(vehicle.id)
    setPanel('trips')
    setTrips([])
    setTripsError(null)
    setTripsLoading(true)
    setSelectedTripId(null)
    setSelectedTrip(null)
    setTripTelemetry([])
    setTripError(null)
    setMode('tracking')
  }

  const selectTrip = (trip: Trip) => {
    if (trip.id === selectedTripId) return
    setSelectedTrip(null)
    setTripTelemetry([])
    setTripError(null)
    setTripLoading(true)
    setSelectedTripId(trip.id)
    setMode('tracking')
  }

  const deselectVehicle = () => {
    setSelectedId(null)
    setSelectedTripId(null)
    setSelectedTrip(null)
    setTripTelemetry([])
    setPanel('vehicles')
    setMode('tracking')
  }

  return (
    <main className="relative h-dvh min-h-[720px] w-full overflow-hidden bg-background font-sans text-foreground">
      <FleetMap vehicles={vehicles} selectedVehicleId={selectedId} selectedTripId={selectedTripId} telemetry={tripTelemetry} sampleIndex={sampleIndex} onVehicleSelect={selectVehicle} />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-background/50 via-transparent to-background/40" />

      <DashboardHeader mode={mode} showNavigation={Boolean(selectedTrip && chartTelemetry.length)} onModeChange={setMode} />

      <section className="glass absolute left-3 top-20 z-30 flex w-[min(288px,calc(100%-1.5rem))] flex-col gap-3 rounded-3xl p-4 sm:left-6 sm:top-24">
        {panel === 'vehicles' || !activeVehicle ? (
          <VehicleList
            vehicles={filteredVehicles}
            selectedId={selectedId}
            query={query}
            loading={vehiclesLoading}
            error={vehiclesError}
            onQueryChange={setQuery}
            onVehicleSelect={selectVehicle}
          />
        ) : (
          <TripsPanel
            trips={trips}
            selectedTripId={selectedTripId}
            loading={tripsLoading}
            error={tripsError}
            onBack={deselectVehicle}
            onTripSelect={selectTrip}
          />
        )}
      </section>

      {activeVehicle && <VehicleDetails vehicle={activeVehicle} trip={selectedTrip} sample={selectedTelemetry} />}

      {tripLoading && <div className="glass absolute bottom-6 left-1/2 z-30 -translate-x-1/2 rounded-2xl px-4 py-3 text-xs text-muted-foreground">Opening trip…</div>}
      {tripError && <div className="glass absolute bottom-6 left-1/2 z-30 -translate-x-1/2 rounded-2xl px-4 py-3 text-xs text-danger">{tripError}</div>}
      {selectedTrip && !tripLoading && (
        mode === 'tracking' ? (
          <TripSummary trip={selectedTrip} telemetry={tripTelemetry} sampleIndex={sampleIndex} onSampleIndexChange={setSampleIndex} />
        ) : (
          <AnalyticsPanel telemetry={chartTelemetry} sampleIndex={sampleIndex} onSampleIndexChange={setSampleIndex} />
        )
      )}
    </main>
  )
}
