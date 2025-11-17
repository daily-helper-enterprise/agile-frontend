"use client";

import { useState, useMemo } from "react";
import { KanbanBoard } from "@/components/kanban-board";
import { AddCardsDialog } from "@/components/add-cards-dialog";
import { PageHeader } from "@/components/page-header";
import { Sidebar } from "@/components/sidebar";
import type { FilterState } from "@/components/task-filter";

export type Card = {
  id: string;
  title: string;
  description?: string;
  createdBy: string;
  createdAt: Date;
};

export type Column = "done" | "willDo" | "blockers";

export type BoardData = {
  done: Card[];
  willDo: Card[];
  blockers: Card[];
};

export const CURRENT_USER = "John Doe";

export default function Page() {
  const [boardData, setBoardData] = useState<BoardData>({
    done: [
      {
        id: "1",
        title: "Configurar repositório do projeto",
        description: "Inicializar Git e criar estrutura inicial",
        createdBy: "John Doe",
        createdAt: new Date(2025, 0, 10),
      },
      {
        id: "2",
        title: "Projetar arquitetura do sistema",
        description: "Definir estrutura de componentes e fluxo de dados",
        createdBy: "Jane Smith",
        createdAt: new Date(2025, 0, 12),
      },
    ],
    willDo: [
      {
        id: "3",
        title: "Implementar autenticação",
        description: "Adicionar login e registro de usuário",
        createdBy: "John Doe",
        createdAt: new Date(2025, 0, 15),
      },
      {
        id: "4",
        title: "Criar interface do dashboard",
        description: "Construir interface principal do dashboard",
        createdBy: "Jane Smith",
        createdAt: new Date(2025, 0, 16),
      },
      {
        id: "5",
        title: "Configurar esquema do banco de dados",
        description: "Projetar e implementar tabelas do banco de dados",
        createdBy: "John Doe",
        createdAt: new Date(2025, 0, 14),
      },
    ],
    blockers: [
      {
        id: "6",
        title: "Limitação de taxa da API",
        description: "A API de terceiros tem limites de taxa rigorosos",
        createdBy: "Jane Smith",
        createdAt: new Date(2025, 0, 13),
      },
    ],
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    dateRange: undefined,
    authors: [],
    cardTypes: [],
  });

  const handleAddCards = (newCards: {
    done: Card[];
    willDo: Card[];
    blockers: Card[];
  }) => {
    setBoardData((prev) => ({
      done: [...prev.done, ...newCards.done],
      willDo: [...prev.willDo, ...newCards.willDo],
      blockers: [...prev.blockers, ...newCards.blockers],
    }));
    setIsDialogOpen(false);
  };

  const handleEditCard = (
    column: Column,
    cardId: string,
    updates: Partial<Card>
  ) => {
    setBoardData((prev) => ({
      ...prev,
      [column]: prev[column].map((card) =>
        card.id === cardId ? { ...card, ...updates } : card
      ),
    }));
  };

  const handleDeleteCard = (column: Column, cardId: string) => {
    setBoardData((prev) => ({
      ...prev,
      [column]: prev[column].filter((card) => card.id !== cardId),
    }));
  };

  const filteredBoardData = useMemo(() => {
    const filterCards = (cards: Card[]) => {
      return cards.filter((card) => {
        // Date filter
        if (filters.dateRange?.from || filters.dateRange?.to) {
          const cardDate = new Date(card.createdAt);
          cardDate.setHours(0, 0, 0, 0);

          if (filters.dateRange.from) {
            const fromDate = new Date(filters.dateRange.from);
            fromDate.setHours(0, 0, 0, 0);
            if (cardDate < fromDate) return false;
          }

          if (filters.dateRange.to) {
            const toDate = new Date(filters.dateRange.to);
            toDate.setHours(23, 59, 59, 999);
            if (cardDate > toDate) return false;
          }
        }

        // Author filter
        if (
          filters.authors.length > 0 &&
          !filters.authors.includes(card.createdBy)
        ) {
          return false;
        }

        return true;
      });
    };

    const filtered: BoardData = {
      done: filterCards(boardData.done),
      willDo: filterCards(boardData.willDo),
      blockers: filterCards(boardData.blockers),
    };

    // Card type filter - only show selected columns
    if (filters.cardTypes.length > 0) {
      if (!filters.cardTypes.includes("done")) filtered.done = [];
      if (!filters.cardTypes.includes("willDo")) filtered.willDo = [];
      if (!filters.cardTypes.includes("blockers")) filtered.blockers = [];
    }

    return filtered;
  }, [boardData, filters]);

  const availableAuthors = useMemo(() => {
    const authors = new Set<string>();
    Object.values(boardData).forEach((cards) => {
      cards.forEach((card) => authors.add(card.createdBy));
    });
    return Array.from(authors).sort();
  }, [boardData]);

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar userRole="scrum-master" />

      <div className="flex-1 flex flex-col">
        <PageHeader
          onAddCards={() => setIsDialogOpen(true)}
          availableAuthors={availableAuthors}
          onFilterChange={setFilters}
        />

        <main className="flex-1 container mx-auto px-6 py-8">
          <KanbanBoard
            data={filteredBoardData}
            onEditCard={handleEditCard}
            onDeleteCard={handleDeleteCard}
          />
        </main>
      </div>

      <AddCardsDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSubmit={handleAddCards}
      />
    </div>
  );
}
