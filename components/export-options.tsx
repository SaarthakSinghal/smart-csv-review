"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Download, Copy, FileText, Table } from "lucide-react"
import type { CSVRow } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"

interface ExportOptionsProps {
  acceptedItems: CSVRow[]
  doableItems: CSVRow[]
  rejectedItems: CSVRow[]
}

export function ExportOptions({ acceptedItems, doableItems, rejectedItems }: ExportOptionsProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [exportFormat, setExportFormat] = useState<"csv" | "json" | "summary">("csv")
  const { toast } = useToast()

  const generateCSV = (items: CSVRow[], listType: string) => {
    const headers = ["PS Number", "Title", "Description", "Organisation", "Theme", "List Type"]
    const rows = items.map((item) => [
      item.psNumber,
      `"${item.title.replace(/"/g, '""')}"`,
      `"${item.description.replace(/"/g, '""')}"`,
      `"${item.organisation.replace(/"/g, '""')}"`,
      `"${item.theme.replace(/"/g, '""')}"`,
      listType,
    ])

    return [headers.join(","), ...rows.map((row) => row.join(","))].join("\n")
  }

  const generateJSON = () => {
    return JSON.stringify(
      {
        accepted: acceptedItems,
        doable: doableItems,
        rejected: rejectedItems,
        exportDate: new Date().toISOString(),
        summary: {
          totalAccepted: acceptedItems.length,
          totalDoable: doableItems.length,
          totalRejected: rejectedItems.length,
        },
      },
      null,
      2,
    )
  }

  const generateSummary = () => {
    const sections = [
      { title: "ACCEPTED ITEMS", items: acceptedItems },
      { title: "DOABLE ITEMS", items: doableItems },
      { title: "REJECTED ITEMS", items: rejectedItems },
    ]

    return sections
      .map((section) => {
        if (section.items.length === 0) return `${section.title}\nNo items in this category.\n`

        const itemsList = section.items
          .map((item) => `${item.psNumber}: ${item.title}${item.organisation ? ` (${item.organisation})` : ""}`)
          .join("\n")

        return `${section.title}\n${itemsList}\n`
      })
      .join("\n")
  }

  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleExport = (format: "csv" | "json" | "summary") => {
    const timestamp = new Date().toISOString().split("T")[0]

    switch (format) {
      case "csv":
        const allItems = [
          ...acceptedItems.map((item) => ({ ...item, listType: "Accepted" })),
          ...doableItems.map((item) => ({ ...item, listType: "Doable" })),
          ...rejectedItems.map((item) => ({ ...item, listType: "Rejected" })),
        ]
        const csvContent = generateCSV(allItems, "")
        downloadFile(csvContent, `csv-review-export-${timestamp}.csv`, "text/csv")
        break

      case "json":
        const jsonContent = generateJSON()
        downloadFile(jsonContent, `csv-review-export-${timestamp}.json`, "application/json")
        break

      case "summary":
        const summaryContent = generateSummary()
        downloadFile(summaryContent, `csv-review-summary-${timestamp}.txt`, "text/plain")
        break
    }

    toast({
      title: "Export Complete",
      description: `Your ${format.toUpperCase()} file has been downloaded.`,
    })
  }

  const copyToClipboard = async (content: string, type: string) => {
    try {
      await navigator.clipboard.writeText(content)
      toast({
        title: "Copied to Clipboard",
        description: `${type} has been copied to your clipboard.`,
      })
    } catch (err) {
      toast({
        title: "Copy Failed",
        description: "Unable to copy to clipboard. Please try again.",
        variant: "destructive",
      })
    }
  }

  const getPreviewContent = () => {
    switch (exportFormat) {
      case "csv":
        return generateCSV([...acceptedItems, ...doableItems, ...rejectedItems], "")
      case "json":
        return generateJSON()
      case "summary":
        return generateSummary()
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button className="gap-2">
            <Download className="w-4 h-4" />
            Export
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => handleExport("csv")} className="gap-2">
            <Table className="w-4 h-4" />
            Export as CSV
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleExport("json")} className="gap-2">
            <FileText className="w-4 h-4" />
            Export as JSON
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleExport("summary")} className="gap-2">
            <FileText className="w-4 h-4" />
            Export Summary
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setIsDialogOpen(true)} className="gap-2">
            <Copy className="w-4 h-4" />
            Copy to Clipboard
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Copy Export Data</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="format">Export Format</Label>
              <div className="flex gap-2 mt-2">
                <Button
                  variant={exportFormat === "csv" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setExportFormat("csv")}
                >
                  CSV
                </Button>
                <Button
                  variant={exportFormat === "json" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setExportFormat("json")}
                >
                  JSON
                </Button>
                <Button
                  variant={exportFormat === "summary" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setExportFormat("summary")}
                >
                  Summary
                </Button>
              </div>
            </div>

            <div>
              <Label htmlFor="preview">Preview</Label>
              <Textarea id="preview" value={getPreviewContent()} readOnly className="mt-2 h-64 font-mono text-xs" />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => {
                  copyToClipboard(getPreviewContent(), exportFormat.toUpperCase())
                  setIsDialogOpen(false)
                }}
                className="gap-2"
              >
                <Copy className="w-4 h-4" />
                Copy to Clipboard
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
