import { Sidebar } from "@/components/sidebar";
import { Card } from "@/components/ui/card";
import { Users, BarChart3, Settings } from "lucide-react";

export default function ManagePage() {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar userRole="scrum-master" />

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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-12 w-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">
                  Membros da Equipe
                </h3>
              </div>
              <p className="text-muted-foreground text-sm">
                Gerenciar membros da equipe e permissões
              </p>
            </Card>

            <Card className="p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-12 w-12 rounded-lg bg-green-500/10 flex items-center justify-center">
                  <BarChart3 className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">
                  Análises
                </h3>
              </div>
              <p className="text-muted-foreground text-sm">
                Ver desempenho da equipe e métricas
              </p>
            </Card>

            <Card className="p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-12 w-12 rounded-lg bg-purple-500/10 flex items-center justify-center">
                  <Settings className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">
                  Configurações
                </h3>
              </div>
              <p className="text-muted-foreground text-sm">
                Configurar ajustes do projeto e fluxos de trabalho
              </p>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
