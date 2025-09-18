"use client"

import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface ReviewNavigationProps {
  currentIndex: number
  totalItems: number
  onPrevious: () => void
  onNext: () => void
  canGoPrevious: boolean
  canGoNext: boolean
}

export function ReviewNavigation({
  currentIndex,
  totalItems,
  onPrevious,
  onNext,
  canGoPrevious,
  canGoNext,
}: ReviewNavigationProps) {
  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-10">
      <div className="flex items-center gap-3 bg-card/80 backdrop-blur-sm border rounded-full px-4 py-2 shadow-lg">
        <Button
          variant="ghost"
          size="sm"
          onClick={onPrevious}
          disabled={!canGoPrevious}
          className="rounded-full w-10 h-10 p-0"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>

        <div className="flex items-center gap-2 px-3">
          <span className="text-sm font-medium">{currentIndex + 1}</span>
          <span className="text-xs text-muted-foreground">of</span>
          <span className="text-sm font-medium">{totalItems}</span>
        </div>

        <Button variant="ghost" size="sm" onClick={onNext} disabled={!canGoNext} className="rounded-full w-10 h-10 p-0">
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}
