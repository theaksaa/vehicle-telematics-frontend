import { ArrowLeft, X } from 'lucide-react'
import { useEffect, useRef, type ReactNode } from 'react'
import { Button } from '../../../../components/ui/Button'

type FullscreenSelectionPanelProps = {
  title: string
  subtitle?: string
  children: ReactNode
  onClose: () => void
  onBack?: () => void
}

export function FullscreenSelectionPanel({ title, subtitle, children, onClose, onBack }: FullscreenSelectionPanelProps) {
  const panelRef = useRef<HTMLElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const onCloseRef = useRef(onClose)

  useEffect(() => {
    onCloseRef.current = onClose
  }, [onClose])

  useEffect(() => {
    const previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null
    closeButtonRef.current?.focus()

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onCloseRef.current()
        return
      }
      if (event.key !== 'Tab') return

      const focusable = panelRef.current?.querySelectorAll<HTMLElement>(
        'button:not([disabled]), input:not([disabled]), [href], [tabindex]:not([tabindex="-1"])',
      )
      if (!focusable?.length) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      previouslyFocused?.focus()
    }
  }, [])

  return (
    <section ref={panelRef} className="glass fixed inset-0 z-50 flex min-h-0 flex-col rounded-none px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-[max(1rem,env(safe-area-inset-top))] sm:px-6 lg:hidden" role="dialog" aria-modal="true" aria-label={title}>
      <header className="flex shrink-0 items-center justify-between gap-4 border-b border-border pb-4">
        <div className="flex min-w-0 items-center gap-2">
          {onBack && <Button variant="ghost" size="icon" onClick={onBack} className="h-11 w-11 shrink-0 rounded-full" aria-label="Go back"><ArrowLeft /></Button>}
          <div className="min-w-0">
            <h1 className="text-lg font-semibold">{title}</h1>
            {subtitle && <p className="mt-0.5 truncate text-xs text-muted-foreground">{subtitle}</p>}
          </div>
        </div>
        <Button ref={closeButtonRef} variant="ghost" size="icon" onClick={onClose} className="h-11 w-11 shrink-0 rounded-full" aria-label={`Close ${title.toLowerCase()}`}>
          <X />
        </Button>
      </header>
      <div className="mx-auto flex min-h-0 w-full max-w-2xl flex-1 flex-col overflow-hidden pt-4">{children}</div>
    </section>
  )
}
