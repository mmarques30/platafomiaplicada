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

export default function Evolucao() {
  const { data: progressoGeral, isLoading: loadingProgresso } = useProgressoGeral();
  const { data: sequencia } = useSequenciaEstudo();
  const { data: certificados, isLoading: loadingCertificados } = useMeusCertificados();
  const { data: ranking, isLoading: loadingRanking } = useRankingComunidade();

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Evolução</h1>
        <p className="text-muted-foreground">
          Acompanhe sua evolução e a da comunidade
        </p>
      </div>

      {/* Sistema de Abas */}
      <Tabs defaultValue="minha-evolucao" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="minha-evolucao">
            Minha Evolução
          </TabsTrigger>
          <TabsTrigger value="comunidade">
            Evolução da Comunidade
          </TabsTrigger>
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
                          <h3 className="text-2xl font-bold">{sequencia} dias</h3>
                          <p className="text-muted-foreground">Sequência de estudos</p>
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
                <h2 className="text-2xl font-bold mb-4">Meus Certificados</h2>
                <div className="grid gap-4 md:grid-cols-2">
                  {certificados.map((cert) => (
                    <CertificadoCard
                      key={cert.id}
                      title={cert.titulo}
                      issueDate={cert.data_emissao || ""}
                      verificationCode={cert.codigo_verificacao || ""}
                      pdfUrl={cert.url_pdf}
                    />
                  ))}
                </div>
              </div>
            )
          )}

          {/* Conquistas */}
          <div>
            <h2 className="text-2xl font-bold mb-4">Conquistas</h2>
            <div className="grid gap-4 md:grid-cols-3">
              <ConquistaCard
                title="Primeira Trilha"
                description="Complete sua primeira trilha de aprendizado"
                icon="🎯"
                unlocked={progressoGeral ? progressoGeral.trilhasConcluidas > 0 : false}
              />
              <ConquistaCard
                title="Estudante Dedicado"
                description="Mantenha uma sequência de 7 dias de estudos"
                icon="🔥"
                unlocked={sequencia ? sequencia >= 7 : false}
              />
              <ConquistaCard
                title="Expert"
                description="Complete 5 trilhas de aprendizado"
                icon="🏆"
                unlocked={progressoGeral ? progressoGeral.trilhasConcluidas >= 5 : false}
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
      </Tabs>
    </div>
  );
}
