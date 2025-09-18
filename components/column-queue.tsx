"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { GripVertical, ArrowUp, ArrowDown } from "lucide-react"
import type { ColumnMapping } from "@/lib/types"

interface ColumnQueueProps {
  headers: string[]
  columnMapping: ColumnMapping
  onMappingChange: (mapping: ColumnMapping) => void
}

export function ColumnQueue({ headers, columnMapping, onMappingChange }: ColumnQueueProps) {
  const mappedColumns = Object.entries(columnMapping).filter(([_, value]) => value !== "")
  const unmappedColumns = headers.filter((header) => !Object.values(columnMapping).includes(header))

  const moveColumn = (direction: "up" | "down", field: keyof ColumnMapping) => {
    // This is a simplified version - in a full implementation, you'd handle reordering
    console.log(`Move ${field} ${direction}`)
  }

  return (
    <Card className="p-6 animate-slide-in-right">
      <h3 className="text-lg font-semibold mb-4">Column Queue</h3>

      {/* Mapped Columns */}
      <div className="space-y-2 mb-6">
        <h4 className="text-sm font-medium text-muted-foreground mb-2">Mapped Fields</h4>
        {mappedColumns.map(([field, column]) => (
          <div key={field} className="flex items-center gap-2 p-2 bg-accent/20 rounded-md">
            <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <Badge variant="default" className="text-xs capitalize">
                  {field.replace(/([A-Z])/g, " $1").trim()}
                </Badge>
                {field === "psNumber" || field === "title" ? (
                  <Badge variant="destructive" className="text-xs">
                    Required
                  </Badge>
                ) : null}
              </div>
              <p className="text-sm text-muted-foreground truncate">{column}</p>
            </div>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={() => moveColumn("up", field as keyof ColumnMapping)}
              >
                <ArrowUp className="w-3 h-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={() => moveColumn("down", field as keyof ColumnMapping)}
              >
                <ArrowDown className="w-3 h-3" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Unmapped Columns */}
      {unmappedColumns.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground mb-2">Unmapped Columns</h4>
          {unmappedColumns.map((column) => (
            <div key={column} className="flex items-center gap-2 p-2 bg-muted/50 rounded-md">
              <div className="w-4 h-4" />
              <div className="flex-1 min-w-0">
                <p className="text-sm truncate">{column}</p>
              </div>
              <Badge variant="outline" className="text-xs">
                Unused
              </Badge>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}
