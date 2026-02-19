import { UltimosConteudos } from "@/components/dashboard/UltimosConteudos";
import { TodasAsTrilhas } from "@/components/dashboard/TodasAsTrilhas";
import { useUserRole } from "@/hooks/useUserRole";
import { Link } from "react-router-dom";
import { Zap } from "lucide-react";
import { PWAInstallBanner } from "@/components/shared/PWAInstallBanner";
import { WelcomeHeader } from "@/components/dashboard/WelcomeHeader";
import { CentralConteudoGratuito } from "@/components/dashboard/CentralConteudoGratuito";
import { RankingTickerGratuito } from "@/components/dashboard/RankingTickerGratuito";
import { Skeleton } from "@/components/ui/skeleton";
import { PageTitle } from "@/components/shared/PageTitle";

export default function Trilhas() {
  const { isVisitante, isLoading: loadingRole } = useUserRole();

  const showLoading = loadingRole;

  return (
    <div className="min-h-screen bg-background">
      <main className="container py-4 md:py-6 px-4">
        {/* Visitante: Layout estilo Dashboard */}
        {isVisitante ? (
          <div className="space-y-6">
            {/* Header com saudação */}
            <WelcomeHeader />

            {/* Botão CTA abaixo do welcome */}
            <Link 
              to="/servicos"
              className="flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3 rounded-lg text-red-600 bg-red-50/50 hover:bg-red-100 dark:bg-red-950/20 dark:hover:bg-red-950/30 text-base font-medium transition-colors"
            >
              <Zap className="h-5 w-5" />
              Ter acesso ao Academy
            </Link>

            {/* Banner PWA */}
            <PWAInstallBanner />

            {/* Central de Conteúdo Gratuito */}
            <CentralConteudoGratuito />

            {/* Ticker de métricas */}
            <RankingTickerGratuito />
          </div>
        ) : (
          // Mentorado: comportamento original
          <>
            <div className="mb-6 md:mb-8">
              <PageTitle primary="Trilhas" secondary="de Aprendizado" />
            </div>
            
            {showLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-[400px] rounded-xl" />
                ))}
              </div>
            ) : (
              <UltimosConteudos />
            )}

            {/* Seção: Todas as Trilhas */}
            <div className="mt-10">
              <TodasAsTrilhas />
            </div>
          </>
        )}
      </main>
    </div>
  );
}
