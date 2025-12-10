"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { authApi, boardsApi } from "@/lib/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, LogOut } from "lucide-react";
import type { UserTeam } from "@/lib/types";

interface Board {
  id: number;
  name: string;
  description: string | null;
  scrumMaster: boolean;
}

export default function BoardsPage() {
  const { user, token, isLoading, logout, refreshUser } = useAuth();
  const router = useRouter();

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newBoardName, setNewBoardName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [boards, setBoards] = useState<UserTeam[]>([]);

  useEffect(() => {
    if (user?.teams) {
      setBoards(user.teams);
    }
  }, [user]);

  useEffect(() => {
    const refreshBoards = async () => {
      if (!token) return;
      try {
        const refreshedUser = await authApi.validateToken();
        if (refreshedUser?.teams) {
          setBoards(refreshedUser.teams);
        }
      } catch (error) {
        console.error("Erro ao atualizar boards:", error);
      }
    };

    refreshBoards();
  }, [token]);

  const handleCreateBoard = async () => {
    if (!newBoardName.trim() || !user) return;

    setIsCreating(true);

    try {
      const newBoard = await boardsApi.createBoard({
        name: newBoardName.trim(),
      });
      setNewBoardName("");
      setIsCreateDialogOpen(false);

      setBoards((prev) => [
        ...prev,
        {
          id: newBoard.id,
          name: newBoard.name,
          description: newBoard.description ?? null,
          scrumMaster: true,
        },
      ]);

      await refreshUser();

      router.push(`/board/${newBoard.id}`);
    } catch (error) {
      console.error("Erro ao criar board:", error);
      alert("Falha ao criar board. Por favor, tente novamente.");
    } finally {
      setIsCreating(false);
    }
  };

  const handleSelectBoard = (boardId: string) => {
    router.push(`/board/${boardId}`);
  };

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent motion-reduce:animate-[spin_1.5s_linear_infinite]" />
          <p className="mt-4 text-slate-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              Seleção de Boards
            </h2>
            <p className="text-sm text-slate-600">Bem-vindo, {user.name}</p>
          </div>
          <Button
            variant="outline"
            onClick={handleLogout}
            className="gap-2 bg-transparent"
          >
            <LogOut className="h-4 w-4" />
            Sair
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-6 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold text-slate-900 mb-2">
                Seus Boards
              </h1>
              <p className="text-slate-600">
                Selecione um board para visualizar ou crie um novo
              </p>
            </div>
            <Button
              onClick={() => setIsCreateDialogOpen(true)}
              size="lg"
              className="gap-2"
            >
              <Plus className="h-5 w-5" />
              Criar Board
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {boards.map((board) => (
              <Card
                key={board.id}
                className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => handleSelectBoard(board.id.toString())}
              >
                <CardHeader>
                  <CardTitle className="text-xl">{board.name}</CardTitle>
                  <CardDescription className="flex items-center gap-1 mt-2">
                    {board.scrumMaster ? (
                      <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                        Scrum Master
                      </span>
                    ) : (
                      <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded">
                        Membro
                      </span>
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  {board.description && (
                    <p className="text-sm text-slate-600">
                      {board.description}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {boards.length === 0 && (
            <div className="text-center py-12">
              <p className="text-slate-600 mb-4">
                Você ainda não é membro de nenhum board. Crie seu primeiro board
                para começar.
              </p>
              <Button
                onClick={() => setIsCreateDialogOpen(true)}
                size="lg"
                className="gap-2"
              >
                <Plus className="h-5 w-5" />
                Criar Seu Primeiro Board
              </Button>
            </div>
          )}
        </div>
      </div>

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Criar Novo Board</DialogTitle>
            <DialogDescription>
              Crie um novo board e torne-se seu Scrum Master. Você terá controle
              total sobre o gerenciamento do board.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="space-y-2">
              <Label htmlFor="board-name">Nome do Board</Label>
              <Input
                id="board-name"
                placeholder="ex: Desenvolvimento de Produto"
                value={newBoardName}
                onChange={(e) => setNewBoardName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !isCreating) {
                    handleCreateBoard();
                  }
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCreateDialogOpen(false)}
              disabled={isCreating}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleCreateBoard}
              disabled={!newBoardName.trim() || isCreating}
            >
              {isCreating ? "Criando..." : "Criar Board"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
