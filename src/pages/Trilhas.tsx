import { TodasAsTrilhas } from "@/components/dashboard/TodasAsTrilhas";
import { useUserRole } from "@/hooks/useUserRole";
import { Link } from "react-router-dom";
import { Zap } from "lucide-react";
import { PWAInstallBanner } from "@/components/shared/PWAInstallBanner";
import { WelcomeHeader } from "@/components/dashboard/WelcomeHeader";
import { CentralConteudoGratuito } from "@/components/dashboard/CentralConteudoGratuito";
import { RankingTickerGratuito } from "@/components/dashboard/RankingTickerGratuito";
import { PageTitle } from "@/components/shared/PageTitle";
import { PageContainer } from "@/components/shared/PageContainer";
import { PageSkeleton } from "@/components/shared/PageSkeleton";

export default function Trilhas() {
  const { isVisitante, isLoading: loadingRole } = useUserRole();

  if (loadingRole) {
    return <PageSkeleton variant="trilhas" />;
  }

  return (
    <PageContainer>
      {isVisitante ? (
        <div className="space-y-6">
          <WelcomeHeader />

          <Link
            to="/servicos"
            className="flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3 rounded-lg text-red-600 bg-red-50/50 hover:bg-red-100 dark:bg-red-950/20 dark:hover:bg-red-950/30 text-base font-medium transition-colors"
          >
            <Zap className="h-5 w-5" />
            Ter acesso ao Academy
          </Link>

          <PWAInstallBanner />
          <CentralConteudoGratuito />
          <RankingTickerGratuito />
        </div>
      ) : (
        <>
          <PageTitle
            primary="Trilhas"
            secondary="de aprendizado"
            eyebrow="Academy"
            description="Aplica IA na rotina — uma trilha por workflow, semana a semana."
          />
          <TodasAsTrilhas />
        </>
      )}
    </PageContainer>
  );
}
