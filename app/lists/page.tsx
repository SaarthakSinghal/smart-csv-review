"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useCSVStore } from "@/lib/csv-store"
import { ReviewList } from "@/components/review-list"
import { ExportOptions } from "@/components/export-options"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Eye, RotateCcw } from "lucide-react"
import type { ReviewAction } from "@/lib/types"
import { AppNavigation } from "@/components/app-navigation"

export default function ListsPage() {
  const router = useRouter()
  const {
    csvData,
    acceptedItems,
    doableItems,
    rejectedItems,
    moveItemBetweenLists,
    reorderList,
    setCurrentIndex,
    resetApp,
  } = useCSVStore()

  const [activeTab, setActiveTab] = useState<ReviewAction>("accept")

  // Redirect if no data
  if (csvData.length === 0) {
    router.push("/upload")
    return null
  }

  const totalReviewed = acceptedItems.length + doableItems.length + rejectedItems.length
  const reviewProgress = (totalReviewed / csvData.length) * 100

  const handleItemClick = (itemId: string) => {
    const itemIndex = csvData.findIndex((item) => item.id === itemId)
    if (itemIndex >= 0) {
      setCurrentIndex(itemIndex)
      router.push("/review")
    }
  }

  const stats = [
    {
      label: "Accepted",
      count: acceptedItems.length,
      color: "text-success",
      bgColor: "bg-success/10",
      borderColor: "border-success/20",
    },
    {
      label: "Doable",
      count: doableItems.length,
      color: "text-warning",
      bgColor: "bg-warning/10",
      borderColor: "border-warning/20",
    },
    {
      label: "Rejected",
      count: rejectedItems.length,
      color: "text-destructive",
      bgColor: "bg-destructive/10",
      borderColor: "border-destructive/20",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
      <AppNavigation />

      <div className="container mx-auto px-4 py-8 pt-20">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="flex items-center gap-4 mb-2">
                <Button variant="ghost" size="sm" onClick={() => router.push("/review")} className="gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  Back to Review
                </Button>
                <h1 className="text-3xl font-bold">Review Lists</h1>
              </div>
              <p className="text-muted-foreground">Organize and export your categorized problem statements</p>
            </div>

            <div className="flex items-center gap-2">
              <ExportOptions acceptedItems={acceptedItems} doableItems={doableItems} rejectedItems={rejectedItems} />
              <Button variant="outline" onClick={resetApp} className="gap-2 bg-transparent">
                <RotateCcw className="w-4 h-4" />
                Reset All
              </Button>
            </div>
          </div>

          {/* Progress Overview */}
          <Card className="p-6 mb-8 animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Review Progress</h3>
              <span className="text-sm text-muted-foreground">
                {totalReviewed} of {csvData.length} items reviewed
              </span>
            </div>

            <div className="w-full h-3 bg-muted rounded-full overflow-hidden mb-4">
              <div
                className="h-full bg-gradient-to-r from-primary to-primary/80 transition-all duration-500"
                style={{ width: `${reviewProgress}%` }}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className={`p-4 rounded-lg border ${stat.bgColor} ${stat.borderColor} text-center`}
                >
                  <div className={`text-2xl font-bold ${stat.color} mb-1`}>{stat.count}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </Card>

          {/* Lists */}
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as ReviewAction)} className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="accept" className="gap-2">
                <div className="w-2 h-2 bg-success rounded-full" />
                Accepted ({acceptedItems.length})
              </TabsTrigger>
              <TabsTrigger value="doable" className="gap-2">
                <div className="w-2 h-2 bg-warning rounded-full" />
                Doable ({doableItems.length})
              </TabsTrigger>
              <TabsTrigger value="reject" className="gap-2">
                <div className="w-2 h-2 bg-destructive rounded-full" />
                Rejected ({rejectedItems.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="accept" className="animate-fade-in">
              <ReviewList
                items={acceptedItems}
                listType="accept"
                onItemClick={handleItemClick}
                onMoveItem={moveItemBetweenLists}
                onReorderItems={reorderList}
                emptyMessage="No items accepted yet. Start reviewing to add items here."
              />
            </TabsContent>

            <TabsContent value="doable" className="animate-fade-in">
              <ReviewList
                items={doableItems}
                listType="doable"
                onItemClick={handleItemClick}
                onMoveItem={moveItemBetweenLists}
                onReorderItems={reorderList}
                emptyMessage="No items marked as doable yet. Items you're unsure about will appear here."
              />
            </TabsContent>

            <TabsContent value="reject" className="animate-fade-in">
              <ReviewList
                items={rejectedItems}
                listType="reject"
                onItemClick={handleItemClick}
                onMoveItem={moveItemBetweenLists}
                onReorderItems={reorderList}
                emptyMessage="No items rejected yet. Items you don't want to pursue will appear here."
              />
            </TabsContent>
          </Tabs>

          {/* Quick Actions */}
          {totalReviewed < csvData.length && (
            <Card className="p-6 mt-8 text-center animate-slide-in-right">
              <h3 className="text-lg font-semibold mb-2">Continue Reviewing</h3>
              <p className="text-muted-foreground mb-4">
                You have {csvData.length - totalReviewed} items left to review
              </p>
              <Button onClick={() => router.push("/review")} className="gap-2">
                <Eye className="w-4 h-4" />
                Continue Review
              </Button>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
