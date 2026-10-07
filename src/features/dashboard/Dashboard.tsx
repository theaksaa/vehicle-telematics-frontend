import { useMemo, useState } from 'react'
import type { DashboardMode, Trip, Vehicle } from './types'
import { toChartTelemetry } from './utils/format'
import { useTripPlayback } from './hooks/useTripPlayback'
import { useVehicleTrips } from './hooks/useVehicleTrips'
import { useVehicles } from './hooks/useVehicles'
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

export function Dashboard({ onUnauthorized = reloadOnUnauthorized }: DashboardProps = {}) {
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [panel, setPanel] = useState<'vehicles' | 'trips'>('vehicles')
  const [selectedTripId, setSelectedTripId] = useState<number | null>(null)
  const [mode, setMode] = useState<DashboardMode>('tracking')
  const [query, setQuery] = useState('')
  const { vehicles, loading: vehiclesLoading, error: vehiclesError } = useVehicles(onUnauthorized)
  const { trips, loading: tripsLoading, error: tripsError } = useVehicleTrips(selectedId, onUnauthorized)
  const {
    trip: selectedTrip,
    telemetry: tripTelemetry,
    loading: tripLoading,
    error: tripError,
    sampleIndex,
    setSampleIndex,
    selectedSample: selectedTelemetry,
  } = useTripPlayback(selectedTripId, onUnauthorized)

  const activeVehicle = vehicles.find((vehicle) => vehicle.id === selectedId)
  const chartTelemetry = useMemo(() => toChartTelemetry(tripTelemetry), [tripTelemetry])
  const filteredVehicles = vehicles.filter((vehicle) =>
    `${vehicle.manufacturer} ${vehicle.model} ${vehicle.registration}`.toLowerCase().includes(query.toLowerCase()),
  )

  const selectVehicle = (vehicle: Vehicle) => {
    if (vehicle.id === selectedId && panel === 'trips') return
    setSelectedId(vehicle.id)
    setPanel('trips')
    setSelectedTripId(null)
    setMode('tracking')
  }

  const selectTrip = (trip: Trip) => {
    if (trip.id === selectedTripId) return
    setSelectedTripId(trip.id)
    setMode('tracking')
  }

  const deselectVehicle = () => {
    setSelectedId(null)
    setSelectedTripId(null)
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
