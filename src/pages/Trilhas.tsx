import { TodasAsTrilhas } from "@/components/dashboard/TodasAsTrilhas";
import { useUserRole } from "@/hooks/useUserRole";
import { Link } from "react-router-dom";
import { Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
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

          <Button asChild variant="brand-pill" size="pill-lg" className="w-full sm:w-auto">
            <Link to="/servicos">
              <Zap className="h-5 w-5" />
              Ter acesso ao Academy
            </Link>
          </Button>

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
