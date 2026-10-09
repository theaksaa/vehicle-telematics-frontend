import { useEffect, useMemo, useState } from 'react'
import { toChartTelemetry } from './utils/format'
import { useTripPlayback } from './hooks/useTripPlayback'
import { useVehicleTrips } from './hooks/useVehicleTrips'
import { useVehicles } from './hooks/useVehicles'
import { useLiveVehicleTelemetry } from './hooks/useLiveVehicleTelemetry'
import { useFleetLiveStates } from './hooks/useFleetLiveStates'
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
  const [, setClock] = useState(() => Date.now())
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
    followLiveTrip,
    selectVehicleFromPanel,
    selectTripFromPanel,
    deselectVehicle,
    returnToVehicles,
  } = useDashboardSelection()
  const { vehicles, loading: vehiclesLoading, error: vehiclesError } = useVehicles(onUnauthorized)
  const { states: fleetStates, latestTelemetry } = useFleetLiveStates(vehicles)
  const fleetVehicles = useMemo(() => vehicles.map((vehicle) => (
    fleetStates[vehicle.id] ? { ...vehicle, state: fleetStates[vehicle.id] } : vehicle
  )), [fleetStates, vehicles])
  const fleetActiveVehicle = fleetVehicles.find((vehicle) => vehicle.id === selectedId)
  const { trips, loading: tripsLoading, error: tripsError } = useVehicleTrips(selectedId, onUnauthorized)
  const currentOpenTrip = trips.find((trip) => trip.status === 'OPEN') ?? null
  const {
    trip: selectedTrip,
    telemetry: tripTelemetry,
    loading: tripLoading,
    error: tripError,
    sampleIndex,
    setSampleIndex,
    selectedSample: selectedTelemetry,
  } = useTripPlayback(selectedTripId, onUnauthorized)

  const activeVehicle = fleetActiveVehicle
  const live = useLiveVehicleTelemetry(activeVehicle, currentOpenTrip, onUnauthorized)
  const displayedVehicles = useMemo(() => fleetVehicles.map((vehicle) => {
    if (vehicle.id !== activeVehicle?.id || !live.state || vehicle.state?.online === false) return vehicle
    const fleetTimestamp = new Date(vehicle.state?.lastTelemetryAt ?? 0).getTime()
    const liveTimestamp = new Date(live.state.lastTelemetryAt ?? 0).getTime()
    return liveTimestamp >= fleetTimestamp ? { ...vehicle, state: live.state } : vehicle
  }), [activeVehicle?.id, fleetVehicles, live.state])
  const displayedActiveVehicle = displayedVehicles.find((vehicle) => vehicle.id === selectedId)
  const fleetLatestPoint = selectedId == null ? undefined : latestTelemetry[selectedId]
  const liveTelemetry = useMemo(() => {
    if (!fleetLatestPoint) return live.telemetry
    const key = `${fleetLatestPoint.deviceId}:${fleetLatestPoint.bootId}:${fleetLatestPoint.sequenceNumber}`
    const withoutLatest = live.telemetry.filter((point) => `${point.deviceId}:${point.bootId}:${point.sequenceNumber}` !== key)
    return [...withoutLatest, fleetLatestPoint].sort((a, b) => {
      if (a.deviceId === b.deviceId && a.bootId === b.bootId) return a.sequenceNumber - b.sequenceNumber
      return new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime()
    })
  }, [fleetLatestPoint, live.telemetry])
  const activeTelemetry = selectedTrip ? tripTelemetry : liveTelemetry
  const liveTrip = displayedActiveVehicle?.state?.online ? (live.trip ?? currentOpenTrip) : null
  const activeTrip = selectedTrip ?? liveTrip
  const activeSampleIndex = selectedTrip ? sampleIndex : Math.max(0, liveTelemetry.length - 1)
  const setActiveSampleIndex = selectedTrip ? setSampleIndex : () => undefined
  const activeSample = selectedTrip ? selectedTelemetry : liveTelemetry[liveTelemetry.length - 1]
  const chartTelemetry = useMemo(() => toChartTelemetry(activeTelemetry), [activeTelemetry])
  const filteredVehicles = displayedVehicles.filter((vehicle) =>
    `${vehicle.manufacturer} ${vehicle.model} ${vehicle.registration}`.toLowerCase().includes(query.toLowerCase()),
  )

  useEffect(() => {
    const interval = window.setInterval(() => setClock(Date.now()), 30_000)
    return () => window.clearInterval(interval)
  }, [])

  const openTrip = (trip: typeof trips[number]) => {
    if (trip.status === 'OPEN' && displayedActiveVehicle?.state?.online) followLiveTrip()
    else selectTrip(trip)
  }

  const openTripFromPanel = (trip: typeof trips[number]) => {
    if (trip.status === 'OPEN' && displayedActiveVehicle?.state?.online) {
      followLiveTrip()
      setSelectionPanel(null)
    } else selectTripFromPanel(trip)
  }

  return (
    <main className="relative h-dvh w-full overflow-hidden bg-background font-sans text-foreground">
      <FleetMap vehicles={displayedVehicles} selectedVehicleId={selectedId} selectedTripId={selectedTripId} telemetry={activeTelemetry} sampleIndex={activeSampleIndex} live={Boolean(!selectedTrip && displayedActiveVehicle?.state?.online)} onVehicleSelect={selectVehicle} />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-background/50 via-transparent to-background/40" />

      <DashboardHeader
        mode={mode}
        showNavigation={Boolean(activeTrip && chartTelemetry.length)}
        onModeChange={setMode}
        onOpenVehicles={() => setSelectionPanel(activeVehicle ? 'trips' : 'vehicles')}
        hasSelectedVehicle={Boolean(activeVehicle)}
      />

      {displayedActiveVehicle && <CompactVehicleDetails vehicle={displayedActiveVehicle} trip={selectedTrip} sample={activeSample} />}

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
            selectedTripId={selectedTripId ?? liveTrip?.id ?? null}
            loading={tripsLoading}
            error={tripsError}
            vehicleOnline={Boolean(displayedActiveVehicle?.state?.online)}
            onBack={deselectVehicle}
            onTripSelect={openTrip}
          />
        )}
      </section>

      {displayedActiveVehicle && <VehicleDetails vehicle={displayedActiveVehicle} trip={selectedTrip} sample={activeSample} />}

      {tripLoading && <div className="glass absolute bottom-6 left-1/2 z-30 -translate-x-1/2 rounded-2xl px-4 py-3 text-xs text-muted-foreground">Opening trip…</div>}
      {tripError && <div className="glass absolute bottom-6 left-1/2 z-30 -translate-x-1/2 rounded-2xl px-4 py-3 text-xs text-danger">{tripError}</div>}
      {live.loading && !selectedTrip && <div className="glass absolute bottom-6 left-1/2 z-30 -translate-x-1/2 rounded-2xl px-4 py-3 text-xs text-muted-foreground">Loading live telemetry…</div>}
      {live.error && !selectedTrip && <div className="glass absolute bottom-6 left-1/2 z-30 -translate-x-1/2 rounded-2xl px-4 py-3 text-xs text-danger">{live.error}</div>}
      {activeTrip && !tripLoading && !live.loading && (
        mode === 'tracking' ? (
          <TripSummary trip={activeTrip} telemetry={activeTelemetry} sampleIndex={activeSampleIndex} onSampleIndexChange={setActiveSampleIndex} />
        ) : (
          <AnalyticsPanel telemetry={chartTelemetry} sampleIndex={activeSampleIndex} onSampleIndexChange={setActiveSampleIndex} />
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
            selectedTripId={selectedTripId ?? liveTrip?.id ?? null}
            loading={tripsLoading}
            error={tripsError}
            vehicleOnline={Boolean(displayedActiveVehicle?.state?.online)}
            onBack={returnToVehicles}
            onTripSelect={openTripFromPanel}
            variant="fullscreen"
          />
        </FullscreenSelectionPanel>
      )}
    </main>
  )
}
