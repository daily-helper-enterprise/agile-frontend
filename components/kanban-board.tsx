/**
 * =============================================================================
 * KANBAN BOARD COMPONENT
 * =============================================================================
 * Main board component displaying cards in three columns: Done, Will Do, Blockers.
 *
 * Features:
 * - Three-column layout with responsive grid
 * - Card count badges for each column
 * - Edit and delete functionality for card owners
 * - Blocker resolution toggle (for blocker column only)
 * - Empty state handling
 *
 * Props:
 * - data: BoardData with cards organized by column
 * - onEditCard: Handler for editing cards
 * - onDeleteCard: Handler for deleting cards
 * - currentUserEmail: Email of logged-in user (for permission checks)
 * - onToggleResolved: Handler for toggling blocker resolution status
 * =============================================================================
 */

"use client";

import type React from "react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock, AlertCircle } from "lucide-react";
import type { BoardData, Card as CardType } from "@/lib/types";
import { EditCardDialog } from "@/components/edit-card-dialog";
import { KanbanCard } from "@/components/kanban-card";

// -----------------------------------------------------------------------------
// Component Props
// -----------------------------------------------------------------------------

interface KanbanBoardProps {
  /** Board data with cards organized by column */
  data: BoardData;
  /** Callback when a card is edited */
  onEditCard: (
    columnKey: string,
    cardId: number,
    updates: Partial<CardType>
  ) => void;
  /** Callback when a card is deleted */
  onDeleteCard: (columnKey: string, cardId: number) => void;
  /** Name of current user - used for ownership checks */
  currentUserName: string;
  /** Optional callback for toggling blocker resolution */
  onToggleResolved?: (cardId: number) => void;
}

// -----------------------------------------------------------------------------
// Kanban Board Component
// -----------------------------------------------------------------------------

export function KanbanBoard({
  data,
  onEditCard,
  onDeleteCard,
  currentUserName,
  onToggleResolved,
}: KanbanBoardProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Done Column - Completed tasks */}
      <KanbanColumn
        title="Done"
        columnKey="done"
        cards={data.done}
        icon={<CheckCircle2 className="h-5 w-5" />}
        badgeVariant="default"
        color="text-green-600 dark:text-green-400"
        onEditCard={onEditCard}
        onDeleteCard={onDeleteCard}
        currentUserName={currentUserName}
      />

      {/* Will Do Column - Planned tasks */}
      <KanbanColumn
        title="Will Do"
        columnKey="willDo"
        cards={data.willDo}
        icon={<Clock className="h-5 w-5" />}
        badgeVariant="secondary"
        color="text-blue-600 dark:text-blue-400"
        onEditCard={onEditCard}
        onDeleteCard={onDeleteCard}
        currentUserName={currentUserName}
      />

      {/* Blockers Column - Blocking issues */}
      <KanbanColumn
        title="Blockers"
        columnKey="blockers"
        cards={data.blockers}
        icon={<AlertCircle className="h-5 w-5" />}
        badgeVariant="destructive"
        color="text-red-600 dark:text-red-400"
        onEditCard={onEditCard}
        onDeleteCard={onDeleteCard}
        currentUserName={currentUserName}
        isBlockerColumn
        onToggleResolved={onToggleResolved}
      />
    </div>
  );
}

// -----------------------------------------------------------------------------
// Kanban Column Component (Internal)
// -----------------------------------------------------------------------------

interface KanbanColumnProps {
  /** Column display title */
  title: string;
  /** Column key for data operations */
  columnKey: string;
  /** Cards in this column */
  cards: CardType[];
  /** Icon to display in column header */
  icon: React.ReactNode;
  /** Badge variant for card count */
  badgeVariant: "default" | "secondary" | "destructive";
  /** Color class for column icon */
  color: string;
  /** Callback when a card is edited */
  onEditCard: (
    columnKey: string,
    cardId: number,
    updates: Partial<CardType>
  ) => void;
  /** Callback when a card is deleted */
  onDeleteCard: (columnKey: string, cardId: number) => void;
  /** Name of current user */
  currentUserName: string;
  /** Whether this is the blockers column (enables resolution toggle) */
  isBlockerColumn?: boolean;
  /** Optional callback for toggling blocker resolution */
  onToggleResolved?: (cardId: number) => void;
}

function KanbanColumn({
  title,
  columnKey,
  cards,
  icon,
  badgeVariant,
  color,
  onEditCard,
  onDeleteCard,
  currentUserName,
  isBlockerColumn = false,
  onToggleResolved,
}: KanbanColumnProps) {
  // Track which card is being edited
  const [editingCard, setEditingCard] = useState<CardType | null>(null);

  // ---------------------------------------------------------------------------
  // Event Handlers
  // ---------------------------------------------------------------------------

  /**
   * Opens the edit dialog for a card
   */
  const handleEdit = (card: CardType) => {
    setEditingCard(card);
  };

  /**
   * Saves edits to a card and closes the dialog
   */
  const handleSaveEdit = (updates: Partial<CardType>) => {
    if (editingCard) {
      onEditCard(columnKey, editingCard.id, updates);
      setEditingCard(null);
    }
  };

  /**
   * Deletes a card with confirmation
   */
  const handleDelete = (cardId: number) => {
    if (confirm("Tem certeza que deseja deletar este card?")) {
      onDeleteCard(columnKey, cardId);
    }
  };

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="flex flex-col gap-4">
      {/* Column Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={color}>{icon}</div>
          <h2 className="text-xl font-semibold text-foreground">{title}</h2>
        </div>
        {/* Card count badge */}
        <Badge variant={badgeVariant} className="text-sm">
          {cards.length}
        </Badge>
      </div>

      {/* Cards Container */}
      <div className="flex flex-col gap-3 min-h-[400px] bg-muted/30 rounded-lg p-4">
        {cards.length === 0 ? (
          // Empty state
          <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
            No cards yet
          </div>
        ) : (
          // Render cards
          cards.map((card) => (
            <KanbanCard
              key={card.id}
              card={card}
              currentUserName={currentUserName}
              onEdit={handleEdit}
              onDelete={handleDelete}
              isBlocker={isBlockerColumn}
              onToggleResolved={onToggleResolved}
            />
          ))
        )}
      </div>

      {/* Edit Dialog (rendered when editingCard is set) */}
      {editingCard && (
        <EditCardDialog
          card={editingCard}
          open={!!editingCard}
          onOpenChange={(open) => !open && setEditingCard(null)}
          onSave={handleSaveEdit}
        />
      )}
    </div>
  );
}
