import type { LucideIcon } from 'lucide-react'

export type Metric = { label: string; value: string; Icon: LucideIcon; wide: boolean }

export function MetricGrid({ metrics }: { metrics: Metric[] }) {
  return <dl className="mt-4 grid grid-cols-2 gap-2">{metrics.map(({ label, value, Icon, wide }) => (
    <div key={label} className={`flex items-center gap-2.5 rounded-2xl border border-white/20 bg-white/20 px-3 py-2.5 ${wide ? 'col-span-2' : ''}`}>
      <Icon className="h-5 w-5 shrink-0 text-route" strokeWidth={1.8} aria-hidden="true" />
      <div className="min-w-0"><dt className="truncate text-[10px] text-muted-foreground">{label}</dt><dd className="truncate text-sm font-medium tabular-nums">{value}</dd></div>
    </div>
  ))}</dl>
}
