import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { ProgressCard } from "@/components/shared/ProgressCard";
import { ConquistaCard } from "@/components/shared/ConquistaCard";
import { CertificadoCard } from "@/components/shared/CertificadoCard";
import { useProgressoGeral, useSequenciaEstudo } from "@/hooks/useEvolucao";
import { useMeusCertificados } from "@/hooks/useCertificados";
import { Flame } from "lucide-react";
import { RankingComunidade } from "@/components/evolucao/RankingComunidade";
import { EstatisticasEngajamento } from "@/components/evolucao/EstatisticasEngajamento";
import { MinhaEvolucaoDetalhada } from "@/components/evolucao/MinhaEvolucaoDetalhada";
import { TrilhasNovas } from "@/components/evolucao/TrilhasNovas";
import { ProgressoCertificados } from "@/components/evolucao/ProgressoCertificados";
import { FerramentasCompartilhadasList } from "@/components/evolucao/FerramentasCompartilhadasList";
import { useRankingComunidade } from "@/hooks/useRankingComunidade";
import { useUserPlan } from "@/hooks/useUserPlan";
import { AbaAcompanhamento } from "@/components/evolucao/AbaAcompanhamento";

export default function Evolucao() {
  const { data: progressoGeral, isLoading: loadingProgresso } = useProgressoGeral();
  const { data: sequencia } = useSequenciaEstudo();
  const { data: certificados, isLoading: loadingCertificados } = useMeusCertificados();
  const { data: ranking, isLoading: loadingRanking } = useRankingComunidade();
  const { plan } = useUserPlan();
  
  const showAcompanhamento = plan === 'academy';

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="space-y-3">
        <h1 className="text-4xl font-bold tracking-tight text-foreground">
          Minha <span className="text-primary">Evolução</span>
        </h1>
        <p className="text-lg text-muted-foreground font-medium">
          Acompanhe seu progresso e conquistas
        </p>
      </div>

      {/* Sistema de Abas */}
      <Tabs defaultValue="minha-evolucao" className="w-full">
        <TabsList className="w-full justify-start bg-muted/30 rounded-xl p-1 h-auto border-2 border-primary/10">
          <TabsTrigger 
            value="minha-evolucao"
            className="rounded-lg px-8 py-3 text-base font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all"
          >
            Minha Evolução
          </TabsTrigger>
          <TabsTrigger 
            value="comunidade"
            className="rounded-lg px-8 py-3 text-base font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all"
          >
            Evolução da Comunidade
          </TabsTrigger>
          {showAcompanhamento && (
            <TabsTrigger 
              value="acompanhamento"
              className="rounded-lg px-8 py-3 text-base font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all"
            >
              Meu Acompanhamento
            </TabsTrigger>
          )}
        </TabsList>

        {/* ABA 1: MINHA EVOLUÇÃO */}
        <TabsContent value="minha-evolucao" className="space-y-6 mt-6">
          {/* Progresso Geral */}
          {loadingProgresso ? (
            <Skeleton className="h-32 w-full" />
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {progressoGeral && (
                <>
                  <ProgressCard
                    totalTrilhas={progressoGeral.totalTrilhas}
                    trilhasConcluidas={progressoGeral.trilhasConcluidas}
                    percentualConclusao={progressoGeral.percentualConclusao}
                    tempoTotal={progressoGeral.tempoTotal}
                    sequencia={sequencia || 0}
                    totalCertificados={progressoGeral.totalCertificados}
                  />
                  {sequencia !== undefined && (
                    <div className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-500/20 rounded-lg p-6">
                      <div className="flex items-center gap-3">
                        <Flame className="h-8 w-8 text-orange-500" />
                        <div>
                          <h3 className="text-2xl font-sora-semibold text-foreground">{sequencia} dias</h3>
                          <p className="text-sm font-sora-light text-foreground">Sequência de estudos</p>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* Evolução Detalhada por Categorias */}
          <MinhaEvolucaoDetalhada />

          {/* Trilhas Novas Disponíveis */}
          <TrilhasNovas />

          {/* Progresso para Certificados */}
          <ProgressoCertificados />

          {/* Certificados */}
          {loadingCertificados ? (
            <Skeleton className="h-32 w-full" />
          ) : (
            certificados && certificados.length > 0 && (
              <div>
                <h2 className="text-2xl font-sora-medium mb-4 text-foreground">Meus Certificados</h2>
                <div className="grid gap-4 md:grid-cols-2">
                  {certificados.map((cert) => (
                    <CertificadoCard
                      key={cert.id}
                      trilhaTitulo={cert.titulo}
                      nomeCompleto="Usuário"
                      dataConclusao={cert.data_emissao || ""}
                      progresso={100}
                      certificadoUrl={cert.url_pdf}
                    />
                  ))}
                </div>
              </div>
            )
          )}

          {/* Conquistas */}
          <div>
            <h2 className="text-2xl font-sora-medium mb-4 text-foreground">Conquistas</h2>
            <div className="grid gap-4 md:grid-cols-3">
              <ConquistaCard
                titulo="Primeira Trilha"
                descricao="Complete sua primeira trilha de aprendizado"
                desbloqueada={progressoGeral ? progressoGeral.trilhasConcluidas > 0 : false}
              />
              <ConquistaCard
                titulo="Estudante Dedicado"
                descricao="Mantenha uma sequência de 7 dias de estudos"
                desbloqueada={sequencia ? sequencia >= 7 : false}
              />
              <ConquistaCard
                titulo="Expert"
                descricao="Complete 5 trilhas de aprendizado"
                desbloqueada={progressoGeral ? progressoGeral.trilhasConcluidas >= 5 : false}
              />
            </div>
          </div>
        </TabsContent>

        {/* ABA 2: EVOLUÇÃO DA COMUNIDADE */}
        <TabsContent value="comunidade" className="space-y-6 mt-6">
          {loadingRanking ? (
            <Skeleton className="h-96 w-full" />
          ) : (
            <>
              {/* Ranking Top 3 + Lista */}
              <RankingComunidade ranking={ranking as any || []} />

              {/* Estatísticas Gerais da Comunidade */}
              <EstatisticasEngajamento ranking={ranking || []} />

              {/* Ferramentas Mais Compartilhadas */}
              <FerramentasCompartilhadasList />
            </>
          )}
        </TabsContent>

        {/* ABA 3: MEU ACOMPANHAMENTO (Apenas Academy) */}
        {showAcompanhamento && (
          <TabsContent value="acompanhamento" className="space-y-6 mt-6">
            <AbaAcompanhamento />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
