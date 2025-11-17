"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { TaskFilter, type FilterState } from "./task-filter";

type PageHeaderProps = {
  onAddCards: () => void;
  availableAuthors: string[];
  onFilterChange: (filters: FilterState) => void;
};

export function PageHeader({
  onAddCards,
  availableAuthors,
  onFilterChange,
}: PageHeaderProps) {
  return (
    <header className="border-b border-border bg-card">
      <div className="container mx-auto px-6 py-6">
        <div className="flex items-center justify-between">
          <div>
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
