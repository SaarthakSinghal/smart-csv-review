"use client"

import type React from "react"

import { useState, useCallback, useRef } from "react"
import { useRouter } from "next/navigation"
import Papa from "papaparse"
import { useCSVStore } from "@/lib/csv-store"
import type { ColumnMapping, CSVRow } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Upload, FileSpreadsheet, ArrowRight, RotateCcw } from "lucide-react"
import { CSVPreview } from "@/components/csv-preview"
import { AppNavigation } from "@/components/app-navigation"

export default function UploadPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { setCSVData, setColumnMapping, columnMapping, resetApp } = useCSVStore()

  const [rawData, setRawData] = useState<string[][]>([])
  const [headers, setHeaders] = useState<string[]>([])
  const [isUploaded, setIsUploaded] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  const handleFileUpload = useCallback(
    (file: File) => {
      if (!file) return

      setIsProcessing(true)
      Papa.parse(file, {
        complete: (results) => {
          const data = results.data as string[][]
          if (data.length > 0) {
            const headers = data[0]
            const rows = data.slice(1).filter((row) => row.some((cell) => cell.trim()))

            setHeaders(headers)
            setRawData(rows)
            setIsUploaded(true)

            // Auto-detect common column mappings
            const autoMapping: ColumnMapping = {
              psNumber: headers.find((h) => /ps.?number|problem.?statement.?number|id/i.test(h)) || "PS Number",
              title: headers.find((h) => /title|name|problem.?statement/i.test(h)) || "Title",
              description: headers.find((h) => /description|detail|summary/i.test(h)) || "Description",
              organisation: headers.find((h) => /org|organization|organisation|company/i.test(h)) || "Organisation",
              theme: headers.find((h) => /theme|category|domain|area/i.test(h)) || "Theme",
            }
            setColumnMapping(autoMapping)
          }
          setIsProcessing(false)
        },
        header: false,
        skipEmptyLines: true,
      })
    },
    [setColumnMapping],
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      const file = e.dataTransfer.files[0]
      if (file && file.type === "text/csv") {
        handleFileUpload(file)
      }
    },
    [handleFileUpload],
  )

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) {
        handleFileUpload(file)
      }
    },
    [handleFileUpload],
  )

  const updateColumnMapping = (field: keyof ColumnMapping, value: string) => {
    setColumnMapping({ ...columnMapping, [field]: value })
  }

  const processData = () => {
    if (!columnMapping.psNumber || !columnMapping.title) {
      return
    }

    const processedData: CSVRow[] = rawData.map((row, index) => ({
      id: `row-${index}`,
      psNumber: row[headers.indexOf(columnMapping.psNumber)] || "",
      title: row[headers.indexOf(columnMapping.title)] || "",
      description: row[headers.indexOf(columnMapping.description)] || "",
      organisation: row[headers.indexOf(columnMapping.organisation)] || "",
      theme: row[headers.indexOf(columnMapping.theme)] || "",
      rowNumber: index + 1,
    }))

    setCSVData(processedData)
    router.push("/review")
  }

  const canProceed = columnMapping.psNumber && columnMapping.title && rawData.length > 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
      <AppNavigation />

      <div className="container mx-auto px-4 py-8 pt-20">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">CSV Upload & Mapping</h1>
              <p className="text-muted-foreground">Upload your CSV file and map columns to get started</p>
            </div>
            <Button variant="outline" onClick={resetApp} className="gap-2 bg-transparent cursor-pointer">
              <RotateCcw className="w-4 h-4" />
              Reset
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Upload Area */}
            <div>
              {!isUploaded ? (
                <Card
                  className="border-2 border-dashed border-border hover:border-primary/50 transition-colors cursor-pointer"
                  onDrop={handleDrop}
                  onDragOver={(e) => e.preventDefault()}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="p-12 text-center">
                    {isProcessing ? (
                      <div className="animate-pulse">
                        <FileSpreadsheet className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-lg font-medium mb-2">Processing CSV...</p>
                        <p className="text-sm text-muted-foreground">Please wait while we parse your file</p>
                      </div>
                    ) : (
                      <>
                        <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-lg font-medium mb-2">Drop your CSV file here</p>
                        <p className="text-sm text-muted-foreground mb-4">or click to browse files</p>
                        <Button variant="outline" className="cursor-pointer bg-transparent">
                          Choose File
                        </Button>
                      </>
                    )}
                  </div>
                </Card>
              ) : (
                <Card className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <FileSpreadsheet className="w-5 h-5 text-success" />
                    <div>
                      <p className="font-medium">CSV Uploaded Successfully</p>
                      <p className="text-sm text-muted-foreground">{rawData.length} rows detected</p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="cursor-pointer bg-transparent"
                    onClick={() => {
                      setIsUploaded(false)
                      setRawData([])
                      setHeaders([])
                    }}
                  >
                    Upload Different File
                  </Button>
                </Card>
              )}

              {/* Column Mapping */}
              {isUploaded && (
                <Card className="p-6 mt-6 animate-fade-in">
                  <h3 className="text-lg font-semibold mb-4">Map CSV Columns</h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <Label htmlFor="ps-number" className="text-sm font-medium">
                          PS Number <span className="text-destructive">*</span>
                        </Label>
                        <Select
                          value={columnMapping.psNumber}
                          onValueChange={(value) => updateColumnMapping("psNumber", value)}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select column" />
                          </SelectTrigger>
                          <SelectContent>
                            {headers.map((header) => (
                              <SelectItem key={header} value={header}>
                                {header}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="title" className="text-sm font-medium">
                          Title <span className="text-destructive">*</span>
                        </Label>
                        <Select
                          value={columnMapping.title}
                          onValueChange={(value) => updateColumnMapping("title", value)}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select column" />
                          </SelectTrigger>
                          <SelectContent>
                            {headers.map((header) => (
                              <SelectItem key={header} value={header}>
                                {header}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="description" className="text-sm font-medium">
                        Description
                      </Label>
                      <Select
                        value={columnMapping.description}
                        onValueChange={(value) => updateColumnMapping("description", value)}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select column (optional)" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="None">None</SelectItem>
                          {headers.map((header) => (
                            <SelectItem key={header} value={header}>
                              {header}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <Label htmlFor="organisation" className="text-sm font-medium">
                          Organisation
                        </Label>
                        <Select
                          value={columnMapping.organisation}
                          onValueChange={(value) => updateColumnMapping("organisation", value)}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select column (optional)" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="None">None</SelectItem>
                            {headers.map((header) => (
                              <SelectItem key={header} value={header}>
                                {header}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="theme" className="text-sm font-medium">
                          Theme
                        </Label>
                        <Select
                          value={columnMapping.theme}
                          onValueChange={(value) => updateColumnMapping("theme", value)}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select column (optional)" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="None">None</SelectItem>
                            {headers.map((header) => (
                              <SelectItem key={header} value={header}>
                                {header}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-6 border-t">
                    <Button onClick={processData} disabled={!canProceed} className="w-full gap-2 cursor-pointer">
                      Start Reviewing
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                </Card>
              )}
            </div>

            {/* Right Column - Preview */}
            {isUploaded && (
              <div>
                <CSVPreview rawData={rawData} headers={headers} columnMapping={columnMapping} />
              </div>
            )}
          </div>
        </div>
      </div>

      <input ref={fileInputRef} type="file" accept=".csv" onChange={handleFileSelect} className="hidden" />
    </div>
  )
}
