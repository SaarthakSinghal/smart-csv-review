"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useCSVStore } from "@/lib/csv-store"
import { ReviewCard } from "@/components/review-card"
import { ReviewNavigation } from "@/components/review-navigation"
import { ProgressIndicator } from "@/components/progress-indicator"
import { KeyboardShortcuts } from "@/components/keyboard-shortcuts"
import { TouchGestures } from "@/components/touch-gestures"
import { AppNavigation } from "@/components/app-navigation"
import { Button } from "@/components/ui/button"
import { List, ArrowLeft } from "lucide-react"

export default function ReviewPage() {
  const router = useRouter()
  const { csvData, currentIndex, setCurrentIndex, reviewItem } = useCSVStore()
  const [showShortcuts, setShowShortcuts] = useState(false)
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false)

  useEffect(() => {
    // Redirect if no data
    if (csvData.length === 0) {
      router.push("/upload")
      return
    }

    // Keyboard event handler
    const handleKeyPress = (e: KeyboardEvent) => {
      // Prevent default for our shortcuts
      if (["ArrowLeft", "ArrowRight", "ArrowDown", " ", "KeyJ", "KeyK"].includes(e.code)) {
        e.preventDefault()
      }

      switch (e.code) {
        case "ArrowLeft":
          reviewItem("reject")
          break
        case "ArrowRight":
          reviewItem("accept")
          break
        case "ArrowDown":
          reviewItem("doable")
          break
        case "Space":
          setIsDescriptionExpanded(!isDescriptionExpanded)
          break
        case "KeyJ":
          if (currentIndex < csvData.length - 1) {
            setCurrentIndex(currentIndex + 1)
          }
          break
        case "KeyK":
          if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1)
          }
          break
        case "Slash":
          if (e.shiftKey) {
            setShowShortcuts(!showShortcuts)
          }
          break
      }
    }

    window.addEventListener("keydown", handleKeyPress)
    return () => window.removeEventListener("keydown", handleKeyPress)
  }, [csvData, currentIndex, reviewItem, setCurrentIndex, isDescriptionExpanded, showShortcuts, router])

  if (csvData.length === 0) {
    return null
  }

  const currentItem = csvData[currentIndex]
  const isLastItem = currentIndex === csvData.length - 1

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5 relative">
      <AppNavigation />

      {/* Header */}
      <div className="absolute top-20 left-0 right-0 z-10 bg-background/80 backdrop-blur-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => router.push("/upload")} className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back to Upload
              </Button>
              <ProgressIndicator current={currentIndex + 1} total={csvData.length} />
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowShortcuts(!showShortcuts)} className="gap-2">
                ?
              </Button>
              <Button variant="outline" size="sm" onClick={() => router.push("/lists")} className="gap-2">
                <List className="w-4 h-4" />
                View Lists
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="pt-40 pb-8 px-4">
        <div className="container mx-auto max-w-4xl">
          <TouchGestures onSwipe={reviewItem}>
            <ReviewCard
              item={currentItem}
              totalItems={csvData.length}
              isDescriptionExpanded={isDescriptionExpanded}
              onToggleDescription={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
              onReview={reviewItem}
            />
          </TouchGestures>
        </div>
      </div>

      {/* Navigation */}
      <ReviewNavigation
        currentIndex={currentIndex}
        totalItems={csvData.length}
        onPrevious={() => currentIndex > 0 && setCurrentIndex(currentIndex - 1)}
        onNext={() => currentIndex < csvData.length - 1 && setCurrentIndex(currentIndex + 1)}
        canGoPrevious={currentIndex > 0}
        canGoNext={currentIndex < csvData.length - 1}
      />

      {/* Keyboard Shortcuts Overlay */}
      {showShortcuts && <KeyboardShortcuts onClose={() => setShowShortcuts(false)} />}

      {/* Completion Message */}
      {isLastItem && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-card border rounded-lg p-8 max-w-md text-center animate-scale-in">
            <h3 className="text-xl font-semibold mb-4">Review Complete!</h3>
            <p className="text-muted-foreground mb-6">
              You've reviewed all {csvData.length} items. Ready to see your organized lists?
            </p>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setCurrentIndex(0)}>
                Review Again
              </Button>
              <Button onClick={() => router.push("/lists")} className="gap-2">
                <List className="w-4 h-4" />
                View Lists
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
