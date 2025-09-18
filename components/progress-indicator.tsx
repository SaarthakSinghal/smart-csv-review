"use client"

interface ProgressIndicatorProps {
  current: number
  total: number
}

export function ProgressIndicator({ current, total }: ProgressIndicatorProps) {
  const percentage = (current / total) * 100

  return (
    <div className="flex items-center gap-3">
      <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
        <div className="h-full bg-primary transition-all duration-300 ease-out" style={{ width: `${percentage}%` }} />
      </div>
      <span className="text-sm font-medium text-muted-foreground">
        {current} / {total}
      </span>
    </div>
  )
}
