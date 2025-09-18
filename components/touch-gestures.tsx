"use client"

import type React from "react"

import { useEffect, useRef } from "react"
import type { ReviewAction } from "@/lib/types"

interface TouchGesturesProps {
  onSwipe: (action: ReviewAction) => void
  children: React.ReactNode
  disabled?: boolean
}

export function TouchGestures({ onSwipe, children, disabled = false }: TouchGesturesProps) {
  const touchStartRef = useRef<{ x: number; y: number } | null>(null)
  const elementRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const element = elementRef.current
    if (!element || disabled) return

    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0]
      touchStartRef.current = { x: touch.clientX, y: touch.clientY }
    }

    const handleTouchEnd = (e: TouchEvent) => {
      if (!touchStartRef.current) return

      const touch = e.changedTouches[0]
      const deltaX = touch.clientX - touchStartRef.current.x
      const deltaY = touch.clientY - touchStartRef.current.y
      const absDeltaX = Math.abs(deltaX)
      const absDeltaY = Math.abs(deltaY)

      // Minimum swipe distance
      const minSwipeDistance = 50

      // Ensure horizontal swipe is more significant than vertical
      if (absDeltaX > minSwipeDistance && absDeltaX > absDeltaY * 1.5) {
        e.preventDefault()

        if (deltaX > 0) {
          // Swipe right - Accept
          onSwipe("accept")
        } else {
          // Swipe left - Reject
          onSwipe("reject")
        }
      } else if (absDeltaY > minSwipeDistance && absDeltaY > absDeltaX * 1.5 && deltaY > 0) {
        // Swipe down - Doable
        e.preventDefault()
        onSwipe("doable")
      }

      touchStartRef.current = null
    }

    const handleTouchMove = (e: TouchEvent) => {
      // Prevent default scrolling during potential swipe
      if (touchStartRef.current) {
        const touch = e.touches[0]
        const deltaX = Math.abs(touch.clientX - touchStartRef.current.x)
        const deltaY = Math.abs(touch.clientY - touchStartRef.current.y)

        if (deltaX > 20 || deltaY > 20) {
          e.preventDefault()
        }
      }
    }

    element.addEventListener("touchstart", handleTouchStart, { passive: false })
    element.addEventListener("touchend", handleTouchEnd, { passive: false })
    element.addEventListener("touchmove", handleTouchMove, { passive: false })

    return () => {
      element.removeEventListener("touchstart", handleTouchStart)
      element.removeEventListener("touchend", handleTouchEnd)
      element.removeEventListener("touchmove", handleTouchMove)
    }
  }, [onSwipe, disabled])

  return (
    <div ref={elementRef} className="touch-none">
      {children}
    </div>
  )
}
