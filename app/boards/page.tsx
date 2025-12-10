"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { boardsApi } from "@/lib/api";
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

interface Board {
  id: number;
  name: string;
  description: string | null;
  scrumMaster: boolean;
}

export default function BoardsPage() {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newBoardName, setNewBoardName] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  // Get boards from user.teams
  const userBoards = user?.teams || [];

  const handleCreateBoard = async () => {
    if (!newBoardName.trim() || !user) return;

    setIsCreating(true);

    try {
      const newBoard = await boardsApi.createBoard({
        name: newBoardName.trim(),
      });
      setNewBoardName("");
      setIsCreateDialogOpen(false);
      router.push(`/board/${newBoard.id}`);
    } catch (error) {
      console.error("Error creating board:", error);
      alert("Failed to create board. Please try again.");
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
          <p className="mt-4 text-slate-600">Loading...</p>
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
              Board Selection
            </h2>
            <p className="text-sm text-slate-600">Welcome, {user.name}</p>
          </div>
          <Button
            variant="outline"
            onClick={handleLogout}
            className="gap-2 bg-transparent"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-6 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold text-slate-900 mb-2">
                Your Boards
              </h1>
              <p className="text-slate-600">
                Select a board to view or create a new one
              </p>
            </div>
            <Button
              onClick={() => setIsCreateDialogOpen(true)}
              size="lg"
              className="gap-2"
            >
              <Plus className="h-5 w-5" />
              Create Board
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {userBoards.map((board) => (
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

          {userBoards.length === 0 && (
            <div className="text-center py-12">
              <p className="text-slate-600 mb-4">
                You're not a member of any boards yet. Create your first board
                to get started.
              </p>
              <Button
                onClick={() => setIsCreateDialogOpen(true)}
                size="lg"
                className="gap-2"
              >
                <Plus className="h-5 w-5" />
                Create Your First Board
              </Button>
            </div>
          )}
        </div>
      </div>

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Board</DialogTitle>
            <DialogDescription>
              Create a new board and become its Scrum Master. You'll have full
              control over board management.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="space-y-2">
              <Label htmlFor="board-name">Board Name</Label>
              <Input
                id="board-name"
                placeholder="e.g., Product Development"
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
              Cancel
            </Button>
            <Button
              onClick={handleCreateBoard}
              disabled={!newBoardName.trim() || isCreating}
            >
              {isCreating ? "Creating..." : "Create Board"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
