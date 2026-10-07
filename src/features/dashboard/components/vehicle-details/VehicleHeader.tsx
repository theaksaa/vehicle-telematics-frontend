import van from '../../../../assets/van.jpg'
import type { Trip, Vehicle } from '../../types'
import { formatRelativeTime } from '../../utils/format'

export function VehicleHeader({ vehicle, trip }: { vehicle: Vehicle; trip?: Trip | null }) {
  const online = Boolean(vehicle.state?.online)
  return <div className="flex items-center gap-3">
    <img src={van} alt={`${vehicle.manufacturer} ${vehicle.model}`} loading="lazy" width={912} height={736} className="h-14 w-16 rounded-2xl object-cover" />
    <div className="min-w-0"><p className="truncate text-sm font-semibold">{vehicle.manufacturer} {vehicle.model}</p><p className="text-xs text-muted-foreground">{vehicle.registration}</p>
      {!trip && <p className="mt-1 flex items-center gap-1.5 text-xs"><span className={`h-1.5 w-1.5 rounded-full ${online ? 'bg-online' : 'bg-offline'}`} /><span className={online ? 'text-online' : 'text-muted-foreground'}>{online ? 'Online' : 'Offline'}</span><span className="text-muted-foreground">· {formatRelativeTime(vehicle.state?.lastTelemetryAt)}</span></p>}
    </div>
  </div>
}
