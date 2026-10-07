import { ApiError } from '../api'

export function handleLoadError(error: unknown, fallback: string, onUnauthorized: () => void) {
  if (error instanceof ApiError && error.status === 401) {
    onUnauthorized()
    return null
  }

  return error instanceof Error ? error.message : fallback
}
