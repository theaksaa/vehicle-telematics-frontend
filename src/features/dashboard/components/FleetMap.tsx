import 'leaflet/dist/leaflet.css'
import { MapContainer, TileLayer, ZoomControl } from 'react-leaflet'

const BELGRADE_CENTER: [number, number] = [44.8125, 20.4612]

export function FleetMap() {
  return (
    <div className="absolute inset-0 z-0" aria-label="Interactive fleet map">
      <MapContainer
        center={BELGRADE_CENTER}
        zoom={12}
        minZoom={3}
        maxZoom={19}
        zoomControl={false}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ZoomControl position="bottomright" />
      </MapContainer>
    </div>
  )
}
