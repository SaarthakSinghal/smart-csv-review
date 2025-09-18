"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"

interface KeyboardShortcutsProps {
  onClose: () => void
}

export function KeyboardShortcuts({ onClose }: KeyboardShortcutsProps) {
  const shortcuts = [
    { key: "←", action: "Reject current item" },
    { key: "→", action: "Accept current item" },
    { key: "↓", action: "Mark as Doable" },
    { key: "Space", action: "Expand/collapse description" },
    { key: "J", action: "Next item (without reviewing)" },
    { key: "K", action: "Previous item" },
    { key: "?", action: "Toggle this help" },
  ]

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
      <Card className="max-w-md w-full mx-4 p-6 animate-scale-in">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Keyboard Shortcuts</h3>
          <Button variant="ghost" size="sm" onClick={onClose} className="rounded-full w-8 h-8 p-0">
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="space-y-3">
          {shortcuts.map((shortcut) => (
            <div key={shortcut.key} className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{shortcut.action}</span>
              <kbd className="px-2 py-1 text-xs bg-muted rounded font-mono">{shortcut.key}</kbd>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-4 border-t">
          <p className="text-xs text-muted-foreground text-center">
            Press <kbd className="px-1 py-0.5 bg-muted rounded text-xs">?</kbd> anytime to toggle this help
          </p>
        </div>
      </Card>
    </div>
  )
}
