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
      {/* Header com título padronizado */}
      <div className="space-y-1">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
          <span className="relative inline-block">
            Meu Processo
            <span className="absolute -bottom-1 left-0 w-full h-1 bg-gradient-to-r from-primary to-primary/30 rounded-full" />
          </span>{" "}
          <span className="text-muted-foreground font-medium">de Mentoria</span>
        </h2>
        <p className="text-sm text-muted-foreground">
          {fasesConcluidas}/{fases.length} fases concluídas • {diasMentoria} dias em mentoria
        </p>
      </div>

      {/* Timeline Visual - Rota com Pins */}
      <Card className="overflow-hidden">
        <CardContent className="p-6">
          {/* Barra de Progresso principal */}
          <div className="mb-4 flex items-center gap-4">
            <Progress value={progressoGeral} className="h-2 flex-1" />
            <span className="text-lg font-bold text-primary">{progressoGeral}%</span>
          </div>

          {/* Timeline horizontal */}
          <div className="relative py-8">
            {/* Linha de fundo - preta 0D0D0D */}
            <div className="absolute top-1/2 left-0 right-0 h-1 bg-[#0D0D0D] rounded-full -translate-y-1/2" />
            
            {/* Linha de progresso */}
            <div 
              className="absolute top-1/2 left-0 h-1.5 bg-primary rounded-full -translate-y-1/2 transition-all duration-500"
              style={{ width: `${progressoGeral}%` }}
            />

            {/* Pins das fases */}
            <div className="relative flex justify-between">
              {fases.map((fase, index) => {
                const isConcluida = fase.status === "concluida";
                const isAtual = fase.status === "em_andamento";
                const isPendente = fase.status === "pendente";
                
                return (
                  <div 
                    key={fase.id} 
                    className="flex flex-col items-center relative"
                    style={{ width: `${100 / fases.length}%` }}
                  >
                    {/* Pin com logo IAplicada */}
                    <div className={cn(
                      "relative z-10 flex items-center justify-center rounded-full border-2 transition-all duration-300",
                      isConcluida && "w-10 h-10 bg-[#0D0D0D] border-[#0D0D0D] shadow-lg",
                      isAtual && "w-12 h-12 bg-[#0D0D0D] border-primary shadow-xl shadow-primary/40 ring-2 ring-primary ring-offset-2 ring-offset-background",
                      isPendente && "w-8 h-8 bg-[#0D0D0D]/20 border-[#0D0D0D]/30"
                    )}>
                      <img 
                        src={logoSimbolo} 
                        alt="Pin" 
                        className={cn(
                          "object-contain",
                          isConcluida && "h-5 w-5 opacity-100",
                          isAtual && "h-6 w-6 opacity-100",
                          isPendente && "h-4 w-4 opacity-40 grayscale"
                        )}
                      />
                    </div>

                    {/* Número da fase */}
                    <span className={cn(
                      "mt-2 text-sm font-medium",
                      isConcluida && "text-green-600",
                      isAtual && "text-primary font-bold",
                      isPendente && "text-muted-foreground"
                    )}>
                      {fase.fase_numero}
                    </span>

                    {/* Indicador "Você está aqui" */}
                    {isAtual && (
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap">
                        <Badge className="bg-primary text-white shadow-lg animate-bounce">
                          Você está aqui
                        </Badge>
                      </div>
                    )}

                    {/* Bandeira de chegada na última fase */}
                    {index === fases.length - 1 && isConcluida && (
                      <Flag className="absolute -top-6 h-5 w-5 text-green-500" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Stats rápidas */}
          <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-500">{fasesConcluidas}</div>
              <div className="text-xs text-muted-foreground">Concluídas</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {faseAtual ? faseAtual.fase_numero : "-"}
              </div>
              <div className="text-xs text-muted-foreground">Fase Atual</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-muted-foreground">
                {fases.length - fasesConcluidas - (faseAtual ? 1 : 0)}
              </div>
              <div className="text-xs text-muted-foreground">Restantes</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cards de Fases - Detalhados */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-muted-foreground">
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
