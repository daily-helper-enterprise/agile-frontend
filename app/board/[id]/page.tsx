"use client";

import { useState, useMemo, useEffect } from "react";
import { KanbanBoard } from "@/components/kanban-board";
import { AddCardsDialog } from "@/components/add-cards-dialog";
import { PageHeader } from "@/components/page-header";
import { AuthenticatedLayout } from "@/components/authenticated-layout";
import { useAuth } from "@/contexts/auth-context";
import { cardsApi, boardsApi } from "@/lib/api";
import { useParams } from "next/navigation";
import type { FilterState } from "@/components/task-filter";
import type { Card, Column, BoardData, CardType } from "@/lib/types";

export default function BoardPage() {
  const params = useParams();
  const boardId = params.id as string;

  return <BoardPageClient boardId={boardId} />;
}

function BoardPageClient({ boardId }: { boardId: string }) {
  const { user } = useAuth();

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const [boardData, setBoardData] = useState<BoardData>({
    done: [],
    willDo: [],
    blockers: [],
  });
  const [isLoadingBoard, setIsLoadingBoard] = useState(true);
  const [availableAuthors, setAvailableAuthors] = useState<string[]>([]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [filters, setFilters] = useState<FilterState>({
    dateRange: { from: today, to: today },
    authors: [],
  });

  useEffect(() => {
    const loadBoardDetails = async () => {
      try {
        const board = await boardsApi.getBoard(boardId);
        if (board && board.members) {
          const memberNames = board.members.map((member: any) =>
            typeof member === "string" ? member : member.name
          );
          setAvailableAuthors(memberNames.sort());
        }
      } catch (error) {
        console.error("Erro ao carregar detalhes do board:", error);
      }
    };

    loadBoardDetails();
  }, [boardId]);

  useEffect(() => {
    const loadBoardData = async () => {
      try {
        setIsLoadingBoard(true);
        const now = new Date();
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(now.getFullYear() - 1);

        const startOfDay = new Date(filters.dateRange?.from || oneYearAgo);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(filters.dateRange?.to || now);
        endOfDay.setHours(23, 59, 59, 999);
        const data = await cardsApi.getCards(
          boardId,
          startOfDay.toISOString(),
          endOfDay.toISOString()
        );
        console.log(data);
        setBoardData(data);
      } catch (error) {
        console.error("Erro ao carregar dados do board:", error);
      } finally {
        setIsLoadingBoard(false);
      }
    };

    loadBoardData();
  }, [boardId, filters.dateRange]);

  /**
   * Adds new cards to the board
   * @param newCards - Cards organized by column
   */
  const handleAddCards = async (newCards: {
    done: Card[];
    willDo: Card[];
    blockers: Card[];
  }) => {
    try {
      if (!user) return;

      const createPromises: Promise<Card>[] = [];

      const columnToType: Record<string, CardType> = {
        done: "WHAT_I_DID_YESTERDAY",
        willDo: "WHAT_I_PRETEND_TO_DO",
        blockers: "WHAT_I_DID_TODAY",
      };

      Object.entries(newCards).forEach(([column, cards]) => {
        const cardType = columnToType[column];
        cards.forEach((card: any) => {
          createPromises.push(
            cardsApi.createCard(
              {
                title: card.title,
                description: card.description,
                type: cardType,
                resolved: false,
              },
              user
            )
          );
        });
      });

      await Promise.all(createPromises);

      const startOfDay = new Date(filters.dateRange?.from || new Date());
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(filters.dateRange?.to || new Date());
      endOfDay.setHours(23, 59, 59, 999);
      const updatedData = await cardsApi.getCards(
        boardId,
        startOfDay.toISOString(),
        endOfDay.toISOString()
      );

      setBoardData(updatedData);
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Erro ao adicionar cards:", error);
    }
  };

  /**
   * Updates an existing card
   * @param column - Column containing the card
   * @param cardId - ID of the card to update
   * @param updates - Partial card data to apply
   */
  const handleEditCard = async (
    column: Column,
    cardId: number,
    updates: Partial<Card>
  ) => {
    try {
      await cardsApi.updateCard(cardId, {
        ...updates,
      });

      setBoardData((prev) => ({
        ...prev,
        [column]: prev[column].map((card) =>
          card.id === cardId ? { ...card, ...updates } : card
        ),
      }));
    } catch (error) {
      console.error("Erro ao atualizar card:", error);
    }
  };

  const handleDeleteCard = async (column: Column, cardId: number) => {
    try {
      await cardsApi.deleteCard(boardId, column, cardId);
      console.log("Card deletado:", cardId, column);
      setBoardData((prev) => ({
        ...prev,
        [column]: prev[column].filter((card) => card.id !== cardId),
      }));
    } catch (error) {
      console.error("Erro ao deletar card:", error);
    }
  };

  const handleToggleResolved = async (cardId: number) => {
    try {
      const card = boardData.blockers.find((c) => c.id === cardId);
      if (!card) return;

      await cardsApi.updateCard(cardId, {
        resolved: !card.resolved,
      });

      setBoardData((prev) => ({
        ...prev,
        blockers: prev.blockers.map((card) =>
          card.id === cardId ? { ...card, resolved: !card.resolved } : card
        ),
      }));
    } catch (error) {
      console.error("Erro ao atualizar blocker:", error);
    }
  };

  const filteredBoardData = useMemo(() => {
    const filterCards = (cards: Card[]) => {
      if (!cards) return [];
      return cards.filter((card) => {
        if (
          filters?.authors &&
          filters.authors.length > 0 &&
          !filters.authors.includes(card.memberName)
        ) {
          return false;
        }

        return true;
      });
    };

    return {
      done: filterCards(boardData.done),
      willDo: filterCards(boardData.willDo),
      blockers: filterCards(boardData.blockers),
    };
  }, [boardData, filters]);

  return (
    <AuthenticatedLayout boardId={boardId}>
      <div className="flex flex-col min-h-screen">
        {/* Page Header with Filter and Add Cards button */}
        <PageHeader
          onAddCards={() => setIsDialogOpen(true)}
          availableAuthors={availableAuthors}
          onFilterChange={setFilters}
          boardId={boardId}
          initialDateRange={{ from: today, to: today }}
        />

        {/* Main Kanban Board */}
        <main className="flex-1 container mx-auto px-6 py-8">
          <KanbanBoard
            data={filteredBoardData}
            onEditCard={handleEditCard}
            onDeleteCard={handleDeleteCard}
            currentUserName={user?.name || ""}
            onToggleResolved={handleToggleResolved}
          />
        </main>
      </div>

      {/* Add Cards Dialog */}
      <AddCardsDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSubmit={handleAddCards}
      />
    </AuthenticatedLayout>
  );
}
