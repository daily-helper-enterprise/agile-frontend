"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, X } from "lucide-react";
import type { Card } from "@/app/page";
import { useAuth } from "@/contexts/auth-context";

type AddCardsDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (cards: { done: Card[]; willDo: Card[]; blockers: Card[] }) => void;
};

type CardInput = {
  id: string;
  title: string;
  description: string;
};

export function AddCardsDialog({
  open,
  onOpenChange,
  onSubmit,
}: AddCardsDialogProps) {
  const { user } = useAuth();
  const [doneCards, setDoneCards] = useState<CardInput[]>([
    { id: crypto.randomUUID(), title: "", description: "" },
  ]);
  const [willDoCards, setWillDoCards] = useState<CardInput[]>([
    { id: crypto.randomUUID(), title: "", description: "" },
  ]);
  const [blockersCards, setBlockersCards] = useState<CardInput[]>([
    { id: crypto.randomUUID(), title: "", description: "" },
  ]);

  const handleSubmit = () => {
    const filterNonEmpty = (cards: CardInput[]): Card[] =>
      cards
        .filter((card) => card.title.trim() !== "")
        .map(({ id, title, description }) => ({
          id,
          title,
          description: description.trim() || undefined,
          createdBy: user?.name || "Unknown User",
          createdByEmail: user?.email,
          createdAt: new Date(),
        }));

    onSubmit({
      done: filterNonEmpty(doneCards),
      willDo: filterNonEmpty(willDoCards),
      blockers: filterNonEmpty(blockersCards),
    });

    // Reset form
    setDoneCards([{ id: crypto.randomUUID(), title: "", description: "" }]);
    setWillDoCards([{ id: crypto.randomUUID(), title: "", description: "" }]);
    setBlockersCards([{ id: crypto.randomUUID(), title: "", description: "" }]);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Adicionar Cards ao Board</DialogTitle>
          <DialogDescription>
            Adicione vários cards em cada coluna. Apenas cards com título serão
            adicionados.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="willDo" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="done">Feito</TabsTrigger>
            <TabsTrigger value="willDo">A Fazer</TabsTrigger>
            <TabsTrigger value="blockers">Bloqueios</TabsTrigger>
          </TabsList>

          <TabsContent value="done" className="space-y-4 mt-4">
            <CardInputList
              cards={doneCards}
              setCards={setDoneCards}
              columnName="Feito"
            />
          </TabsContent>

          <TabsContent value="willDo" className="space-y-4 mt-4">
            <CardInputList
              cards={willDoCards}
              setCards={setWillDoCards}
              columnName="A Fazer"
            />
          </TabsContent>

          <TabsContent value="blockers" className="space-y-4 mt-4">
            <CardInputList
              cards={blockersCards}
              setCards={setBlockersCards}
              columnName="Bloqueios"
            />
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit}>Adicionar Cards</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

type CardInputListProps = {
  cards: CardInput[];
  setCards: (cards: CardInput[]) => void;
  columnName: string;
};

function CardInputList({ cards, setCards, columnName }: CardInputListProps) {
  const addCard = () => {
    setCards([
      ...cards,
      { id: crypto.randomUUID(), title: "", description: "" },
    ]);
  };

  const removeCard = (id: string) => {
    if (cards.length > 1) {
      setCards(cards.filter((card) => card.id !== id));
    }
  };

  const updateCard = (
    id: string,
    field: "title" | "description",
    value: string
  ) => {
    setCards(
      cards.map((card) => (card.id === id ? { ...card, [field]: value } : card))
    );
  };

  return (
    <div className="space-y-4">
      {cards.map((card, index) => (
        <div
          key={card.id}
          className="space-y-3 p-4 border border-border rounded-lg bg-card"
        >
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">
              {columnName} Card {index + 1}
            </Label>
            {cards.length > 1 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeCard(card.id)}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor={`${card.id}-title`}>Título *</Label>
            <Input
              id={`${card.id}-title`}
              placeholder="Digite o título do card"
              value={card.title}
              onChange={(e) => updateCard(card.id, "title", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor={`${card.id}-description`}>Descrição</Label>
            <Textarea
              id={`${card.id}-description`}
              placeholder="Digite a descrição do card (opcional)"
              value={card.description}
              onChange={(e) =>
                updateCard(card.id, "description", e.target.value)
              }
              rows={2}
            />
          </div>
        </div>
      ))}

      <Button
        variant="outline"
        onClick={addCard}
        className="w-full gap-2 bg-transparent"
      >
        <Plus className="h-4 w-4" />
        Adicionar Outro Card de {columnName}
      </Button>
    </div>
  );
}
