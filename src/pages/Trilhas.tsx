import { UltimosConteudos } from "@/components/dashboard/UltimosConteudos";
import { useUserRole } from "@/hooks/useUserRole";
import { Link } from "react-router-dom";
import { Zap } from "lucide-react";

export default function Trilhas() {
  const { isVisitante } = useUserRole();

  return (
    <div className="min-h-screen bg-background">
      <main className="container py-6">
        <div className="mb-8 flex justify-between items-start gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Trilhas de Aprendizado</h1>
            <p className="text-muted-foreground">
              Vídeos organizados por trilha
            </p>
          </div>
          
          {isVisitante && (
            <Link 
              to="/aplique"
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-red-600 bg-red-50/50 hover:bg-red-100 dark:bg-red-950/20 dark:hover:bg-red-950/30 font-medium transition-colors whitespace-nowrap"
            >
              <Zap className="h-4 w-4" />
              Ter acesso ao Academy
            </Link>
          )}
        </div>

        <div className="mt-8">
          <UltimosConteudos />
        </div>
      </main>
    </div>
  );
}
