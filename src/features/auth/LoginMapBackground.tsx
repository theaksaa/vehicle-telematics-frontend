import 'leaflet/dist/leaflet.css'
import { MapContainer, TileLayer } from 'react-leaflet'

export function LoginMapBackground() {
  return (
    <div className="login-map-background absolute inset-0">
      <MapContainer
        center={[49.5, 13]}
        zoom={5}
        minZoom={4}
        maxZoom={8}
        zoomControl={false}
        attributionControl
        dragging={false}
        scrollWheelZoom={false}
        doubleClickZoom={false}
        touchZoom={false}
        keyboard={false}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
      </MapContainer>
    </div>
  )
}
