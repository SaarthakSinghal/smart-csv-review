"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useCSVStore } from "@/lib/csv-store"
import { Upload, FileSpreadsheet, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { AppNavigation } from "@/components/app-navigation"

export default function HomePage() {
  const router = useRouter()
  const { csvData } = useCSVStore()

  useEffect(() => {
    // If we have CSV data, redirect to upload page to continue
    if (csvData.length > 0) {
      router.push("/upload")
    }
  }, [csvData, router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
      <AppNavigation />

      <div className="container mx-auto px-4 py-16 pt-24">
        <div className="max-w-4xl mx-auto text-center">
          {/* Hero Section */}
          <div className="animate-fade-in">
            <div className="inline-flex items-center gap-2 bg-accent/50 text-accent-foreground px-4 py-2 rounded-full text-sm font-medium mb-8">
              <Zap className="w-4 h-4" />
              Fast, Local-Only Processing
            </div>

            <h1 className="text-5xl md:text-6xl font-bold text-balance mb-6 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Smart CSV Review
            </h1>

            <p className="text-xl text-muted-foreground text-balance mb-12 max-w-2xl mx-auto leading-relaxed">
              Upload your CSV and review each row as a beautiful, full-screen card. Categorize with elegant gestures and
              keyboard shortcuts.
            </p>
          </div>

          {/* Feature Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-12 animate-slide-in-right">
            <Card className="p-6 text-left hover:shadow-lg transition-shadow">
              <Upload className="w-8 h-8 text-primary mb-4" />
              <h3 className="font-semibold mb-2">Smart Upload</h3>
              <p className="text-sm text-muted-foreground">
                Drag & drop CSV files with intelligent column mapping and live preview
              </p>
            </Card>

            <Card className="p-6 text-left hover:shadow-lg transition-shadow">
              <FileSpreadsheet className="w-8 h-8 text-primary mb-4" />
              <h3 className="font-semibold mb-2">Card Review</h3>
              <p className="text-sm text-muted-foreground">
                Review each row as a focused card with keyboard shortcuts and gestures
              </p>
            </Card>

            <Card className="p-6 text-left hover:shadow-lg transition-shadow">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center mb-4">
                <span className="text-primary-foreground font-bold text-sm">3</span>
              </div>
              <h3 className="font-semibold mb-2">Smart Lists</h3>
              <p className="text-sm text-muted-foreground">
                Organize into Accept, Doable, and Reject lists with drag-and-drop
              </p>
            </Card>
          </div>

          {/* CTA */}
          <div className="animate-scale-in">
            <Button size="lg" className="text-lg px-8 py-6 h-auto" onClick={() => router.push("/upload")}>
              <Upload className="w-5 h-5 mr-2" />
              Start Reviewing
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
