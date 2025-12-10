"use client";

import { useState, useMemo, useEffect } from "react";
import { AuthenticatedLayout } from "@/components/authenticated-layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  CalendarIcon,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
} from "lucide-react";
import { format, eachDayOfInterval, subDays } from "date-fns";
import type { DateRange } from "react-day-picker";
import Link from "next/link";
import { cardsApi, boardsApi } from "@/lib/api";
import type { Card as CardType, BoardData } from "@/lib/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

type TaskData = {
  date: Date;
  completed: number;
};

type BlockerData = {
  resolved: number;
  unresolved: number;
};

export function PerformancePageClient({ boardId }: { boardId: string }) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const weekAgo = subDays(today, 6);

  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: weekAgo,
    to: today,
  });
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [boardData, setBoardData] = useState<BoardData>({
    done: [],
    willDo: [],
    blockers: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [availableAuthors, setAvailableAuthors] = useState<string[]>([]);
  const [selectedAuthor, setSelectedAuthor] = useState<string>("all");

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
    const fetchData = async () => {
      try {
        setIsLoading(true);
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

        setBoardData(data);
      } catch (error) {
        console.error("Erro ao buscar dados de desempenho:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [boardId, dateRange]);

  const filteredBoardData = useMemo(() => {
    if (selectedAuthor === "all") return boardData;

    return {
      done: boardData.done.filter((card) => card.memberName === selectedAuthor),
      willDo: boardData.willDo.filter(
        (card) => card.memberName === selectedAuthor
      ),
      blockers: boardData.blockers.filter(
        (card) => card.memberName === selectedAuthor
      ),
    };
  }, [boardData, selectedAuthor]);

  const totalTasks = useMemo(() => {
    return filteredBoardData.done.length;
  }, [filteredBoardData]);

  const mockTasksPerDay: TaskData[] = useMemo(() => {
    if (!dateRange?.from || !dateRange?.to) return [];

    const days = eachDayOfInterval({
      start: dateRange.from,
      end: dateRange.to,
    });
    const allCards = [
      ...filteredBoardData.done,
      ...filteredBoardData.willDo,
      ...filteredBoardData.blockers,
    ];

    return days.map((date) => {
      const dateStr = format(date, "dd-MM-yyyy");
      const tasksOnDate = allCards.filter((card) => {
        return card.creationDate === dateStr;
      });

      return {
        date,
        completed: tasksOnDate.length,
      };
    });
  }, [dateRange, filteredBoardData]);

  const mockBlockerData: BlockerData = useMemo(() => {
    const blockers = filteredBoardData.blockers || [];
    return {
      resolved: blockers.filter((b) => b.resolved).length,
      unresolved: blockers.filter((b) => !b.resolved).length,
    };
  }, [filteredBoardData]);

  const chartData = mockTasksPerDay.map((item) => ({
    name: format(item.date, "MMM d"),
    tasks: item.completed,
  }));

  const pieData = [
    { name: "Resolvidos", value: mockBlockerData.resolved },
    { name: "Não Resolvidos", value: mockBlockerData.unresolved },
  ];

  const COLORS = ["#22c55e", "#ef4444"];

  const resolvedPercentage = Math.round(
    (mockBlockerData.resolved /
      (mockBlockerData.resolved + mockBlockerData.unresolved)) *
      100
  );

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
                  Relatório de Performance
                </h1>
                <p className="text-muted-foreground mt-1">
                  Acompanhe a produtividade da equipe e resolução de bloqueios
                </p>
              </div>
              <div className="flex gap-2">
                <Select
                  value={selectedAuthor}
                  onValueChange={setSelectedAuthor}
                >
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Todos os Autores" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os Autores</SelectItem>
                    {availableAuthors.map((author) => (
                      <SelectItem key={author} value={author}>
                        {author}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

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
          </div>
        </header>

        <main className="container mx-auto px-6 py-8">
          <div
            className={`grid grid-cols-1 ${
              dateRange?.from && dateRange?.to
                ? "md:grid-cols-3"
                : "md:grid-cols-2"
            } gap-4 mb-8`}
          >
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Tarefas Concluídas
                  </p>
                  <p className="text-2xl font-bold">{totalTasks}</p>
                </div>
              </div>
            </Card>
            {dateRange?.from && dateRange?.to && (
              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Média Tarefas/Dia
                    </p>
                    <p className="text-2xl font-bold">
                      {mockTasksPerDay.length > 0
                        ? (totalTasks / mockTasksPerDay.length).toFixed(1)
                        : 0}
                    </p>
                  </div>
                </div>
              </Card>
            )}
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                  <AlertCircle className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Bloqueios Resolvidos
                  </p>
                  <p className="text-2xl font-bold">{resolvedPercentage}%</p>
                </div>
              </div>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {dateRange?.from && dateRange?.to && (
              <Card className="p-6">
                <h2 className="text-lg font-semibold mb-4">
                  Tarefas Concluídas por Dia
                </h2>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        className="stroke-muted"
                      />
                      <XAxis dataKey="name" className="text-xs" />
                      <YAxis className="text-xs" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                        cursor={{ fill: "rgba(99, 102, 241, 0.1)" }}
                      />
                      <Bar
                        dataKey="tasks"
                        fill="#6366f1"
                        radius={[4, 4, 0, 0]}
                        label={{
                          position: "top",
                          fill: "hsl(var(--foreground))",
                        }}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            )}

            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">
                Taxa de Resolução de Bloqueios
              </h2>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, percent }) =>
                        `${name} ${(percent * 100).toFixed(0)}%`
                      }
                    >
                      {pieData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>
        </main>
      </div>
    </AuthenticatedLayout>
  );
}
