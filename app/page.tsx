"use client"

import { useState } from "react"
import { KanbanBoard } from "@/components/kanban-board"
import { AddCardsDialog } from "@/components/add-cards-dialog"
import { PageHeader } from "@/components/page-header"
import { Sidebar } from "@/components/sidebar"

export type Card = {
  id: string
  title: string
  description?: string
  createdBy: string
}

export type Column = "done" | "willDo" | "blockers"

export type BoardData = {
  done: Card[]
  willDo: Card[]
  blockers: Card[]
}

export const CURRENT_USER = "John Doe"

export default function Page() {
  const [boardData, setBoardData] = useState<BoardData>({
    done: [
      {
        id: "1",
        title: "Setup project repository",
        description: "Initialize Git and create initial structure",
        createdBy: "John Doe",
      },
      {
        id: "2",
        title: "Design system architecture",
        description: "Define component structure and data flow",
        createdBy: "Jane Smith",
      },
    ],
    willDo: [
      {
        id: "3",
        title: "Implement authentication",
        description: "Add user login and registration",
        createdBy: "John Doe",
      },
      { id: "4", title: "Create dashboard UI", description: "Build main dashboard interface", createdBy: "Jane Smith" },
      {
        id: "5",
        title: "Setup database schema",
        description: "Design and implement database tables",
        createdBy: "John Doe",
      },
    ],
    blockers: [
      {
        id: "6",
        title: "API rate limiting",
        description: "Third-party API has strict rate limits",
        createdBy: "Jane Smith",
      },
    ],
  })
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const handleAddCards = (newCards: { done: Card[]; willDo: Card[]; blockers: Card[] }) => {
    setBoardData((prev) => ({
      done: [...prev.done, ...newCards.done],
      willDo: [...prev.willDo, ...newCards.willDo],
      blockers: [...prev.blockers, ...newCards.blockers],
    }))
    setIsDialogOpen(false)
  }

  const handleEditCard = (column: Column, cardId: string, updates: Partial<Card>) => {
    setBoardData((prev) => ({
      ...prev,
      [column]: prev[column].map((card) => (card.id === cardId ? { ...card, ...updates } : card)),
    }))
  }

  const handleDeleteCard = (column: Column, cardId: string) => {
    setBoardData((prev) => ({
      ...prev,
      [column]: prev[column].filter((card) => card.id !== cardId),
    }))
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar userRole="scrum-master" />

      <div className="flex-1 flex flex-col">
        <PageHeader onAddCards={() => setIsDialogOpen(true)} />

        <main className="flex-1 container mx-auto px-6 py-8">
          <KanbanBoard data={boardData} onEditCard={handleEditCard} onDeleteCard={handleDeleteCard} />
        </main>
      </div>

      <AddCardsDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} onSubmit={handleAddCards} />
    </div>
  )
}
