"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Download, Copy, FileText, Table } from "lucide-react";
import type { CSVRow } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";

interface ExportOptionsProps {
  acceptedItems: CSVRow[];
  doableItems: CSVRow[];
  rejectedItems: CSVRow[];
}

export function ExportOptions({
  acceptedItems = [],
  doableItems = [],
  rejectedItems = [],
}: ExportOptionsProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState<"csv" | "json" | "summary">(
    "csv"
  );
  const { toast } = useToast();

  const allItemsWithType = useMemo(
    () => [
      ...acceptedItems.map((item) => ({ ...item, listType: "Accepted" })),
      ...doableItems.map((item) => ({ ...item, listType: "Doable" })),
      ...rejectedItems.map((item) => ({ ...item, listType: "Rejected" })),
    ],
    [acceptedItems, doableItems, rejectedItems]
  );

  const totalAccepted = acceptedItems?.length ?? 0;
  const totalDoable = doableItems?.length ?? 0;
  const totalRejected = rejectedItems?.length ?? 0;
  const totalAll = totalAccepted + totalDoable + totalRejected;

  const csvHeaders = [
    "PS Number",
    "Title",
    "Description",
    "Organisation",
    "Theme",
    "List Type",
  ];

  const generateCSV = (items: (CSVRow & { listType: string })[]) => {
    const rows = items.map((item) => [
      item.psNumber ?? "",
      `"${(item.title ?? "").replace(/"/g, '""')}"`,
      `"${(item.description ?? "").replace(/"/g, '""')}"`,
      `"${(item.organisation ?? "").replace(/"/g, '""')}"`,
      `"${(item.theme ?? "").replace(/"/g, '""')}"`,
      item.listType,
    ]);
    return [csvHeaders.join(","), ...rows.map((r) => r.join(","))].join("\n");
  };

  const generateJSON = () =>
    JSON.stringify(
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
      2
    );

  const generateSummary = () => {
    const sections = [
      { title: "ACCEPTED ITEMS", items: acceptedItems },
      { title: "DOABLE ITEMS", items: doableItems },
      { title: "REJECTED ITEMS", items: rejectedItems },
    ];
    return sections
      .map((section) => {
        if (!section.items || section.items.length === 0)
          return `${section.title}\nNo items in this category.\n`;
        const itemsList = section.items
          .map(
            (item) =>
              `${item.psNumber}: ${item.title}${
                item.organisation ? ` (${item.organisation})` : ""
              }`
          )
          .join("\n");
        return `${section.title}\n${itemsList}\n`;
      })
      .join("\n");
  };

  const downloadFile = (
    content: string,
    filename: string,
    mimeType: string
  ) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExport = (format: "csv" | "json" | "summary") => {
    const timestamp = new Date().toISOString().split("T")[0];

    if (format === "csv") {
      const csvContent = generateCSV(allItemsWithType);
      downloadFile(
        csvContent,
        `csv-review-export-${timestamp}.csv`,
        "text/csv"
      );
    } else if (format === "json") {
      const jsonContent = generateJSON();
      downloadFile(
        jsonContent,
        `csv-review-export-${timestamp}.json`,
        "application/json"
      );
    } else {
      const summaryContent = generateSummary();
      downloadFile(
        summaryContent,
        `csv-review-summary-${timestamp}.txt`,
        "text/plain"
      );
    }

    toast({
      title: "Export Complete",
      description: `Your ${format.toUpperCase()} file has been downloaded.`,
    });
  };

  const handleExportCopy = (format: "csv" | "json" | "summary") => {
    if (format === "csv") {
      copyToClipboard(generateCSV(allItemsWithType), "CSV");
    } else if (format === "json") {
      copyToClipboard(generateJSON(), "JSON");
    } else {
      copyToClipboard(generateSummary(), "SUMMARY");
    }

    toast({
      title: "Export Complete",
      description: `Your ${format.toUpperCase()} file has been copied.`,
    });
  };

  const handleExportCategory = (
    format: "csv" | "json" | "summary",
    category: "accepted" | "doable" | "rejected"
  ) => {
    const timestamp = new Date().toISOString().split("T")[0];

    if (format === "csv") {
      const itemsForCategory =
        category === "accepted"
          ? acceptedItems.map((i) => ({ ...i, listType: "Accepted" }))
          : category === "doable"
          ? doableItems.map((i) => ({ ...i, listType: "Doable" }))
          : rejectedItems.map((i) => ({ ...i, listType: "Rejected" }));
      const csvContent = generateCSV(itemsForCategory);
      downloadFile(
        csvContent,
        `csv-review-${category}-export-${timestamp}.csv`,
        "text/csv"
      );
    } else if (format === "json") {
      const jsonContent = JSON.stringify(
        {
          [category]:
            category === "accepted"
              ? acceptedItems
              : category === "doable"
              ? doableItems
              : rejectedItems,
          exportDate: new Date().toISOString(),
          summary: {
            [`total${category.charAt(0).toUpperCase() + category.slice(1)}`]:
              category === "accepted"
                ? totalAccepted
                : category === "doable"
                ? totalDoable
                : totalRejected,
          },
        },
        null,
        2
      );
      downloadFile(
        jsonContent,
        `csv-review-${category}-export-${timestamp}.json`,
        "application/json"
      );
    } else {
      const items =
        category === "accepted"
          ? acceptedItems
          : category === "doable"
          ? doableItems
          : rejectedItems;
      const title = category.toUpperCase() + " ITEMS";
      const summary =
        !items || items.length === 0
          ? `${title}\nNo items in this category.\n`
          : `${title}\n${items
              .map(
                (item) =>
                  `${item.psNumber}: ${item.title}${
                    item.organisation ? ` (${item.organisation})` : ""
                  }`
              )
              .join("\n")}\n`;
      downloadFile(
        summary,
        `csv-review-${category}-summary-${timestamp}.txt`,
        "text/plain"
      );
    }

    toast({
      title: "Export Complete",
      description: `Your ${category} ${format.toUpperCase()} file has been downloaded.`,
    });
  };

  const copyToClipboard = async (content: string, type: string) => {
    try {
      await navigator.clipboard.writeText(content);
      toast({
        title: "Copied to Clipboard",
        description: `${type} has been copied to your clipboard.`,
      });
    } catch {
      toast({
        title: "Copy Failed",
        description: "Unable to copy to clipboard. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getPreviewContent = () => {
    if (exportFormat === "csv") return generateCSV(allItemsWithType);
    if (exportFormat === "json") return generateJSON();
    return generateSummary();
  };

  const renderPreviewContent = () => {
    if (exportFormat === "csv") {
      return (
        <div className="overflow-auto">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="bg-muted/50">
                {csvHeaders.map((header, index) => (
                  <th
                    key={index}
                    className="border border-border px-2 py-1 text-left font-medium"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {allItemsWithType.slice(0, 10).map((item, index) => (
                <tr key={index} className="hover:bg-muted/30">
                  <td className="border border-border px-2 py-1">
                    {item.psNumber ?? ""}
                  </td>
                  <td
                    className="border border-border px-2 py-1 max-w-[200px] truncate"
                    title={item.title ?? ""}
                  >
                    {item.title ?? ""}
                  </td>
                  <td
                    className="border border-border px-2 py-1 max-w-[150px] truncate"
                    title={item.description ?? ""}
                  >
                    {item.description ?? ""}
                  </td>
                  <td
                    className="border border-border px-2 py-1 max-w-[120px] truncate"
                    title={item.organisation ?? ""}
                  >
                    {item.organisation ?? ""}
                  </td>
                  <td
                    className="border border-border px-2 py-1 max-w-[100px] truncate"
                    title={item.theme ?? ""}
                  >
                    {item.theme ?? ""}
                  </td>
                  <td className="border border-border px-2 py-1">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        item.listType === "Accepted"
                          ? "bg-green-100 text-green-800"
                          : item.listType === "Doable"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {item.listType}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {allItemsWithType.length > 10 && (
            <div className="text-center py-2 text-xs text-muted-foreground border-t">
              Showing first 10 of {allItemsWithType.length} items
            </div>
          )}
        </div>
      );
    }

    if (exportFormat === "json") {
      const jsonData = {
        accepted: acceptedItems,
        doable: doableItems,
        rejected: rejectedItems,
        exportDate: new Date().toISOString(),
        summary: {
          totalAccepted: acceptedItems.length,
          totalDoable: doableItems.length,
          totalRejected: rejectedItems.length,
        },
      };

      return (
        <div className="overflow-auto p-4">
          <div className="space-y-4">
            {/* Summary Section */}
            <div className="bg-muted/30 rounded-lg p-3">
              <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Export Summary
              </h4>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="bg-green-100 text-green-800 px-2 py-1 rounded text-center">
                  <div className="font-medium">{totalAccepted}</div>
                  <div>Accepted</div>
                </div>
                <div className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-center">
                  <div className="font-medium">{totalDoable}</div>
                  <div>Doable</div>
                </div>
                <div className="bg-red-100 text-red-800 px-2 py-1 rounded text-center">
                  <div className="font-medium">{totalRejected}</div>
                  <div>Rejected</div>
                </div>
              </div>
              <div className="mt-2 text-xs text-muted-foreground">
                Export Date: {new Date().toISOString().split("T")[0]}
              </div>
            </div>

            {/* Data Sections */}
            {Object.entries(jsonData)
              .filter(([key]) => key !== "exportDate" && key !== "summary")
              .map(([category, items]) => (
                <div key={category} className="border rounded-lg">
                  <div className="bg-muted/50 px-3 py-2 border-b">
                    <h4 className="font-medium text-sm capitalize flex items-center gap-2">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          category === "accepted"
                            ? "bg-green-500"
                            : category === "doable"
                            ? "bg-yellow-500"
                            : "bg-red-500"
                        }`}
                      ></span>
                      {category} ({Array.isArray(items) ? items.length : 0}{" "}
                      items)
                    </h4>
                  </div>
                  <div className="p-3">
                    {Array.isArray(items) && items.length > 0 ? (
                      <div className="space-y-2">
                        {items.slice(0, 3).map((item, index) => (
                          <div
                            key={index}
                            className="bg-background border rounded p-2 text-xs"
                          >
                            <div className="font-medium">{item.psNumber}</div>
                            <div
                              className="text-muted-foreground truncate"
                              title={item.title}
                            >
                              {item.title}
                            </div>
                            {item.organisation && (
                              <div className="text-muted-foreground text-xs">
                                {item.organisation}
                              </div>
                            )}
                          </div>
                        ))}
                        {items.length > 3 && (
                          <div className="text-center text-xs text-muted-foreground py-1">
                            ... and {items.length - 3} more items
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-xs text-muted-foreground italic">
                        No items in this category
                      </div>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </div>
      );
    }

    if (exportFormat === "summary") {
      const sections = [
        { title: "ACCEPTED ITEMS", items: acceptedItems, color: "green" },
        { title: "DOABLE ITEMS", items: doableItems, color: "yellow" },
        { title: "REJECTED ITEMS", items: rejectedItems, color: "red" },
      ];

      return (
        <div className="overflow-auto p-4">
          <div className="space-y-4">
            {sections.map((section, index) => (
              <div key={index} className="border rounded-lg">
                <div
                  className={`px-3 py-2 border-b ${
                    section.color === "green"
                      ? "bg-green-50 border-green-200"
                      : section.color === "yellow"
                      ? "bg-yellow-50 border-yellow-200"
                      : "bg-red-50 border-red-200"
                  }`}
                >
                  <h4
                    className={`font-medium text-sm ${
                      section.color === "green"
                        ? "text-green-800"
                        : section.color === "yellow"
                        ? "text-yellow-800"
                        : "text-red-800"
                    }`}
                  >
                    {section.title} ({section.items.length})
                  </h4>
                </div>
                <div className="p-3">
                  {section.items.length > 0 ? (
                    <div className="space-y-2">
                      {section.items.slice(0, 5).map((item, itemIndex) => (
                        <div
                          key={itemIndex}
                          className="bg-muted/30 rounded p-2 text-xs"
                        >
                          <div className="font-medium text-primary">
                            {item.psNumber}
                          </div>
                          <div className="text-foreground" title={item.title}>
                            {item.title}
                          </div>
                          {item.organisation && (
                            <div className="text-muted-foreground text-xs mt-1">
                              📍 {item.organisation}
                            </div>
                          )}
                          {item.theme && (
                            <div className="text-muted-foreground text-xs">
                              🏷️ {item.theme}
                            </div>
                          )}
                        </div>
                      ))}
                      {section.items.length > 5 && (
                        <div className="text-center text-xs text-muted-foreground py-2 border-t">
                          ... and {section.items.length - 5} more items
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-xs text-muted-foreground italic text-center py-4">
                      No items in this category
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    return (
      <Textarea
        value={getPreviewContent()}
        readOnly
        className="h-full min-h-[200px] max-h-[400px] font-mono text-xs border-0 bg-transparent resize-none focus-visible:ring-0"
        placeholder="No data to preview"
      />
    );
  };

  return (
    <>
      <Button
        className="gap-2 cursor-pointer"
        onClick={() => setIsDialogOpen(true)}
      >
        <Download className="w-4 h-4" />
        Export
      </Button>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle className="text-lg sm:text-xl">
              Export Options
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-hidden flex flex-col space-y-4">
            {/* Format Selection */}
            <div className="flex-shrink-0">
              <Label htmlFor="format" className="text-sm font-medium">
                Export Format
              </Label>
              <div className="flex flex-wrap gap-2 mt-2">
                <Button
                  variant={exportFormat === "csv" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setExportFormat("csv")}
                  className="flex-1 sm:flex-none"
                >
                  <Table className="w-4 h-4 mr-1" />
                  CSV
                </Button>
                <Button
                  variant={exportFormat === "json" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setExportFormat("json")}
                  className="flex-1 sm:flex-none"
                >
                  <FileText className="w-4 h-4 mr-1" />
                  JSON
                </Button>
                <Button
                  variant={exportFormat === "summary" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setExportFormat("summary")}
                  className="flex-1 sm:flex-none"
                >
                  <FileText className="w-4 h-4 mr-1" />
                  Summary
                </Button>
              </div>
            </div>

            {/* Preview Section */}
            <div className="flex-1 flex flex-col min-h-0">
              <div className="flex items-center justify-between mb-2">
                <Label htmlFor="preview" className="text-sm font-medium">
                  Preview ({exportFormat.toUpperCase()})
                </Label>
                <div className="text-xs text-muted-foreground">
                  {exportFormat === "csv" && `${allItemsWithType.length} items`}
                  {exportFormat === "json" && `${totalAll} total items`}
                  {exportFormat === "summary" &&
                    `${totalAccepted}A, ${totalDoable}D, ${totalRejected}R`}
                </div>
              </div>
              <div className="flex-1 min-h-0 border rounded-md bg-muted/30 overflow-auto">
                {renderPreviewContent()}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex-shrink-0 pt-2 border-t">
              <div className="flex flex-col sm:flex-row gap-2 sm:justify-end">
                <Button
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  className="w-full sm:w-auto cursor-pointer"
                >
                  Cancel
                </Button>
                <div className="flex gap-2">
                  <Button
                    onClick={() => {
                      handleExport(exportFormat);
                      setIsDialogOpen(false);
                    }}
                    className="flex-1 sm:flex-none gap-2 cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span className="hidden sm:inline">Download</span>
                    <span className="sm:hidden">Save</span>
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => {
                      handleExportCopy(exportFormat);
                      setIsDialogOpen(false);
                    }}
                    className="flex-1 sm:flex-none gap-2 cursor-pointer"
                  >
                    <Copy className="w-4 h-4" />
                    <span className="hidden sm:inline">Copy</span>
                    <span className="sm:hidden">Copy</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
