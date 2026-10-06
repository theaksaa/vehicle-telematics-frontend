import { lazy, Suspense, useState } from 'react'
import { baseTrips, routePoints, vehicles } from './data/dashboardData'
import type { DashboardMode, Trip, Vehicle } from './types'
import { getTelemetry } from './utils/telemetry'
import { DashboardHeader } from './components/DashboardHeader'
import { FleetMap } from './components/FleetMap'
import { TripSummary } from './components/TripSummary'
import { TripsPanel } from './components/TripsPanel'
import { VehicleDetails } from './components/VehicleDetails'
import { VehicleList } from './components/VehicleList'

const AnalyticsPanel = lazy(() =>
  import('./components/AnalyticsPanel').then(({ AnalyticsPanel: Component }) => ({ default: Component })),
)

export function Dashboard() {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [panel, setPanel] = useState<'vehicles' | 'trips'>('vehicles')
  const [selectedTripId, setSelectedTripId] = useState('live')
  const [mode, setMode] = useState<DashboardMode>('tracking')
  const [sampleIndex, setSampleIndex] = useState(routePoints.length - 1)
  const [query, setQuery] = useState('')

  const activeVehicle = selectedId ? vehicles.find((vehicle) => vehicle.id === selectedId) : undefined
  const trips = activeVehicle
    ? activeVehicle.online && activeVehicle.speed > 0
      ? baseTrips
      : baseTrips.filter((trip) => !trip.live)
    : []
  const selectedTrip = trips.find((trip) => trip.id === selectedTripId) ?? trips[0]
  const telemetry = activeVehicle && selectedTrip ? getTelemetry(activeVehicle, selectedTrip) : []
  const sample = telemetry[sampleIndex] ?? telemetry[telemetry.length - 1]

  const filteredVehicles = vehicles.filter((vehicle) => `${vehicle.name} ${vehicle.plate}`.toLowerCase().includes(query.toLowerCase()))

  const selectVehicle = (vehicle: Vehicle) => {
    setSelectedId(vehicle.id)
    setPanel('trips')
    setSelectedTripId(vehicle.online && vehicle.speed > 0 ? 'live' : 't1')
    setSampleIndex(routePoints.length - 1)
  }

  const selectTrip = (trip: Trip) => {
    setSelectedTripId(trip.id)
    setSampleIndex(trip.live ? routePoints.length - 1 : Math.floor(routePoints.length * 0.64))
  }

  const deselectVehicle = () => {
    setSelectedId(null)
    setPanel('vehicles')
    setMode('tracking')
  }

  return (
    <main className="relative h-dvh min-h-[720px] w-full overflow-hidden bg-background font-sans text-foreground">
      <FleetMap />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-background/50 via-transparent to-background/40" />

      <DashboardHeader mode={mode} showNavigation={Boolean(activeVehicle)} onModeChange={setMode} />

      <section className="glass absolute left-3 top-20 z-30 flex w-[min(288px,calc(100%-1.5rem))] flex-col gap-3 rounded-3xl p-4 sm:left-6 sm:top-24">
        {panel === 'vehicles' || !activeVehicle || !selectedTrip ? (
          <VehicleList vehicles={filteredVehicles} selectedId={selectedId} query={query} onQueryChange={setQuery} onVehicleSelect={selectVehicle} />
        ) : (
          <TripsPanel activeVehicle={activeVehicle} trips={trips} selectedTripId={selectedTrip.id} onBack={deselectVehicle} onTripSelect={selectTrip} />
        )}
      </section>

      {activeVehicle && selectedTrip && sample && (
        <>
          <VehicleDetails vehicle={activeVehicle} sample={sample} mode={mode} />
          {mode === 'tracking' ? (
            <TripSummary trip={selectedTrip} progress={selectedTrip.live ? 64 : 100} />
          ) : (
            <Suspense fallback={<div className="glass absolute bottom-6 left-1/2 z-30 -translate-x-1/2 rounded-2xl px-4 py-3 text-xs text-muted-foreground">Loading analytics…</div>}>
              <AnalyticsPanel telemetry={telemetry} sampleIndex={sampleIndex} onSampleIndexChange={setSampleIndex} />
            </Suspense>
          )}
        </>
      )}
    </main>
  )
}
