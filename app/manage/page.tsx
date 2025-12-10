"use client";

import { AuthenticatedLayout } from "@/components/authenticated-layout";
import { Card } from "@/components/ui/card";
import { Users, AlertCircle, BarChart3 } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";

export default function ManagePage() {
  const { user } = useAuth();

  // Get boards where user is Scrum Master
  const managedBoards = user?.teams?.filter((team) => team.scrumMaster) || [];

  if (!managedBoards.length) {
    return (
      <AuthenticatedLayout>
        <div className="flex-1">
          <header className="border-b border-border bg-card">
            <div className="container mx-auto px-6 py-6">
              <h1 className="text-3xl font-bold text-foreground">Gerenciar</h1>
              <p className="text-muted-foreground mt-1">
                Ferramentas do scrum master e gerenciamento de equipe
              </p>
            </div>
          </header>

          <main className="container mx-auto px-6 py-8">
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">
                Você não gerencia nenhum board no momento. Crie um board ou
                solicite acesso de Scrum Master.
              </p>
            </div>
          </main>
        </div>
      </AuthenticatedLayout>
    );
  }

  return (
    <AuthenticatedLayout>
      <div className="flex-1">
        <header className="border-b border-border bg-card">
          <div className="container mx-auto px-6 py-6">
            <h1 className="text-3xl font-bold text-foreground">Gerenciar</h1>
            <p className="text-muted-foreground mt-1">
              Ferramentas do scrum master e gerenciamento de equipe
            </p>
          </div>
        </header>

        <main className="container mx-auto px-6 py-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              Selecione um Board para Gerenciar
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {managedBoards.map((board) => (
                <Link key={board.id} href={`/board/${board.id}/manage`}>
                  <Card className="p-6 hover:shadow-md transition-shadow cursor-pointer h-full">
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      {board.name}
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      {board.description || "Sem descrição"}
                    </p>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </main>
      </div>
    </AuthenticatedLayout>
  );
}
