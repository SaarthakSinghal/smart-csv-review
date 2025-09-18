"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { GripVertical, MoreHorizontal, Eye, ArrowRight } from "lucide-react"
import type { CSVRow, ReviewAction } from "@/lib/types"
import { DragDropContext, Droppable, Draggable, type DropResult } from "@hello-pangea/dnd"

interface ReviewListProps {
  items: CSVRow[]
  listType: ReviewAction
  onItemClick: (itemId: string) => void
  onMoveItem: (item: CSVRow, from: ReviewAction, to: ReviewAction) => void
  onReorderItems: (listType: ReviewAction, startIndex: number, endIndex: number) => void
  emptyMessage: string
}

export function ReviewList({
  items,
  listType,
  onItemClick,
  onMoveItem,
  onReorderItems,
  emptyMessage,
}: ReviewListProps) {
  const [draggedItem, setDraggedItem] = useState<CSVRow | null>(null)

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return

    const { source, destination } = result

    if (source.index !== destination.index) {
      onReorderItems(listType, source.index, destination.index)
    }

    setDraggedItem(null)
  }

  const getListColor = (type: ReviewAction) => {
    switch (type) {
      case "accept":
        return "border-success/20 bg-success/5"
      case "doable":
        return "border-warning/20 bg-warning/5"
      case "reject":
        return "border-destructive/20 bg-destructive/5"
    }
  }

  const getActionColor = (type: ReviewAction) => {
    switch (type) {
      case "accept":
        return "text-success"
      case "doable":
        return "text-warning"
      case "reject":
        return "text-destructive"
    }
  }

  if (items.length === 0) {
    return (
      <Card className={`p-12 text-center ${getListColor(listType)}`}>
        <div className="max-w-md mx-auto">
          <div
            className={`w-16 h-16 rounded-full ${getListColor(listType)} flex items-center justify-center mx-auto mb-4`}
          >
            <div className={`w-8 h-8 rounded-full ${getActionColor(listType)} opacity-20`} />
          </div>
          <p className="text-muted-foreground">{emptyMessage}</p>
        </div>
      </Card>
    )
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId={listType}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`space-y-3 min-h-[200px] p-4 rounded-lg border-2 border-dashed transition-colors ${
              snapshot.isDraggingOver ? getListColor(listType) : "border-transparent"
            }`}
          >
            {items.map((item, index) => (
              <Draggable key={item.id} draggableId={item.id} index={index}>
                {(provided, snapshot) => (
                  <Card
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    className={`p-4 hover:shadow-md transition-all cursor-pointer ${
                      snapshot.isDragging ? "shadow-lg rotate-2" : ""
                    }`}
                    onClick={() => onItemClick(item.id)}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        {...provided.dragHandleProps}
                        className="mt-1 text-muted-foreground hover:text-foreground cursor-grab active:cursor-grabbing"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <GripVertical className="w-4 h-4" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className="font-mono text-xs">
                            {item.psNumber}
                          </Badge>
                          <div className={`w-2 h-2 rounded-full ${getActionColor(listType)}`} />
                        </div>

                        <h4 className="font-semibold text-sm mb-1 line-clamp-2">{item.title}</h4>

                        {item.description && (
                          <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                            {item.description.replace(/<[^>]*>/g, "").substring(0, 120)}...
                          </p>
                        )}

                        <div className="flex flex-wrap gap-1">
                          {item.organisation && (
                            <Badge variant="secondary" className="text-xs">
                              {item.organisation}
                            </Badge>
                          )}
                          {item.theme && (
                            <Badge variant="outline" className="text-xs">
                              {item.theme}
                            </Badge>
                          )}
                        </div>
                      </div>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="sm" className="w-8 h-8 p-0">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onItemClick(item.id)} className="gap-2">
                            <Eye className="w-4 h-4" />
                            View Details
                          </DropdownMenuItem>
                          {listType !== "accept" && (
                            <DropdownMenuItem
                              onClick={() => onMoveItem(item, listType, "accept")}
                              className="gap-2 text-success"
                            >
                              <ArrowRight className="w-4 h-4" />
                              Move to Accepted
                            </DropdownMenuItem>
                          )}
                          {listType !== "doable" && (
                            <DropdownMenuItem
                              onClick={() => onMoveItem(item, listType, "doable")}
                              className="gap-2 text-warning"
                            >
                              <ArrowRight className="w-4 h-4" />
                              Move to Doable
                            </DropdownMenuItem>
                          )}
                          {listType !== "reject" && (
                            <DropdownMenuItem
                              onClick={() => onMoveItem(item, listType, "reject")}
                              className="gap-2 text-destructive"
                            >
                              <ArrowRight className="w-4 h-4" />
                              Move to Rejected
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </Card>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  )
}
