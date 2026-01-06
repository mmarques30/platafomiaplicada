import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useFasesProcesso, FaseProcesso } from "@/hooks/useFasesProcesso";
import { FaseCard } from "./FaseCard";
import { FaseEditModal } from "./FaseEditModal";
import { Skeleton } from "@/components/ui/skeleton";
import { Flag } from "lucide-react";
import { cn } from "@/lib/utils";

const logoSimbolo = "/logo-simbolo.png?v=10";

interface ProcessoRoadmapProps {
  userId: string;
  readonly?: boolean;
}

export const ProcessoRoadmap = ({ userId, readonly = false }: ProcessoRoadmapProps) => {
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
  const faseAtualIndex = faseAtual ? fases.findIndex(f => f.id === faseAtual.id) : -1;

  // Calcular dias desde primeira sessão
  const primeiraFase = fases.find((f) => f.data_inicio);
  const diasMentoria = primeiraFase
    ? Math.floor((new Date().getTime() - new Date(primeiraFase.data_inicio!).getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-24 w-full" />
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-20 w-full" />
        ))}
      </div>
    );
  }

  if (fases.length === 0) {
    return (
      <Card className="border-dashed">
        <CardHeader className="text-center">
          <img src={logoSimbolo} alt="Logo" className="h-12 w-12 mx-auto opacity-50 mb-2" />
          <CardTitle className="text-lg">Roadmap não inicializado</CardTitle>
          <p className="text-sm text-muted-foreground">
            {readonly 
              ? "Seu roadmap de processo ainda não foi criado pelo mentor."
              : "Este mentorado ainda não possui um roadmap de processo."}
          </p>
        </CardHeader>
        {!readonly && (
          <CardContent className="text-center pb-6">
            <Button onClick={() => inicializarFases(userId)}>
              <img src={logoSimbolo} alt="Logo" className="h-4 w-4 mr-2" />
              Inicializar Roadmap
            </Button>
          </CardContent>
        )}
      </Card>
    );
  }

  return (
    <div className="space-y-6">

      {/* Timeline Visual - Card com Branding */}
      <Card className="overflow-hidden bg-[#E9EBC6] border-[#E9EBC6]/50">
        <CardContent className="p-6">
          {/* Barra de Progresso principal */}
          <div className="mb-6 flex items-center gap-4">
            <div className="flex-1 bg-[#0D0D0D]/20 rounded-full h-3 overflow-hidden">
              <div 
                className="h-full bg-[#0D0D0D] rounded-full transition-all duration-500"
                style={{ width: `${progressoGeral}%` }}
              />
            </div>
            <span className="text-lg font-bold text-[#0D0D0D]">{progressoGeral}%</span>
          </div>

          {/* Timeline horizontal */}
          <div className="relative py-6">
            {/* Linha de fundo */}
            <div className="absolute top-1/2 left-0 right-0 h-1 bg-[#0D0D0D]/20 rounded-full -translate-y-1/2" />
            
            {/* Linha de progresso */}
            <div 
              className="absolute top-1/2 left-0 h-1 bg-[#0D0D0D] rounded-full -translate-y-1/2 transition-all duration-500"
              style={{ width: `${progressoGeral}%` }}
            />

            {/* Pins das fases - Círculos numerados */}
            <div className="relative flex justify-between">
              {fases.map((fase, index) => {
                const isConcluida = fase.status === "concluida";
                const isAtual = fase.status === "em_andamento";
                
                return (
                  <div 
                    key={fase.id} 
                    className="flex flex-col items-center relative"
                    style={{ width: `${100 / fases.length}%` }}
                  >
                    {/* Círculo numerado */}
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all relative z-10",
                      isConcluida && "bg-green-600 text-white",
                      isAtual && "bg-[#0D0D0D] text-white ring-4 ring-[#0D0D0D]/30 scale-110",
                      !isConcluida && !isAtual && "bg-white/60 text-[#0D0D0D]/60 border-2 border-[#0D0D0D]/20"
                    )}>
                      {fase.fase_numero}
                    </div>

                    {/* Bandeira de chegada na última fase */}
                    {index === fases.length - 1 && isConcluida && (
                      <Flag className="absolute -top-4 h-5 w-5 text-green-600" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Stats rápidas - Cards brancos */}
          <div className="grid grid-cols-3 gap-3 mt-6">
            <div className="text-center bg-white/70 rounded-lg py-3 px-2">
              <div className="text-2xl font-bold text-green-600">{fasesConcluidas}</div>
              <div className="text-xs text-[#0D0D0D]/60 font-medium">Concluídas</div>
            </div>
            <div className="text-center bg-white/70 rounded-lg py-3 px-2">
              <div className="text-2xl font-bold text-[#0D0D0D]">
                {faseAtual ? faseAtual.fase_numero : "-"}
              </div>
              <div className="text-xs text-[#0D0D0D]/60 font-medium">Fase Atual</div>
            </div>
            <div className="text-center bg-white/70 rounded-lg py-3 px-2">
              <div className="text-2xl font-bold text-amber-600">
                {fases.length - fasesConcluidas - (faseAtual ? 1 : 0)}
              </div>
              <div className="text-xs text-[#0D0D0D]/60 font-medium">Restantes</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cards de Fases - Detalhados */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground">
          Detalhes das Fases
        </h3>
        <div className="space-y-3">
          {fases.map((fase) => (
            <FaseCard 
              key={fase.id} 
              fase={fase} 
              onEdit={readonly ? undefined : handleEditFase}
              readonly={readonly}
            />
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
