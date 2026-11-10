import { GradeTrilhas } from "@/components/trilhas/GradeTrilhas";
import { PainelCatalogo } from "@/components/trilhas/PainelCatalogo";
import { useUserRole } from "@/hooks/useUserRole";
import { Link } from "react-router-dom";
import { Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WelcomeHeader } from "@/components/dashboard/WelcomeHeader";
import { CentralConteudoGratuito } from "@/components/dashboard/CentralConteudoGratuito";
import { RankingTickerGratuito } from "@/components/dashboard/RankingTickerGratuito";
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
          <CentralConteudoGratuito />
          <RankingTickerGratuito />
        </div>
      ) : (
        <>
          {/* O título agora vive dentro do painel, junto do anel e dos
              números do catálogo. Era um cabeçalho solto, e a página era a
              única entrada do Academy que abria sem painel nenhum. */}
          <PainelCatalogo />
          <GradeTrilhas />
        </>
      )}
    </PageContainer>
  );
}
