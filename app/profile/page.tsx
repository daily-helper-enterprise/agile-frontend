"use client";

import { AuthenticatedLayout } from "@/components/authenticated-layout";
import { useAuth } from "@/contexts/auth-context";
import { User, Mail, Calendar } from "lucide-react";
import { Card } from "@/components/ui/card";

export default function ProfilePage() {
  const { user } = useAuth();

  return (
    <AuthenticatedLayout>
      <div className="flex-1">
        <header className="border-b border-border bg-card">
          <div className="container mx-auto px-6 py-6">
            <h1 className="text-3xl font-bold text-foreground">Meu Perfil</h1>
            <p className="text-muted-foreground mt-1">
              Visualizar e gerenciar suas informações de perfil
            </p>
          </div>
        </header>

        <main className="container mx-auto px-6 py-8">
          <Card className="p-6 max-w-2xl">
            <div className="flex items-center gap-4 mb-6">
              <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-10 w-10 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground">
                  {user?.name}
                </h2>
                <p className="text-muted-foreground capitalize">
                  {user?.role.replace("-", " ")}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3 text-muted-foreground">
                <Mail className="h-5 w-5" />
                <span>{user?.email}</span>
              </div>
              <div className="flex items-center gap-3 text-muted-foreground">
                <Calendar className="h-5 w-5" />
                <span>Entrou em Janeiro de 2024</span>
              </div>
            </div>
          </Card>
        </main>
      </div>
    </AuthenticatedLayout>
  );
}
