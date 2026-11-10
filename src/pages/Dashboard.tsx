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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useUserRole } from "@/hooks/useUserRole";
import { useUserProfile } from "@/hooks/useUserProfile";
import { PageSkeleton } from "@/components/shared/PageSkeleton";
import { PageContainer } from "@/components/shared/PageContainer";
import { BriefingSemanal } from "@/components/dashboard/BriefingSemanal";
import { PainelRitmo } from "@/components/dashboard/PainelRitmo";

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
        <CentralConteudoGratuito />
        <RankingTickerGratuito />
      </PageContainer>
    );
  }

  return (
    /* O respiro entre blocos era de 40px em tela grande, herdado do padrão
       das páginas de leitura. Num painel isso vira um dedo de vazio entre
       cada gráfico e empurra tudo para fora da primeira tela. Aqui ele cai
       para 24px, que é o mesmo das telas médias. */
    <PageContainer className="lg:space-y-6">
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

      {/* Os gráficos vêm logo depois da abertura: a pessoa chega, lê o
          cumprimento e os três números, e a próxima coisa que vê é o
          próprio ritmo desenhado. Antes disso só havia listas. */}
      <PainelRitmo />

      {/*
       * Coluna de trabalho e coluna de avisos.
       *
       * Até aqui o painel era uma pilha: seis blocos da largura da tela, um
       * embaixo do outro, todos com o mesmo peso. Em telas largas isso
       * esticava um cartão de agenda de 90px por 1400px de largura e obrigava
       * a rolar para atravessar coisas que caberiam lado a lado.
       *
       * Duas colunas já tinham sido tentadas antes e foram desfeitas por um
       * motivo real: quando um lado ficava vazio, sobrava um buraco do
       * tamanho da coluna. A correção não era voltar para a pilha, era fazer
       * a coluna desaparecer — `empty:hidden` some com a lateral quando os
       * três avisos dela se recusam a renderizar, e a coluna de trabalho
       * ocupa a largura inteira sem nada condicional aqui.
       *
       * No celular a lateral vem primeiro: é onde está o que tem data.
       */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:gap-5">
        <div className="flex min-w-0 flex-1 flex-col gap-4 empty:hidden">
          <ContinuarDeOndeParou />
          <SuasTrilhas />
        </div>

        <aside className="order-first flex w-full flex-col gap-4 empty:hidden lg:order-none lg:w-[348px] lg:shrink-0">
          <ProximoEncontro />
          <BriefingSemanal />
          <AcademyWelcomeCard />
        </aside>
      </div>

      <CentralConteudo />

      <RankingTicker />
      {novidadesSemana && <NovidadesSemana />}
    </PageContainer>
  );
}
