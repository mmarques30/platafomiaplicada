import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useFasesProcesso, FaseProcesso } from "@/hooks/useFasesProcesso";
import { FaseCard } from "./FaseCard";
import { FaseEditModal } from "./FaseEditModal";
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
          <CardTitle>Visão Geral do Processo</CardTitle>
          <Separator className="mt-2" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1: Progresso */}
            <div className="text-center p-6 bg-muted/30 rounded-lg space-y-3">
              <div className="text-4xl font-bold">{progressoGeral}%</div>
              <Progress value={progressoGeral} className="h-2" />
              <p className="text-sm text-muted-foreground">
                {fasesConcluidas}/{fases.length} fases concluídas
              </p>
            </div>

            {/* Card 2: Tempo */}
            <div className="text-center p-6 bg-muted/30 rounded-lg space-y-3">
              <div className="text-4xl font-bold">{diasMentoria}</div>
              <p className="text-sm text-muted-foreground">
                {diasMentoria === 1 ? "dia" : "dias"} em mentoria
              </p>
            </div>

            {/* Card 3: Próxima Fase */}
            <div className="text-center p-6 bg-muted/30 rounded-lg space-y-3">
              <div className="text-2xl font-semibold">
                {proximaFase ? `Fase ${proximaFase.fase_numero}` : "Completo ✓"}
              </div>
              <p className="text-sm text-muted-foreground truncate px-2">
                {proximaFase?.nome_fase || "Processo finalizado"}
              </p>
              {proximaFase && (
                <Badge variant="outline" className="mt-2">Próxima</Badge>
              )}
            </div>
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
