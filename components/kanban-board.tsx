"use client";

import type React from "react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock, AlertCircle } from "lucide-react";
import type { BoardData, Card as CardType } from "@/lib/types";
import { EditCardDialog } from "@/components/edit-card-dialog";
import { KanbanCard } from "@/components/kanban-card";

interface KanbanBoardProps {
  data: BoardData;
  onEditCard: (
    columnKey: string,
    cardId: number,
    updates: Partial<CardType>
  ) => void;
  onDeleteCard: (columnKey: string, cardId: number) => void;
  currentUserName: string;
  onToggleResolved?: (cardId: number) => void;
}

export function KanbanBoard({
  data,
  onEditCard,
  onDeleteCard,
  currentUserName,
  onToggleResolved,
}: KanbanBoardProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <KanbanColumn
        title="Feito"
        columnKey="done"
        cards={data.done}
        icon={<CheckCircle2 className="h-5 w-5" />}
        badgeVariant="default"
        color="text-green-600 dark:text-green-400"
        onEditCard={onEditCard}
        onDeleteCard={onDeleteCard}
        currentUserName={currentUserName}
      />

      <KanbanColumn
        title="A Fazer"
        columnKey="willDo"
        cards={data.willDo}
        icon={<Clock className="h-5 w-5" />}
        badgeVariant="secondary"
        color="text-blue-600 dark:text-blue-400"
        onEditCard={onEditCard}
        onDeleteCard={onDeleteCard}
        currentUserName={currentUserName}
      />

      <KanbanColumn
        title="Bloqueios"
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

interface KanbanColumnProps {
  title: string;
  columnKey: string;
  cards: CardType[];
  icon: React.ReactNode;
  badgeVariant: "default" | "secondary" | "destructive";
  color: string;
  onEditCard: (
    columnKey: string,
    cardId: number,
    updates: Partial<CardType>
  ) => void;
  onDeleteCard: (columnKey: string, cardId: number) => void;
  currentUserName: string;
  isBlockerColumn?: boolean;
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
  const [editingCard, setEditingCard] = useState<CardType | null>(null);

  const handleEdit = (card: CardType) => {
    setEditingCard(card);
  };

  const handleSaveEdit = (updates: Partial<CardType>) => {
    if (editingCard) {
      onEditCard(columnKey, editingCard.id, updates);
      setEditingCard(null);
    }
  };

  const handleDelete = (cardId: number) => {
    if (confirm("Tem certeza que deseja deletar este card?")) {
      onDeleteCard(columnKey, cardId);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={color}>{icon}</div>
          <h2 className="text-xl font-semibold text-foreground">{title}</h2>
        </div>
        <Badge variant={badgeVariant} className="text-sm">
          {cards.length}
        </Badge>
      </div>

      <div className="flex flex-col gap-3 min-h-[400px] bg-muted/30 rounded-lg p-4">
        {cards.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
            No cards yet
          </div>
        ) : (
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
