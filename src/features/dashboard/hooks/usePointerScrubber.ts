import { useCallback, useRef, type PointerEvent as ReactPointerEvent } from 'react'

type PointerScrubberOptions = {
  itemCount: number
  onIndexChange: (index: number) => void
  leftInset?: number
}

export function usePointerScrubber({ itemCount, onIndexChange, leftInset = 0 }: PointerScrubberOptions) {
  const scrubberRef = useRef<HTMLDivElement>(null)
  const maximumIndex = Math.max(0, itemCount - 1)

  const updateFromPointer = useCallback((clientX: number) => {
    const bounds = scrubberRef.current?.getBoundingClientRect()
    if (!bounds || itemCount < 2) return
    const start = bounds.left + leftInset
    const width = Math.max(1, bounds.width - leftInset)
    const ratio = Math.min(1, Math.max(0, (clientX - start) / width))
    onIndexChange(Math.round(ratio * maximumIndex))
  }, [itemCount, leftInset, maximumIndex, onIndexChange])

  const onPointerDown = useCallback((event: ReactPointerEvent<HTMLDivElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId)
    updateFromPointer(event.clientX)
  }, [updateFromPointer])

  const onPointerMove = useCallback((event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) updateFromPointer(event.clientX)
  }, [updateFromPointer])

  const onPointerUp = useCallback((event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId)
  }, [])

  return { scrubberRef, onPointerDown, onPointerMove, onPointerUp }
}
