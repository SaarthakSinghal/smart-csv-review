"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronDown, ChevronUp, Check, Minus, X } from "lucide-react"
import type { CSVRow, ReviewAction } from "@/lib/types"
import DOMPurify from "dompurify"
import { motion, AnimatePresence } from "framer-motion"

interface ReviewCardProps {
  item: CSVRow
  isDescriptionExpanded: boolean
  onToggleDescription: () => void
  onReview: (action: ReviewAction) => void
}

export function ReviewCard({ item, isDescriptionExpanded, onToggleDescription, onReview }: ReviewCardProps) {
  const [isAnimating, setIsAnimating] = useState(false)

  const handleReview = (action: ReviewAction) => {
    setIsAnimating(true)
    setTimeout(() => {
      onReview(action)
      setIsAnimating(false)
    }, 200)
  }

  return (
    <motion.div
      key={item.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className={`transition-transform duration-200 ${isAnimating ? "scale-95" : "scale-100"}`}
    >
      <Card className="max-w-3xl mx-auto bg-gradient-to-br from-card to-accent/5 border-2 hover:shadow-xl transition-all duration-300">
        <div className="p-8 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <Badge variant="outline" className="font-mono text-sm px-3 py-1">
              {item.psNumber}
            </Badge>
            <span className="text-sm text-muted-foreground">
              {item.rowNumber} / {item.rowNumber}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-balance leading-tight">{item.title}</h1>

          {/* Description */}
          {item.description && (
            <div className="space-y-3">
              <AnimatePresence mode="wait">
                <motion.div
                  key={isDescriptionExpanded ? "expanded" : "collapsed"}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="text-muted-foreground leading-relaxed"
                >
                  <div
                    dangerouslySetInnerHTML={{
                      __html: DOMPurify.sanitize(
                        isDescriptionExpanded
                          ? item.description
                          : item.description.substring(0, 300) + (item.description.length > 300 ? "..." : ""),
                      ),
                    }}
                  />
                </motion.div>
              </AnimatePresence>

              {item.description.length > 300 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onToggleDescription}
                  className="gap-2 text-primary hover:text-primary/80"
                >
                  {isDescriptionExpanded ? (
                    <>
                      <ChevronUp className="w-4 h-4" />
                      Show Less
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-4 h-4" />
                      Read More
                    </>
                  )}
                </Button>
              )}
            </div>
          )}

          {/* Metadata */}
          <div className="flex flex-wrap gap-2 pt-4 border-t">
            {item.organisation && (
              <Badge variant="secondary" className="text-sm">
                {item.organisation}
              </Badge>
            )}
            {item.theme && (
              <Badge variant="outline" className="text-sm">
                {item.theme}
              </Badge>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center gap-4 pt-6">
            <Button
              variant="outline"
              size="lg"
              onClick={() => handleReview("reject")}
              className="gap-2 hover:bg-destructive hover:text-destructive-foreground transition-colors"
            >
              <X className="w-5 h-5" />
              Reject
              <kbd className="ml-2 px-2 py-1 text-xs bg-muted rounded">←</kbd>
            </Button>

            <Button
              variant="outline"
              size="lg"
              onClick={() => handleReview("doable")}
              className="gap-2 hover:bg-warning hover:text-warning-foreground transition-colors"
            >
              <Minus className="w-5 h-5" />
              Doable
              <kbd className="ml-2 px-2 py-1 text-xs bg-muted rounded">↓</kbd>
            </Button>

            <Button
              size="lg"
              onClick={() => handleReview("accept")}
              className="gap-2 bg-success hover:bg-success/90 text-success-foreground"
            >
              <Check className="w-5 h-5" />
              Accept
              <kbd className="ml-2 px-2 py-1 text-xs bg-success-foreground/20 rounded">→</kbd>
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}
