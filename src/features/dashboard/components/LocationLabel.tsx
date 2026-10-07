import { useReverseGeocoding } from '../hooks/useReverseGeocoding'
import { formatCoordinate } from '../utils/format'

type LocationLabelProps = {
  latitude?: number | null
  longitude?: number | null
  className?: string
  emptyLabel?: string
}

export function LocationLabel({ latitude, longitude, className, emptyLabel }: LocationLabelProps) {
  const fallback = latitude == null || longitude == null ? emptyLabel ?? formatCoordinate(latitude, longitude) : formatCoordinate(latitude, longitude)
  const { location, loading } = useReverseGeocoding(latitude, longitude)
  const label = loading ? 'Resolving location…' : location ?? fallback
  return <span className={className} title={location ?? fallback}>{label}</span>
}
