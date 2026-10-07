import { MapPin } from 'lucide-react'
import { LocationLabel } from '../LocationLabel'

export function LocationMetric({ label, latitude, longitude }: { label: string; latitude?: number | null; longitude?: number | null }) {
  return <dl className="mt-2"><div className="flex items-center gap-2.5 rounded-2xl border border-white/20 bg-white/20 px-3 py-2.5">
    <MapPin className="h-5 w-5 shrink-0 text-route" strokeWidth={1.8} aria-hidden="true" />
    <div className="min-w-0"><dt className="truncate text-[10px] text-muted-foreground">{label}</dt><dd className="truncate text-sm font-medium"><LocationLabel latitude={latitude} longitude={longitude} /></dd></div>
  </div></dl>
}
