import { UltimosConteudos } from "@/components/dashboard/UltimosConteudos";
import { Sparkles } from "lucide-react";

export default function TrilhasNovidades() {
  return (
    <div className="min-h-screen bg-background">
      <main className="container py-6 space-y-8">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Sparkles className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold text-foreground">Novidades do Mês</h1>
            <p className="text-muted-foreground mt-1">
              Últimos conteúdos adicionados nos últimos 15 dias, organizados por trilha
            </p>
          </div>
        </div>

        {/* Conteúdos - Filtrando apenas últimos 15 dias */}
        <UltimosConteudos apenasRecentes />
      </main>
    </div>
  );
}
