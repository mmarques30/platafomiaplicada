import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useFasesProcesso, FaseProcesso } from "@/hooks/useFasesProcesso";
import { FaseCard } from "./FaseCard";
import { FaseEditModal } from "./FaseEditModal";
import { RefreshCw, Calendar, CheckCircle2, TrendingUp } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface ProcessoRoadmapProps {
  userId: string;
}

export const ProcessoRoadmap = ({ userId }: ProcessoRoadmapProps) => {
  const { fases, isLoading, updateFase, inicializarFases, isUpdating } = useFasesProcesso(userId);
  const [editingFase, setEditingFase] = useState<FaseProcesso | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const handleEditFase = (fase: FaseProcesso) => {
    setEditingFase(fase);
    setModalOpen(true);
  };

  const handleUpdateFase = (data: Partial<FaseProcesso> & { id: string }) => {
    updateFase(data);
  };

  // Calcular estatísticas
  const fasesConcluidas = fases.filter((f) => f.status === "concluida").length;
  const progressoGeral = fases.length > 0 ? Math.round((fasesConcluidas / fases.length) * 100) : 0;
  const faseAtual = fases.find((f) => f.status === "em_andamento");
  const proximaFase = fases.find((f) => f.status === "pendente" && f.fase_numero > (faseAtual?.fase_numero || 0));

  // Calcular dias desde primeira sessão
  const primeiraFase = fases.find((f) => f.data_inicio);
  const diasMentoria = primeiraFase
    ? Math.floor((new Date().getTime() - new Date(primeiraFase.data_inicio!).getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-48 w-full" />
        ))}
      </div>
    );
  }

  if (fases.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Roadmap não inicializado</CardTitle>
          <CardDescription>
            Este mentorado ainda não possui um roadmap de processo. Clique no botão abaixo para criar.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => inicializarFases(userId)}>
            Inicializar Roadmap
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Estatísticas Gerais */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Visão Geral do Processo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Progresso Geral */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Progresso Geral</span>
                <span className="font-bold text-lg">{progressoGeral}%</span>
              </div>
              <Progress value={progressoGeral} className="h-3" />
              <p className="text-xs text-muted-foreground">
                {fasesConcluidas} de {fases.length} fases concluídas
              </p>
            </div>

            {/* Tempo de Mentoria */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <Calendar className="h-4 w-4" />
                Tempo de Mentoria
              </div>
              <p className="text-2xl font-bold">{diasMentoria} dias</p>
              <p className="text-xs text-muted-foreground">
                Desde a primeira sessão
              </p>
            </div>

            {/* Fase Atual */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <CheckCircle2 className="h-4 w-4" />
                Fase Atual
              </div>
              <p className="text-lg font-semibold">
                {faseAtual ? `${faseAtual.fase_numero}. ${faseAtual.nome_fase}` : "Nenhuma em andamento"}
              </p>
              <p className="text-xs text-muted-foreground">
                {faseAtual ? `${faseAtual.progresso_tarefas}% concluído` : ""}
              </p>
            </div>

            {/* Próximo Marco */}
            <div className="space-y-2">
              <div className="text-muted-foreground text-sm">Próximo Marco</div>
              <p className="text-lg font-semibold">
                {proximaFase ? `${proximaFase.fase_numero}. ${proximaFase.nome_fase}` : "Processo completo"}
              </p>
              <p className="text-xs text-muted-foreground">
                {proximaFase ? proximaFase.descricao : "Todas as fases concluídas"}
              </p>
            </div>
          </div>

          <div className="mt-4 flex justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.location.reload()}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Atualizar Dados
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Timeline de Fases */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Timeline do Processo</h3>
        <div className="relative space-y-4">
          {fases.map((fase) => (
            <FaseCard key={fase.id} fase={fase} onEdit={handleEditFase} />
          ))}
        </div>
      </div>

      {/* Modal de Edição */}
      <FaseEditModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        fase={editingFase}
        userId={userId}
        onSubmit={handleUpdateFase}
        isLoading={isUpdating}
      />
    </div>
  );
};
