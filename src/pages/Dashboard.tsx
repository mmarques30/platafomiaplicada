import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
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

/**
 * Eyebrow simples pra cabeçalho de seção do Dashboard.
 * Usado em vez do SectionHeader numerado pra evitar a estética de "documento"
 * (numeração 01/02/03 + título grande serif funciona em LP, mas no app
 * polui sem agregar ação).
 */
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
      {children}
    </h2>
  );
}

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

  /* Espelha a query do NovidadesSemana — TanStack faz dedup pela mesma key.
     Esconde a section "Comunidade" quando não há novidade publicada. */
  const { data: novidadesSemana } = useQuery({
    queryKey: ["novidades-semana"],
    queryFn: async () => {
      const { data } = await supabase
        .from("avisos")
        .select("id")
        .eq("tipo", "novidades")
        .eq("ativo", true)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      return data;
    },
    enabled: !isVisitante,
  });

  if (loadingRole) {
    return <PageSkeleton variant="dashboard" />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Tour guiado no primeiro acesso */}
      {showTour && <DashboardTour run={showTour} />}

      <main className="w-full space-y-6 px-4 pb-10 md:space-y-8 md:px-6 md:pb-14 lg:px-8">
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

            <WelcomeHeader />

            {/* Grid 2 colunas em xl+: "Pra hoje" à esquerda, "Aprender na semana" à direita.
                Em telas menores empilha verticalmente. Corta ~40-50% da altura total
                em monitores wide e elimina scroll desnecessário. */}
            <div className="grid grid-cols-1 gap-6 xl:grid-cols-2 xl:gap-8">
              <section className="space-y-4">
                <SectionLabel>Pra hoje</SectionLabel>
                <div className="space-y-4">
                  <BriefingSemanal />
                  <DashboardUrgencias />
                  <PWAInstallBanner />
                  <AcademyWelcomeCard />
                  <WeeklyProgressCard />
                  <PendenciasOnboarding />
                </div>
              </section>

              <section className="space-y-4">
                <SectionLabel>Aprender na semana</SectionLabel>
                <CentralConteudo />
                <RankingTicker />
              </section>
            </div>

            {novidadesSemana && (
              <section className="space-y-4">
                <SectionLabel>Na comunidade</SectionLabel>
                <NovidadesSemana />
              </section>
            )}
          </>
        )}
      </main>
    </div>
  );
}
