"use client"

import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

type PageHeaderProps = {
  onAddCards: () => void
}

export function PageHeader({ onAddCards }: PageHeaderProps) {
  return (
    <header className="border-b border-border bg-card">
      <div className="container mx-auto px-6 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Task Board</h1>
            <p className="text-muted-foreground mt-1">Manage your tasks and track progress</p>
          </div>
          <Button onClick={onAddCards} size="lg" className="gap-2">
            <Plus className="h-5 w-5" />
            Add Cards
          </Button>
        </div>
      </div>
    </header>
  )
}
