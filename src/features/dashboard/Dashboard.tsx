import { useMemo, useState } from 'react'
import { toChartTelemetry } from './utils/format'
import { useTripPlayback } from './hooks/useTripPlayback'
import { useVehicleTrips } from './hooks/useVehicleTrips'
import { useVehicles } from './hooks/useVehicles'
import { useDashboardSelection } from './hooks/useDashboardSelection'
import { DashboardHeader } from './components/DashboardHeader'
import { AnalyticsPanel } from './components/AnalyticsPanel'
import { FleetMap } from './components/FleetMap'
import { TripSummary } from './components/TripSummary'
import { TripsPanel } from './components/TripsPanel'
import { VehicleDetails } from './components/VehicleDetails'
import { VehicleList } from './components/VehicleList'
import { FullscreenSelectionPanel } from './components/selection/FullscreenSelectionPanel'
import { CompactVehicleDetails } from './components/vehicle-details/CompactVehicleDetails'

type DashboardProps = {
  onUnauthorized?: () => void
}

const reloadOnUnauthorized = () => window.location.reload()

export function Dashboard({ onUnauthorized = reloadOnUnauthorized }: DashboardProps = {}) {
  const [query, setQuery] = useState('')
  const {
    selectedId,
    selectedTripId,
    mode,
    setMode,
    desktopPanel,
    selectionPanel,
    setSelectionPanel,
    selectVehicle,
    selectTrip,
    selectVehicleFromPanel,
    selectTripFromPanel,
    deselectVehicle,
    returnToVehicles,
  } = useDashboardSelection()
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

  return (
    <main className="relative h-dvh w-full overflow-hidden bg-background font-sans text-foreground">
      <FleetMap vehicles={vehicles} selectedVehicleId={selectedId} selectedTripId={selectedTripId} telemetry={tripTelemetry} sampleIndex={sampleIndex} onVehicleSelect={selectVehicle} />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-background/50 via-transparent to-background/40" />

      <DashboardHeader
        mode={mode}
        showNavigation={Boolean(selectedTrip && chartTelemetry.length)}
        onModeChange={setMode}
        onOpenVehicles={() => setSelectionPanel(activeVehicle ? 'trips' : 'vehicles')}
        hasSelectedVehicle={Boolean(activeVehicle)}
      />

      {activeVehicle && <CompactVehicleDetails vehicle={activeVehicle} trip={selectedTrip} sample={selectedTelemetry} />}

      <section className="glass absolute left-6 top-6 z-30 hidden w-72 flex-col gap-3 rounded-3xl p-4 lg:flex">
        {desktopPanel === 'vehicles' || !activeVehicle ? (
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
      {selectionPanel === 'vehicles' && (
        <FullscreenSelectionPanel title="Vehicles" subtitle="Choose a vehicle to see its trips" onClose={() => setSelectionPanel(null)}>
          <VehicleList
            vehicles={filteredVehicles}
            selectedId={selectedId}
            query={query}
            loading={vehiclesLoading}
            error={vehiclesError}
            onQueryChange={setQuery}
            onVehicleSelect={selectVehicleFromPanel}
            variant="fullscreen"
          />
        </FullscreenSelectionPanel>
      )}

      {selectionPanel === 'trips' && activeVehicle && (
        <FullscreenSelectionPanel title="Trips" subtitle={`${activeVehicle.manufacturer} ${activeVehicle.model} · ${activeVehicle.registration}`} onClose={() => setSelectionPanel(null)} onBack={returnToVehicles}>
          <TripsPanel
            trips={trips}
            selectedTripId={selectedTripId}
            loading={tripsLoading}
            error={tripsError}
            onBack={returnToVehicles}
            onTripSelect={selectTripFromPanel}
            variant="fullscreen"
          />
        </FullscreenSelectionPanel>
      )}
    </main>
  )
}
