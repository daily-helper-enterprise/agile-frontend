"use client";

import { useState, useMemo, useEffect } from "react";
import { AuthenticatedLayout } from "@/components/authenticated-layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { AlertCircle, CalendarIcon, CheckCircle2, User } from "lucide-react";
import { format } from "date-fns";
import type { DateRange } from "react-day-picker";
import Link from "next/link";
import { cardsApi } from "@/lib/api";
import type { Card as CardType } from "@/lib/types";

type Blocker = CardType;

export function BlockersPageClient({ boardId }: { boardId: string }) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: today,
    to: today,
  });
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [allCards, setAllCards] = useState<CardType[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch all cards from the API
  useEffect(() => {
    const fetchCards = async () => {
      try {
        setIsLoading(true);
        // Use 1 year window if no date range selected
        const now = new Date();
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(now.getFullYear() - 1);

        const startOfDay = new Date(dateRange?.from || oneYearAgo);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(dateRange?.to || now);
        endOfDay.setHours(23, 59, 59, 999);

        const data = await cardsApi.getCards(
          boardId,
          startOfDay.toISOString(),
          endOfDay.toISOString()
        );

        // Extract only blockers (WHAT_I_DID_TODAY)
        setAllCards(data.blockers || []);
      } catch (error) {
        console.error("Error fetching blockers:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCards();
  }, [boardId, dateRange]);

  // All blockers are already filtered by date from the API
  const filteredBlockers = allCards;

  const resolvedCount = filteredBlockers.filter((b) => b.resolved).length;
  const unresolvedCount = filteredBlockers.filter((b) => !b.resolved).length;

  return (
    <AuthenticatedLayout boardId={boardId}>
      <div className="flex-1">
        <header className="border-b border-border bg-card">
          <div className="container mx-auto px-6 py-6">
            <div className="flex items-center justify-between">
              <div>
                <Link href={`/board/${boardId}`}>
                  <Button variant="ghost" size="sm" className="gap-2 mb-2">
                    Voltar ao Board
                  </Button>
                </Link>
                <h1 className="text-3xl font-bold text-foreground">
                  Relatório de Bloqueios
                </h1>
                <p className="text-muted-foreground mt-1">
                  Visualize todos os bloqueios em um período específico
                </p>
              </div>
              <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="gap-2 bg-transparent">
                    <CalendarIcon className="h-4 w-4" />
                    {dateRange?.from ? (
                      dateRange.to ? (
                        <>
                          {format(dateRange.from, "MMM d")} -{" "}
                          {format(dateRange.to, "MMM d, yyyy")}
                        </>
                      ) : (
                        format(dateRange.from, "MMM d, yyyy")
                      )
                    ) : (
                      "Selecionar período"
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <div className="p-3">
                    <Label>Selecionar Período</Label>
                  </div>
                  <Calendar
                    mode="range"
                    selected={dateRange}
                    onSelect={setDateRange}
                    numberOfMonths={1}
                  />
                  <div className="p-3 border-t">
                    <Button
                      size="sm"
                      onClick={() => setCalendarOpen(false)}
                      className="w-full"
                    >
                      Aplicar
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-6 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                  <AlertCircle className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Total de Bloqueios
                  </p>
                  <p className="text-2xl font-bold">
                    {filteredBlockers.length}
                  </p>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Resolvidos</p>
                  <p className="text-2xl font-bold text-green-600">
                    {resolvedCount}
                  </p>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Não Resolvidos
                  </p>
                  <p className="text-2xl font-bold text-red-600">
                    {unresolvedCount}
                  </p>
                </div>
              </div>
            </Card>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Todos os Bloqueios</h2>
            {filteredBlockers.length === 0 ? (
              <Card className="p-8 text-center text-muted-foreground">
                Nenhum bloqueio encontrado no período selecionado
              </Card>
            ) : (
              <div className="space-y-3">
                {filteredBlockers.map((blocker) => (
                  <Card
                    key={blocker.id}
                    className={`p-4 ${blocker.resolved ? "opacity-60" : ""}`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3
                            className={`font-medium ${
                              blocker.resolved ? "line-through" : ""
                            }`}
                          >
                            {blocker.title}
                          </h3>
                          <Badge
                            variant={
                              blocker.resolved ? "default" : "destructive"
                            }
                          >
                            {blocker.resolved ? "Resolvido" : "Não Resolvido"}
                          </Badge>
                        </div>
                        {blocker.description && (
                          <p className="text-sm text-muted-foreground mb-2">
                            {blocker.description}
                          </p>
                        )}
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {blocker.memberName}
                          </div>
                          <div className="flex items-center gap-1">
                            <CalendarIcon className="h-3 w-3" />
                            {blocker.creationDate}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </AuthenticatedLayout>
  );
}
