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
import { SectionHeader } from "@/components/dashboard/SectionHeader";


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
    <div className="min-h-screen bg-background">
      {/* Tour guiado no primeiro acesso */}
      {showTour && <DashboardTour run={showTour} />}

      <main className="mx-auto w-full max-w-[1600px] space-y-10 px-4 py-2 md:space-y-14 md:px-8 md:py-4 lg:px-12">
        {isVisitante ? (
          <div className="space-y-8">
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

            <WelcomeHeader />

            {/* 01 — PRA HOJE */}
            <section className="space-y-6">
              <SectionHeader
                index={1}
                eyebrow="Pra hoje"
                title={<>O que <em className="font-serif-italic text-primary">precisa rodar</em> agora.</>}
                description="Briefing da semana, alertas e atalhos pro que destrava primeiro."
              />
              <div className="space-y-4 md:space-y-6">
                <BriefingSemanal />
                <DashboardUrgencias />
                <PWAInstallBanner />
                <AcademyWelcomeCard />
                <WeeklyProgressCard />
                <PendenciasOnboarding />
              </div>
            </section>

            {/* 02 — APRENDER NA SEMANA */}
            <section className="space-y-6">
              <SectionHeader
                index={2}
                eyebrow="Central de conteúdo"
                title={<>Aplique a IA <em className="font-serif-italic text-primary">na sua rotina</em>.</>}
                description="Materiais, vídeos e templates pra destravar workflows hoje — não no próximo tri."
              />
              <CentralConteudo />
              <RankingTicker />
            </section>

            {/* 03 — NA COMUNIDADE */}
            <section className="space-y-6">
              <SectionHeader
                index={3}
                eyebrow="Na comunidade"
                title={<>O que <em className="font-serif-italic text-primary">rolou na semana</em>.</>}
              />
              <NovidadesSemana />
            </section>
          </>
        )}
      </main>
    </div>
  );
}
