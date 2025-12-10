"use client";

import { useState, useEffect } from "react";
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
import type { Card } from "@/app/page";

type EditCardDialogProps = {
  card: Card;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (updates: Partial<Card>) => void;
};

export function EditCardDialog({
  card,
  open,
  onOpenChange,
  onSave,
}: EditCardDialogProps) {
  const [title, setTitle] = useState(card.title || "");
  const [description, setDescription] = useState(card.description || "");

  useEffect(() => {
    setTitle(card.title || "");
    setDescription(card.description || "");
  }, [card]);

  const handleSave = () => {
    if (title?.trim()) {
      onSave({
        title: title.trim(),
        description: description?.trim() || "",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Editar Card</DialogTitle>
          <DialogDescription>
            Faça alterações nos detalhes do card.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="edit-title">Título *</Label>
            <Input
              id="edit-title"
              placeholder="Digite o título do card"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-description">Descrição</Label>
            <Textarea
              id="edit-description"
              placeholder="Digite a descrição do card (opcional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={!title?.trim()}>
            Salvar Alterações
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
