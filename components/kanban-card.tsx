/**
 * =============================================================================
 * KANBAN CARD COMPONENT
 * =============================================================================
 * Individual card component for the Kanban board.
 *
 * Features:
 * - Displays card title, description, and creator
 * - Edit/Delete buttons for card owners only
 * - Resolved toggle for blocker cards (owner only)
 * - Visual styling for resolved blockers (opacity, strikethrough)
 *
 * Ownership Check:
 * Edit/Delete actions are only available if currentUserEmail matches
 * the card's createdByEmail field.
 * =============================================================================
 */

"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, User, CheckCircle2 } from "lucide-react";
import type { Card as CardType } from "@/lib/types";

// -----------------------------------------------------------------------------
// Component Props
// -----------------------------------------------------------------------------

interface KanbanCardProps {
  /** Card data to display */
  card: CardType;
  /** Name of current user - for ownership verification */
  currentUserName: string;
  /** Callback when edit button is clicked */
  onEdit: (card: CardType) => void;
  /** Callback when delete button is clicked */
  onDelete: (cardId: number) => void;
  /** Whether this card is in the blockers column */
  isBlocker?: boolean;
  /** Optional callback for toggling blocker resolution */
  onToggleResolved?: (cardId: number) => void;
}

// -----------------------------------------------------------------------------
// Kanban Card Component
// -----------------------------------------------------------------------------

export function KanbanCard({
  card,
  currentUserName,
  onEdit,
  onDelete,
  isBlocker = false,
  onToggleResolved,
}: KanbanCardProps) {
  // Check if current user owns this card (can edit/delete)
  const isOwner = card.memberName === currentUserName;

  return (
    <Card
      className={`p-4 hover:shadow-md transition-shadow ${
        card.resolved ? "opacity-60 bg-green-50 dark:bg-green-950/20" : ""
      }`}
    >
      {/* Card Header with Title and Actions */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3
          className={`font-medium text-card-foreground flex-1 ${
            card.resolved ? "line-through" : ""
          }`}
        >
          {card.title}
        </h3>

        {/* Action Buttons */}
        <div className="flex gap-1">
          {/* Resolve Toggle (Blockers only, owner only) */}
          {isBlocker && isOwner && onToggleResolved && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onToggleResolved(card.id)}
              className={`h-8 w-8 p-0 ${
                card.resolved
                  ? "text-green-600 hover:text-green-700"
                  : "hover:bg-green-100 hover:text-green-600"
              }`}
              aria-label={
                card.resolved
                  ? "Marcar como não resolvido"
                  : "Marcar como resolvido"
              }
            >
              <CheckCircle2 className="h-4 w-4" />
            </Button>
          )}

          {/* Edit/Delete Buttons (Owner only) */}
          {isOwner && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(card)}
                className="h-8 w-8 p-0 hover:bg-muted"
                aria-label="Editar card"
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(card.id)}
                className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
                aria-label="Deletar card"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Card Description */}
      {card.description && (
        <p
          className={`text-sm text-muted-foreground leading-relaxed mb-2 ${
            card.resolved ? "line-through" : ""
          }`}
        >
          {card.description}
        </p>
      )}

      {/* Card Footer with Author and Status */}
      <div className="flex items-center justify-between mt-2 pt-2 border-t border-border">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <User className="h-3.5 w-3.5" />
          <span>{card.memberName}</span>
        </div>

        {/* Resolved badge for blockers */}
        {isBlocker && card.resolved && (
          <span className="text-xs text-green-600 dark:text-green-400 font-medium">
            Resolvido
          </span>
        )}
      </div>
    </Card>
  );
}
