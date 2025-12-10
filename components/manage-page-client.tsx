"use client"

import { AuthenticatedLayout } from "@/components/authenticated-layout"
import { Card } from "@/components/ui/card"
import { Users, BarChart3, AlertCircle } from "lucide-react"
import Link from "next/link"

export function ManagePageClient({ boardId }: { boardId: string }) {
  return (
    <AuthenticatedLayout boardId={boardId}>
      <div className="flex-1">
        <header className="border-b border-border bg-card">
          <div className="container mx-auto px-6 py-6">
            <h1 className="text-3xl font-bold text-foreground">Gerenciar</h1>
            <p className="text-muted-foreground mt-1">Ferramentas do scrum master e gerenciamento de equipe</p>
          </div>
        </header>

        <main className="container mx-auto px-6 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link href={`/board/${boardId}/team`}>
              <Card className="p-6 hover:shadow-md transition-shadow cursor-pointer h-full">
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-12 w-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">Membros da Equipe</h3>
                </div>
                <p className="text-muted-foreground text-sm">Gerenciar membros da equipe e permissões</p>
              </Card>
            </Link>

            <Link href={`/board/${boardId}/blockers`}>
              <Card className="p-6 hover:shadow-md transition-shadow cursor-pointer h-full">
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-12 w-12 rounded-lg bg-red-500/10 flex items-center justify-center">
                    <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">Relatório de Bloqueios</h3>
                </div>
                <p className="text-muted-foreground text-sm">Visualize todos os bloqueios em um período</p>
              </Card>
            </Link>

            <Link href={`/board/${boardId}/performance`}>
              <Card className="p-6 hover:shadow-md transition-shadow cursor-pointer h-full">
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-12 w-12 rounded-lg bg-green-500/10 flex items-center justify-center">
                    <BarChart3 className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">Desempenho</h3>
                </div>
                <p className="text-muted-foreground text-sm">Visualize o desempenho da equipe e métricas</p>
              </Card>
            </Link>
          </div>
        </main>
      </div>
    </AuthenticatedLayout>
  )
}
