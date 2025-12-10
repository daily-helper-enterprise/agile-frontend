"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { AuthenticatedLayout } from "@/components/authenticated-layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { UserPlus, Trash2, Mail, User, Shield, ArrowLeft } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { boardsApi, teamApi } from "@/lib/api";
import Link from "next/link";

type TeamMember = {
  id: string;
  name: string;
  email: string;
  addedAt: Date;
};

interface Board {
  id: number;
  name: string;
  description: string | null;
  scrumMaster: string;
  members: string[];
}

export default function TeamPageClient({ boardId }: { boardId: string }) {
  const { user } = useAuth();
  const [board, setBoard] = useState<Board | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);

  useEffect(() => {
    const fetchBoardData = async () => {
      try {
        const foundBoard = await boardsApi.getBoard(boardId);
        console.log("Found board:", foundBoard);
        if (foundBoard) {
          setBoard(foundBoard);
        }

        setTeamMembers(foundBoard?.members || []);
      } catch (error) {
        console.error("Erro ao carregar dados do board:", error);
      }
    };

    fetchBoardData();
  }, [boardId]);

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newMemberId, setNewMemberId] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const isScrumMaster = user?.name === board?.scrumMaster;

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!board) return;

    setIsLoading(true);

    try {
      const memberId = parseInt(newMemberId);
      if (isNaN(memberId)) {
        alert("Por favor, insira um ID de membro válido");
        return;
      }

      const newMember = await teamApi.addMember({
        boardId: board.id,
        memberId,
      });

      setTeamMembers((prev) => [...prev, newMember]);
      setBoard((prev) =>
        prev ? { ...prev, members: [...prev.members, newMember.name] } : null
      );
      setNewMemberId("");
      setIsAddDialogOpen(false);
    } catch (error) {
      console.error("Erro ao adicionar membro:", error);
      alert("Falha ao adicionar membro. Por favor, tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveMember = async (memberId: string, memberName: string) => {
    if (!board) return;

    if (
      confirm("Tem certeza que deseja remover este membro do board?")
    ) {
      try {
        await teamApi.removeMember(board.id, parseInt(memberId));
        setTeamMembers((prev) =>
          prev.filter((member) => member.id !== memberId)
        );
        setBoard((prev) =>
          prev
            ? {
                ...prev,
                members: prev.members.filter((name) => name !== memberName),
              }
            : null
        );
      } catch (error) {
        console.error("Erro ao remover membro:", error);
        alert("Falha ao remover membro. Por favor, tente novamente.");
      }
    }
  };

  return (
    <AuthenticatedLayout boardId={boardId}>
      <div className="flex flex-col min-h-screen">
        <header className="border-b border-border bg-card sticky top-0 z-10">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link href={`/board/${boardId}`}>
                  <Button variant="ghost" size="icon">
                    <ArrowLeft className="h-5 w-5" />
                  </Button>
                </Link>
                <div>
                  <h1 className="text-2xl font-bold text-foreground">
                    Membros da Equipe
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    Gerenciar membros do board e permissões
                  </p>
                </div>
              </div>

              {isScrumMaster && (
                <Dialog
                  open={isAddDialogOpen}
                  onOpenChange={setIsAddDialogOpen}
                >
                  <DialogTrigger asChild>
                    <Button>
                      <UserPlus className="h-4 w-4 mr-2" />
                      Adicionar Membro
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Adicionar Membro da Equipe</DialogTitle>
                      <DialogDescription>
                        Insira o ID do usuário que deseja adicionar a este board.
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleAddMember} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="memberId">ID do Membro</Label>
                        <Input
                          id="memberId"
                          type="number"
                          placeholder="123"
                          value={newMemberId}
                          onChange={(e) => setNewMemberId(e.target.value)}
                          required
                        />
                      </div>
                      <div className="flex justify-end gap-3">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setIsAddDialogOpen(false)}
                        >
                          Cancelar
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                          {isLoading ? "Adicionando..." : "Adicionar Membro"}
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 container mx-auto px-6 py-8">
          <div className="max-w-4xl mx-auto space-y-4">
            {teamMembers.map((member) => {
              console.log("Rendering member:", member);
              const isMemberScrumMaster = member.name === board?.scrumMaster;

              return (
                <Card key={member.id} className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-foreground">
                            {member.name}
                          </h3>
                          {isMemberScrumMaster && (
                            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
                              <Shield className="h-3 w-3" />
                              Scrum Master
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                          <Mail className="h-3.5 w-3.5" />
                          {member.email}
                        </div>
                      </div>
                    </div>

                    {isScrumMaster && !isMemberScrumMaster && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          handleRemoveMember(member.id, member.name)
                        }
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </Card>
              );
            })}

            {teamMembers.length === 0 && (
              <div className="text-center py-12">
                <User className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Nenhum membro da equipe ainda
                </h3>
                <p className="text-muted-foreground">
                  Adicione membros para começar a colaborar neste board.
                </p>
              </div>
            )}
          </div>
        </main>
      </div>
    </AuthenticatedLayout>
  );
}
