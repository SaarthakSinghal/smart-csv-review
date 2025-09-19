"use client"

import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useCSVStore } from "@/lib/csv-store"
import { Upload, Eye, List, Home } from "lucide-react"

export function AppNavigation() {
  const router = useRouter()
  const pathname = usePathname()
  const { csvData, acceptedItems, doableItems, rejectedItems } = useCSVStore()

  const totalReviewed = acceptedItems.length + doableItems.length + rejectedItems.length
  const hasData = csvData.length > 0

  const navItems = [
    {
      label: "Home",
      path: "/",
      icon: Home,
      active: pathname === "/",
      disabled: false,
    },
    {
      label: "Upload",
      path: "/upload",
      icon: Upload,
      active: pathname === "/upload",
      disabled: false,
    },
    {
      label: "Review",
      path: "/review",
      icon: Eye,
      active: pathname === "/review",
      disabled: !hasData,
      badge: hasData ? `${totalReviewed}/${csvData.length}` : undefined,
    },
    {
      label: "Lists",
      path: "/lists",
      icon: List,
      active: pathname === "/lists",
      disabled: !hasData,
      badge: totalReviewed > 0 ? totalReviewed.toString() : undefined,
    },
  ]

  return (
    <nav className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
      <div className="flex items-center gap-1 bg-card/80 backdrop-blur-sm border rounded-full px-2 py-2 shadow-lg">
        {navItems.map((item) => {
          const Icon = item.icon
          return (
            <Button
              key={item.path}
              variant={item.active ? "default" : "ghost"}
              size="sm"
              onClick={() => !item.disabled && router.push(item.path)}
              disabled={item.disabled}
              className="gap-2 rounded-full relative cursor-pointer disabled:cursor-not-allowed"
            >
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{item.label}</span>
              {item.badge && (
                <Badge variant="secondary" className="text-xs h-5 px-1.5 ml-1">
                  {item.badge}
                </Badge>
              )}
            </Button>
          )
        })}
      </div>
    </nav>
  )
}
