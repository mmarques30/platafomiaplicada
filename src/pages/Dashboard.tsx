import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle, X } from "lucide-react";
import { Link } from "react-router-dom";
import { NovidadesSemana } from "@/components/dashboard/NovidadesSemana";
import { WelcomeHeader } from "@/components/dashboard/WelcomeHeader";
import { AcademyWelcomeCard } from "@/components/dashboard/AcademyWelcomeCard";
import { PendenciasOnboarding } from "@/components/dashboard/PendenciasOnboarding";
import { CentralConteudo } from "@/components/dashboard/CentralConteudo";
import { CentralConteudoGratuito } from "@/components/dashboard/CentralConteudoGratuito";
import { RankingTicker } from "@/components/dashboard/RankingTicker";
import { RankingTickerGratuito } from "@/components/dashboard/RankingTickerGratuito";
import { DashboardTour } from "@/components/dashboard/DashboardTour";
import { WeeklyProgressCard } from "@/components/dashboard/WeeklyProgressCard";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useUserRole } from "@/hooks/useUserRole";
import { useUserProfile } from "@/hooks/useUserProfile";
import { PWAInstallBanner } from "@/components/shared/PWAInstallBanner";
import { PageSkeleton } from "@/components/shared/PageSkeleton";
import { DashboardUrgencias } from "@/components/dashboard/DashboardUrgencias";
import { BriefingSemanal } from "@/components/dashboard/BriefingSemanal";


export default function Dashboard() {
  const { isVisitante, isLoading: loadingRole } = useUserRole();
  const { profile, isLoading: loadingProfile } = useUserProfile();

  const mostrarAvisoSenha = useMemo(() => {
    if (loadingRole || loadingProfile) return false;
    if (isVisitante) return false;
    return profile?.senha_temporaria === true || profile?.primeiro_acesso === true;
  }, [loadingRole, loadingProfile, isVisitante, profile]);

  const showTour = useMemo(() => {
    if (loadingProfile) return false;
    if (isVisitante) return false;
    return profile?.primeiro_acesso === true && sessionStorage.getItem('onboarding_video_visto') === 'true';
  }, [loadingProfile, isVisitante, profile]);

  if (loadingRole) {
    return <PageSkeleton variant="dashboard" />;
  }

  return (
    <div className="min-h-screen bg-background pt-2">
      {/* Tour guiado no primeiro acesso */}
      {showTour && <DashboardTour run={showTour} />}

      <main className="container py-3 md:py-6 px-3 md:px-4 space-y-4 md:space-y-6 lg:space-y-8">
        {isVisitante ? (
          <div className="space-y-6">
            <WelcomeHeader />
            <PWAInstallBanner />
            <CentralConteudoGratuito />
            <RankingTickerGratuito />
          </div>
        ) : (
          <>
            {mostrarAvisoSenha && (
              <Alert className="border-2 border-primary bg-primary/5 shadow-md">
                <AlertCircle className="h-4 w-4 text-primary" />
                <AlertDescription className="flex items-center justify-between">
                  <div className="flex-1">
                    <strong className="text-primary">Senha temporária detectada:</strong> Por segurança, recomendamos que você{" "}
                    <Link 
                      to="/configuracoes" 
                      className="underline font-semibold text-primary hover:text-primary/80 transition-colors"
                    >
                      altere sua senha em Configurações
                    </Link>
                    .
                  </div>
                  <Link to="/configuracoes">
                    <Button variant="ghost" size="sm" className="ml-4 hover:bg-primary/10">
                      <X className="h-4 w-4" />
                    </Button>
                  </Link>
                </AlertDescription>
              </Alert>
            )}

            <section>
              <WelcomeHeader />
            </section>

            <BriefingSemanal />

            <DashboardUrgencias />

            <PWAInstallBanner />

            {/* Card de boas-vindas Academy no primeiro acesso */}
            <AcademyWelcomeCard />

            {/* Card semanal de progresso */}
            <WeeklyProgressCard />

            <PendenciasOnboarding />

            {/* Central de Conteúdo - target do tour */}
            <CentralConteudo />

            <RankingTicker />

            <section>
              <NovidadesSemana />
            </section>
          </>
        )}
      </main>
    </div>
  );
}
