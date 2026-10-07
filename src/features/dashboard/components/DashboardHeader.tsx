import { CarFront } from 'lucide-react'
import { Button } from '../../../components/ui/Button'
import type { DashboardMode } from '../types'

type DashboardHeaderProps = {
  mode: DashboardMode
  showNavigation: boolean
  onModeChange: (mode: DashboardMode) => void
  onOpenVehicles: () => void
  hasSelectedVehicle: boolean
}

export function DashboardHeader({ mode, showNavigation, onModeChange, onOpenVehicles, hasSelectedVehicle }: DashboardHeaderProps) {
  return (
    <header className="absolute inset-x-0 top-0 z-30 flex items-center justify-between px-3 py-3 sm:px-6 sm:py-4">
      <Button
        variant="ghost"
        size="icon"
        onClick={onOpenVehicles}
        className="glass h-11 w-11 rounded-3xl border-glass bg-card/70 p-0 text-foreground shadow-none hover:bg-card [&_svg]:size-5 lg:hidden"
        aria-label={hasSelectedVehicle ? 'Open trips' : 'Open vehicles'}
      >
        <CarFront />
      </Button>

      {showNavigation && (
        <nav className="glass ml-auto flex items-center gap-1 rounded-2xl p-1.5" aria-label="Dashboard view">
          {(['tracking', 'analytics'] as const).map((item) => (
            <Button
              key={item}
              variant="ghost"
              size="sm"
              onClick={() => onModeChange(item)}
              aria-pressed={mode === item}
              className={`rounded-xl px-2.5 capitalize sm:px-3.5 ${mode === item ? 'bg-card text-foreground shadow-sm hover:bg-card' : 'text-muted-foreground hover:bg-card/60 hover:text-foreground'}`}
            >
              {item}
            </Button>
          ))}
        </nav>
      )}
    </header>
  )
}
