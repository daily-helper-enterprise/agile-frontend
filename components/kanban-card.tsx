"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, User } from "lucide-react";
import type { Card as CardType } from "@/app/page";

type KanbanCardProps = {
  card: CardType;
  currentUser: string;
  onEdit: (card: CardType) => void;
  onDelete: (cardId: string) => void;
};

export function KanbanCard({
  card,
  currentUser,
  onEdit,
  onDelete,
}: KanbanCardProps) {
  const isOwner = card.createdBy === currentUser;

  return (
    <Card className="p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="font-medium text-card-foreground flex-1">
          {card.title}
        </h3>
        {isOwner && (
          <div className="flex gap-1">
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
          </div>
        )}
      </div>
      {card.description && (
        <p className="text-sm text-muted-foreground leading-relaxed mb-2">
          {card.description}
        </p>
      )}
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-2 pt-2 border-t border-border">
        <User className="h-3.5 w-3.5" />
        <span>{card.createdBy}</span>
      </div>
    </Card>
  );
}
