import { useState } from 'react'
import type { DashboardMode, Trip, Vehicle } from '../types'

export type DesktopPanel = 'vehicles' | 'trips'
export type SelectionPanel = DesktopPanel | null

export function useDashboardSelection() {
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [selectedTripId, setSelectedTripId] = useState<number | null>(null)
  const [mode, setMode] = useState<DashboardMode>('tracking')
  const [desktopPanel, setDesktopPanel] = useState<DesktopPanel>('vehicles')
  const [selectionPanel, setSelectionPanel] = useState<SelectionPanel>(null)

  const selectVehicle = (vehicle: Vehicle) => {
    if (vehicle.id === selectedId && desktopPanel === 'trips') return
    setSelectedId(vehicle.id)
    setSelectedTripId(null)
    setDesktopPanel('trips')
    setMode('tracking')
  }

  const selectTrip = (trip: Trip) => {
    if (trip.id === selectedTripId) return
    setSelectedTripId(trip.id)
    setMode('tracking')
  }

  const followLiveTrip = () => {
    setSelectedTripId(null)
    setMode('tracking')
  }

  const selectVehicleFromPanel = (vehicle: Vehicle) => {
    selectVehicle(vehicle)
    setSelectionPanel('trips')
  }

  const selectTripFromPanel = (trip: Trip) => {
    selectTrip(trip)
    setSelectionPanel(null)
  }

  const deselectVehicle = () => {
    setSelectedId(null)
    setSelectedTripId(null)
    setDesktopPanel('vehicles')
    setMode('tracking')
  }

  const returnToVehicles = () => {
    deselectVehicle()
    setSelectionPanel('vehicles')
  }

  return {
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
  }
}
