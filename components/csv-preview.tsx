"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { ColumnMapping } from "@/lib/types"
import DOMPurify from "dompurify"

interface CSVPreviewProps {
  rawData: string[][]
  headers: string[]
  columnMapping: ColumnMapping
}

export function CSVPreview({ rawData, headers, columnMapping }: CSVPreviewProps) {
  if (rawData.length === 0) return null

  // Get first row for preview
  const firstRow = rawData[0]
  const getFieldValue = (field: keyof ColumnMapping) => {
    const columnName = columnMapping[field]
    if (!columnName) return ""
    const columnIndex = headers.indexOf(columnName)
    return columnIndex >= 0 ? firstRow[columnIndex] || "" : ""
  }

  const psNumber = getFieldValue("psNumber")
  const title = getFieldValue("title")
  const description = getFieldValue("description")
  const organisation = getFieldValue("organisation")
  const theme = getFieldValue("theme")

  return (
    <Card className="p-6 animate-fade-in">
      <h3 className="text-lg font-semibold mb-4">Live Preview</h3>

      {/* Card Preview */}
      <div className="bg-gradient-to-br from-card to-accent/5 border rounded-lg p-6 space-y-4">
        {psNumber && (
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="font-mono text-xs">
              {psNumber}
            </Badge>
            <span className="text-xs text-muted-foreground">1 / {rawData.length}</span>
          </div>
        )}

        {title && <h4 className="text-xl font-semibold text-balance leading-tight">{title}</h4>}

        {description && (
          <div className="text-sm text-muted-foreground leading-relaxed">
            <div
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(description.substring(0, 200) + (description.length > 200 ? "..." : "")),
              }}
            />
          </div>
        )}

        <div className="flex flex-wrap gap-2 pt-2">
          {organisation && (
            <Badge variant="secondary" className="text-xs">
              {organisation}
            </Badge>
          )}
          {theme && (
            <Badge variant="outline" className="text-xs">
              {theme}
            </Badge>
          )}
        </div>
      </div>

      <p className="text-xs text-muted-foreground mt-3">
        This is how your first card will appear in the review interface
      </p>
    </Card>
  )
}
