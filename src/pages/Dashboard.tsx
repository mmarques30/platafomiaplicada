import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { AlertCircle, X } from "lucide-react";
import { Link } from "react-router-dom";
import { NovidadesSemana } from "@/components/dashboard/NovidadesSemana";
import { WelcomeHeader } from "@/components/dashboard/WelcomeHeader";
import { AcademyWelcomeCard } from "@/components/dashboard/AcademyWelcomeCard";
import { CentralConteudo } from "@/components/dashboard/CentralConteudo";
import { CentralConteudoGratuito } from "@/components/dashboard/CentralConteudoGratuito";
import { RankingTicker } from "@/components/dashboard/RankingTicker";
import { RankingTickerGratuito } from "@/components/dashboard/RankingTickerGratuito";
import { ContinuarDeOndeParou } from "@/components/dashboard/ContinuarDeOndeParou";
import { SuasTrilhas } from "@/components/dashboard/SuasTrilhas";
import { ProximoEncontro } from "@/components/dashboard/ProximoEncontro";
import { PerguntarMarIAna } from "@/components/dashboard/PerguntarMarIAna";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useUserRole } from "@/hooks/useUserRole";
import { useUserProfile } from "@/hooks/useUserProfile";
import { PWAInstallBanner } from "@/components/shared/PWAInstallBanner";
import { PageSkeleton } from "@/components/shared/PageSkeleton";
import { PageContainer } from "@/components/shared/PageContainer";
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

  if (isVisitante) {
    return (
      <PageContainer>
        <WelcomeHeader />
        <PWAInstallBanner />
        <CentralConteudoGratuito />
        <RankingTickerGratuito />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      {mostrarAvisoSenha && (
        <Alert className="border-primary/40 bg-primary/5">
          <AlertCircle className="h-4 w-4 text-primary" />
          <AlertDescription className="flex items-center justify-between">
            <div className="flex-1">
              <strong className="text-primary">Senha temporária detectada:</strong> Por segurança,
              recomendamos que você{" "}
              <Link
                to="/configuracoes"
                className="font-semibold text-primary underline transition-colors hover:text-primary/80"
              >
                altere sua senha em Configurações
              </Link>
              .
            </div>
            <Link to="/configuracoes">
              <Button variant="ghost" size="sm" className="ml-4">
                <X className="h-4 w-4" />
              </Button>
            </Link>
          </AlertDescription>
        </Alert>
      )}

      <WelcomeHeader />

      {/* Duas colunas a partir de lg: à esquerda o que a pessoa vai fazer
          agora, à direita o contexto (próximo encontro e MarIAna). Abaixo
          de lg tudo empilha na mesma ordem de prioridade. */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-6">
        <div className="flex flex-col gap-4 md:gap-6">
          <BriefingSemanal />
          <DashboardUrgencias />
          <AcademyWelcomeCard />
          <ContinuarDeOndeParou />
          <SuasTrilhas />
          <CentralConteudo />
        </div>

        <aside className="flex flex-col gap-4 md:gap-6">
          <ProximoEncontro />
          <PerguntarMarIAna />
        </aside>
      </div>

      <RankingTicker />
      {novidadesSemana && <NovidadesSemana />}
      <PWAInstallBanner />
    </PageContainer>
  );
}
