"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Filter } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { DateRange } from "react-day-picker";

export type FilterState = {
  dateRange: DateRange | undefined;
  authors: string[];
  cardTypes: ("done" | "willDo" | "blockers")[];
};

type TaskFilterProps = {
  availableAuthors: string[];
  onFilterChange: (filters: FilterState) => void;
};

export function TaskFilter({
  availableAuthors,
  onFilterChange,
}: TaskFilterProps) {
  const [open, setOpen] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [selectedAuthor, setSelectedAuthor] = useState<string>("");
  const [selectedCardTypes, setSelectedCardTypes] = useState<
    ("done" | "willDo" | "blockers")[]
  >([]);

  const cardTypes = [
    { value: "done" as const, label: "Feito" },
    { value: "willDo" as const, label: "A Fazer" },
    { value: "blockers" as const, label: "Bloqueadores" },
  ];

  const toggleCardType = (type: "done" | "willDo" | "blockers") => {
    setSelectedCardTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const handleApplyFilters = () => {
    onFilterChange({
      dateRange,
      authors: selectedAuthor ? [selectedAuthor] : [],
      cardTypes: selectedCardTypes,
    });
    setOpen(false);
  };

  const handleClearFilters = () => {
    setDateRange(undefined);
    setSelectedAuthor("");
    setSelectedCardTypes([]);
    onFilterChange({
      dateRange: undefined,
      authors: [],
      cardTypes: [],
    });
  };

  const activeFilterCount =
    (dateRange?.from || dateRange?.to ? 1 : 0) +
    (selectedAuthor ? 1 : 0) +
    (selectedCardTypes.length > 0 ? 1 : 0);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Filter className="h-4 w-4" />
          Filtrar
          {activeFilterCount > 0 && (
            <Badge
              variant="secondary"
              className="ml-1 px-1.5 min-w-5 h-5 flex items-center justify-center"
            >
              {activeFilterCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-foreground">Filtros</h3>
            {activeFilterCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearFilters}
                className="h-auto p-0 text-xs"
              >
                Limpar tudo
              </Button>
            )}
          </div>

          <div className="space-y-3">
            <div className="space-y-2">
              <Label>Período</Label>
              <Calendar
                mode="range"
                selected={dateRange}
                onSelect={setDateRange}
                className="rounded-md border"
                numberOfMonths={1}
              />
            </div>

            <div className="space-y-2">
              <Label>Autor</Label>
              <Select value={selectedAuthor} onValueChange={setSelectedAuthor}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um autor" />
                </SelectTrigger>
                <SelectContent>
                  {availableAuthors.map((author) => (
                    <SelectItem key={author} value={author}>
                      {author}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Tipo de Card</Label>
              <div className="space-y-2">
                {cardTypes.map((type) => (
                  <div key={type.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={type.value}
                      checked={selectedCardTypes.includes(type.value)}
                      onCheckedChange={() => toggleCardType(type.value)}
                    />
                    <label
                      htmlFor={type.value}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      {type.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button onClick={handleApplyFilters} className="flex-1">
              Aplicar Filtros
            </Button>
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              className="flex-1"
            >
              Cancelar
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
