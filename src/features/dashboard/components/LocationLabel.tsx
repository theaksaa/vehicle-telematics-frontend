import { useReverseGeocoding } from '../hooks/useReverseGeocoding'
import { formatCoordinate } from '../utils/format'

type LocationLabelProps = {
  latitude?: number | null
  longitude?: number | null
  className?: string
  emptyLabel?: string
  debounceMs?: number
}

export function LocationLabel({ latitude, longitude, className, emptyLabel, debounceMs = 0 }: LocationLabelProps) {
  const fallback = latitude == null || longitude == null ? emptyLabel ?? formatCoordinate(latitude, longitude) : formatCoordinate(latitude, longitude)
  const { location, loading } = useReverseGeocoding(latitude, longitude, debounceMs)
  const label = location ?? (loading ? 'Resolving location…' : fallback)
  return <span className={className} title={location ?? fallback}>{label}</span>
}
