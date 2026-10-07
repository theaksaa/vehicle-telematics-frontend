export type PlaybackPosition = {
  maximumIndex: number
  safeIndex: number
  progress: number
}

export function getPlaybackPosition(itemCount: number, requestedIndex: number): PlaybackPosition {
  const maximumIndex = Math.max(0, itemCount - 1)
  const safeIndex = Math.min(Math.max(requestedIndex, 0), maximumIndex)
  const progress = maximumIndex === 0 ? (itemCount === 1 ? 100 : 0) : (safeIndex / maximumIndex) * 100

  return { maximumIndex, safeIndex, progress }
}
