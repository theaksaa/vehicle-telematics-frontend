import { Fuel, Gauge, Signal, Thermometer } from 'lucide-react'
import van from '../../../assets/van.jpg'
import { vehicleEvents } from '../data/dashboardData'
import type { DashboardMode, Telemetry, Vehicle } from '../types'

type VehicleDetailsProps = {
  vehicle: Vehicle
  sample: Telemetry
  mode: DashboardMode
}

export function VehicleDetails({ vehicle, sample, mode }: VehicleDetailsProps) {
  const metrics = [
    {
      label: 'RPM',
      value: mode === 'analytics' ? sample.rpm.toLocaleString('en-US').replace(',', ' ') : '1 840',
      Icon: Gauge,
    },
    { label: 'Fuel level', value: `${vehicle.fuelLevel}%`, Icon: Fuel },
    { label: 'Network', value: vehicle.online ? `4G · ${vehicle.signalStrength}%` : 'Offline', Icon: Signal },
    { label: 'Coolant', value: `${vehicle.coolantTemperature} °C`, Icon: Thermometer },
  ]

  return (
    <section className="glass absolute right-6 top-24 z-30 hidden w-[320px] rounded-3xl p-4 lg:block">
      <div className="flex items-center gap-3">
        <img src={van} alt={vehicle.name} loading="lazy" width={912} height={736} className="h-14 w-16 rounded-2xl object-cover" />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{vehicle.name}</p>
          <p className="text-xs text-muted-foreground">{vehicle.plate}</p>
          <p className="mt-1 flex items-center gap-1.5 text-xs">
            <span className={`h-1.5 w-1.5 rounded-full ${vehicle.online ? 'bg-online' : 'bg-offline'}`} />
            <span className={vehicle.online ? 'text-online' : 'text-muted-foreground'}>{vehicle.online ? 'Online' : 'Offline'}</span>
            <span className="text-muted-foreground">· {mode === 'analytics' ? sample.time : vehicle.updated}</span>
          </p>
        </div>
      </div>
      <div className="mt-4 flex items-end gap-2">
        <span className="text-5xl font-semibold leading-none tabular-nums">{mode === 'analytics' ? sample.speed : vehicle.speed}</span>
        <span className="pb-1 text-sm text-muted-foreground">km/h</span>
      </div>
      <dl className="mt-4 grid grid-cols-2 gap-2">
        {metrics.map(({ label, value, Icon }) => (
          <div key={label} className="flex items-center gap-2.5 rounded-2xl border border-white/20 bg-white/20 px-3 py-2.5">
            <Icon className="h-5 w-5 shrink-0 text-route" strokeWidth={1.8} aria-hidden="true" />
            <div className="min-w-0">
              <dt className="truncate text-[10px] text-muted-foreground">{label}</dt>
              <dd className="truncate text-sm font-medium tabular-nums">{value}</dd>
            </div>
          </div>
        ))}
      </dl>
      <div className="mt-4">
        <p className="mb-2 text-xs font-semibold">Recent events</p>
        <ul className="glass-scrollbar max-h-[112px] space-y-1 overflow-y-auto">
          {vehicleEvents.map((event) => (
            <li key={event.time} className="flex items-center gap-2.5 rounded-xl px-1 py-1.5">
              <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${event.tone === 'danger' ? 'bg-danger' : event.tone === 'warning' ? 'bg-warning' : 'bg-offline'}`} />
              <span className="min-w-0 flex-1"><span className="block truncate text-xs font-medium">{event.kind}</span><span className="block truncate text-[11px] text-muted-foreground">{event.where}</span></span>
              <span className="text-[11px] tabular-nums text-muted-foreground">{event.time}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
