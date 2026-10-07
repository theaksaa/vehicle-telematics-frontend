export function SpeedReading({ speed }: { speed: number }) {
  return <div className="mt-4 flex items-end gap-2"><span className="text-5xl font-semibold leading-none tabular-nums">{Math.round(speed)}</span><span className="pb-1 text-sm text-muted-foreground">km/h</span></div>
}
