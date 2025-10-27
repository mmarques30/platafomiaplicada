import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { ProgressCard } from "@/components/shared/ProgressCard";
import { ConquistaCard } from "@/components/shared/ConquistaCard";
import { TrilhaEmAndamentoCard } from "@/components/evolucao/TrilhaEmAndamentoCard";
import { TrilhaConcluidaCard } from "@/components/evolucao/TrilhaConcluidaCard";
import { TrilhaDisponivelCard } from "@/components/evolucao/TrilhaDisponivelCard";
import {
  useProgressoGeral,
  useSequenciaEstudo,
  useTrilhasEmAndamento,
  useTrilhasConcluidas,
  useTrilhasDisponiveis,
} from "@/hooks/useEvolucao";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useState } from "react";

export default function Evolucao() {
  const navigate = useNavigate();
  const [filtroNivel, setFiltroNivel] = useState<string>("todos");
  const [mostrarTodasConcluidas, setMostrarTodasConcluidas] = useState(false);
  const [mostrarTodasDisponiveis, setMostrarTodasDisponiveis] = useState(false);

  const { data: progressoGeral, isLoading: loadingProgresso } = useProgressoGeral();
  const { data: sequencia, isLoading: loadingSequencia } = useSequenciaEstudo();
  const { data: trilhasEmAndamento, isLoading: loadingAndamento } = useTrilhasEmAndamento();
  const { data: trilhasConcluidas, isLoading: loadingConcluidas } = useTrilhasConcluidas();
  const { data: trilhasDisponiveis, isLoading: loadingDisponiveis } = useTrilhasDisponiveis();

  const isLoading =
    loadingProgresso ||
    loadingSequencia ||
    loadingAndamento ||
    loadingConcluidas ||
    loadingDisponiveis;

  const getMedalhaByTrilhas = (trilhasConcluidas: number): "bronze" | "prata" | "ouro" | undefined => {
    if (trilhasConcluidas >= 10) return "ouro";
    if (trilhasConcluidas >= 5) return "prata";
    if (trilhasConcluidas >= 1) return "bronze";
    return undefined;
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 space-y-6">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-40 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-64 w-full" />
          ))}
        </div>
      </div>
    );
  }

  const totalTrilhasConcluidas = progressoGeral?.trilhasConcluidas || 0;
  const medalhaAtual = getMedalhaByTrilhas(totalTrilhasConcluidas);

  const conquistasRecentes = [
    {
      titulo: "Primeiro Passo",
      descricao: "Completou sua primeira aula",
      desbloqueada: totalTrilhasConcluidas >= 1,
      medalha: totalTrilhasConcluidas >= 1 ? ("bronze" as const) : undefined,
    },
    {
      titulo: "Maratonista",
      descricao: `${sequencia || 0} dias consecutivos estudando`,
      desbloqueada: (sequencia || 0) >= 7,
      progresso: sequencia || 0,
      progressoNecessario: 7,
    },
    {
      titulo: "Especialista",
      descricao: "Concluiu 5 trilhas completas",
      desbloqueada: totalTrilhasConcluidas >= 5,
      medalha: totalTrilhasConcluidas >= 5 ? medalhaAtual : undefined,
      progresso: totalTrilhasConcluidas < 5 ? totalTrilhasConcluidas : undefined,
      progressoNecessario: totalTrilhasConcluidas < 5 ? 5 : undefined,
    },
    {
      titulo: "Colecionador de Trilhas",
      descricao: `${totalTrilhasConcluidas} trilha${totalTrilhasConcluidas !== 1 ? 's' : ''} concluída${totalTrilhasConcluidas !== 1 ? 's' : ''}`,
      desbloqueada: totalTrilhasConcluidas >= 1,
      medalha: medalhaAtual,
      progresso: totalTrilhasConcluidas < 10 ? totalTrilhasConcluidas : undefined,
      progressoNecessario: totalTrilhasConcluidas < 5 ? 5 : totalTrilhasConcluidas < 10 ? 10 : undefined,
    },
  ];

  const conquistasDesbloqueadas = conquistasRecentes.filter((c) => c.desbloqueada);

  const trilhasFiltradas =
    filtroNivel === "todos"
      ? trilhasDisponiveis
      : trilhasDisponiveis?.filter(
          (t) => t.nivel.toLowerCase() === filtroNivel.toLowerCase()
        );

  const trilhasConcluidasData = trilhasConcluidas;

  const trilhasDisponiveisExibidas = mostrarTodasDisponiveis
    ? trilhasFiltradas
    : trilhasFiltradas?.slice(0, 10);

  const trilhasConcluidasExibidas = mostrarTodasConcluidas
    ? trilhasConcluidasData
    : trilhasConcluidasData?.slice(0, 4);

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Minha Evolução</h1>
        <p className="text-muted-foreground">
          Acompanhe seu progresso, conquistas e certificados
        </p>
      </div>

      {/* Progresso Geral */}
      {progressoGeral && (
        <ProgressCard
          totalTrilhas={progressoGeral.totalTrilhas}
          trilhasConcluidas={progressoGeral.trilhasConcluidas}
          percentualConclusao={progressoGeral.percentualConclusao}
          tempoTotal={progressoGeral.tempoTotal}
          sequencia={sequencia || 0}
          totalCertificados={progressoGeral.totalCertificados}
        />
      )}

      {/* Conquistas Recentes */}
      {conquistasDesbloqueadas.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">
              Conquistas Recentes
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/evolucao/conquistas")}
            >
              Ver todas
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {conquistasDesbloqueadas.slice(0, 3).map((conquista, index) => (
              <ConquistaCard key={index} {...conquista} />
            ))}
          </div>
        </div>
      )}

      {/* Trilhas Em Andamento */}
      {trilhasEmAndamento && trilhasEmAndamento.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">
            Em Andamento ({trilhasEmAndamento.length})
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {trilhasEmAndamento.map((trilha) => (
              <TrilhaEmAndamentoCard key={trilha.id} {...trilha} />
            ))}
          </div>
        </div>
      )}

      {/* Trilhas Concluídas */}
      {trilhasConcluidasData && trilhasConcluidasData.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">
              Concluídas ({trilhasConcluidasData.length})
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/evolucao/certificados")}
            >
              Ver certificados
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {trilhasConcluidasExibidas?.map((trilha) => (
              <TrilhaConcluidaCard key={trilha.id} {...trilha} />
            ))}
          </div>
          {trilhasConcluidasData.length > 4 && !mostrarTodasConcluidas && (
            <div className="text-center">
              <Button
                variant="outline"
                onClick={() => setMostrarTodasConcluidas(true)}
              >
                Ver todas as {trilhasConcluidasData.length} trilhas concluídas
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Trilhas Disponíveis */}
      {trilhasDisponiveis && trilhasDisponiveis.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">
            Disponíveis ({trilhasDisponiveis.length})
          </h2>

          <Tabs value={filtroNivel} onValueChange={setFiltroNivel}>
            <TabsList>
              <TabsTrigger value="todos">Todas</TabsTrigger>
              <TabsTrigger value="iniciante">Iniciante</TabsTrigger>
              <TabsTrigger value="intermediario">Intermediário</TabsTrigger>
              <TabsTrigger value="avancado">Avançado</TabsTrigger>
            </TabsList>

            <TabsContent value={filtroNivel} className="mt-6">
              {trilhasFiltradas && trilhasFiltradas.length > 0 ? (
                <>
                  <div className="flex flex-col gap-3">
                    {trilhasDisponiveisExibidas?.map((trilha) => (
                      <TrilhaDisponivelCard key={trilha.id} {...trilha} />
                    ))}
                  </div>
                  
                  {trilhasFiltradas && trilhasFiltradas.length > 10 && !mostrarTodasDisponiveis && (
                    <div className="text-center mt-6">
                      <Button 
                        variant="outline" 
                        onClick={() => setMostrarTodasDisponiveis(true)}
                      >
                        Ver todas as {trilhasFiltradas.length} trilhas disponíveis
                      </Button>
                    </div>
                  )}
                </>
              ) : (
                <Alert>
                  <AlertDescription>
                    Nenhuma trilha disponível neste nível.
                  </AlertDescription>
                </Alert>
              )}
            </TabsContent>
          </Tabs>
        </div>
      )}

      {/* Estado vazio */}
      {!trilhasEmAndamento?.length &&
        !trilhasConcluidasData?.length &&
        !trilhasDisponiveis?.length && (
          <Alert>
            <AlertDescription>
              Nenhuma trilha encontrada. Entre em contato com o administrador.
            </AlertDescription>
          </Alert>
        )}
    </div>
  );
}
