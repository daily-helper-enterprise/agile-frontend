"use client";

import { Button } from "@/components/ui/button";
import { Plus, ArrowLeft } from "lucide-react";
import { TaskFilter, type FilterState } from "./task-filter";
import Link from "next/link";
import type { DateRange } from "react-day-picker";

type PageHeaderProps = {
  onAddCards: () => void;
  availableAuthors: string[];
  onFilterChange: (filters: FilterState) => void;
  boardId?: string;
  initialDateRange?: DateRange;
};

export function PageHeader({
  onAddCards,
  availableAuthors,
  onFilterChange,
  boardId,
  initialDateRange,
}: PageHeaderProps) {
  return (
    <header className="border-b border-border bg-card">
      <div className="container mx-auto px-6 py-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              {boardId && (
                <Link href="/boards">
                  <Button variant="ghost" size="sm" className="gap-2">
                    <ArrowLeft className="h-4 w-4" />
                    Voltar aos Boards
                  </Button>
                </Link>
              )}
            </div>
            <h1 className="text-3xl font-bold text-foreground">
              Quadro de Tarefas
            </h1>
            <p className="text-muted-foreground mt-1">
              Gerencie suas tarefas e acompanhe o progresso
            </p>
          </div>
          <div className="flex items-center gap-3">
            <TaskFilter
              availableAuthors={availableAuthors}
              onFilterChange={onFilterChange}
              initialDateRange={initialDateRange}
            />
            <Button onClick={onAddCards} size="lg" className="gap-2">
              <Plus className="h-5 w-5" />
              Adicionar Cards
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
