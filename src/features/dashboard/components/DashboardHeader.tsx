import { Button } from '../../../components/ui/Button'
import type { DashboardMode } from '../types'

type DashboardHeaderProps = {
  mode: DashboardMode
  showNavigation: boolean
  onModeChange: (mode: DashboardMode) => void
}

export function DashboardHeader({ mode, showNavigation, onModeChange }: DashboardHeaderProps) {
  return (
    <header className="absolute inset-x-0 top-0 z-30 flex items-center justify-between px-3 py-3 sm:px-6 sm:py-4">
      <div className="glass flex items-center gap-2.5 rounded-2xl px-4 py-2.5">
        <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-route">
          <span className="h-2 w-2 rounded-[3px] bg-route-contrast" />
        </span>
        <span className="text-[15px] font-semibold">Vehicle Telematics</span>
      </div>

      {showNavigation && (
        <nav className="glass flex items-center gap-1 rounded-2xl p-1.5" aria-label="Dashboard view">
          {(['tracking', 'analytics'] as const).map((item) => (
            <Button
              key={item}
              variant="ghost"
              size="sm"
              onClick={() => onModeChange(item)}
              aria-pressed={mode === item}
              className={`rounded-xl px-3.5 capitalize ${mode === item ? 'bg-card text-foreground shadow-sm hover:bg-card' : 'text-muted-foreground hover:bg-card/60 hover:text-foreground'}`}
            >
              {item}
            </Button>
          ))}
        </nav>
      )}
    </header>
  )
}
