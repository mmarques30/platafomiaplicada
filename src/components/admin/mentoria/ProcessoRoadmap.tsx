import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useFasesProcesso, FaseProcesso } from "@/hooks/useFasesProcesso";
import { FaseEditModal } from "./FaseEditModal";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle2, Circle, ChevronDown, ChevronRight, Calendar, Folder, ListTodo, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const logoSimbolo = "/logo-simbolo.png?v=10";

interface ProcessoRoadmapProps {
  userId: string;
  readonly?: boolean;
}

export const ProcessoRoadmap = ({ userId, readonly = false }: ProcessoRoadmapProps) => {
  const { fases, isLoading, updateFase, inicializarFases, isUpdating } = useFasesProcesso(userId);
  const [editingFase, setEditingFase] = useState<FaseProcesso | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [expandedFaseId, setExpandedFaseId] = useState<string | null>(null);

  const handleEditFase = (fase: FaseProcesso) => {
    setEditingFase(fase);
    setModalOpen(true);
  };

  const handleUpdateFase = (data: Partial<FaseProcesso> & { id: string }) => {
    updateFase(data);
  };

  const handleRowClick = (faseId: string) => {
    setExpandedFaseId(expandedFaseId === faseId ? null : faseId);
  };

  // Calcular estatísticas
  const fasesConcluidas = fases.filter((f) => f.status === "concluida").length;
  const progressoGeral = fases.length > 0 ? Math.round((fasesConcluidas / fases.length) * 100) : 0;
  const faseAtual = fases.find((f) => f.status === "em_andamento");

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-64 w-full" />
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
    <div className="space-y-4">
      {/* Header de Progresso - Compacto */}
      <div className="bg-[#E9EBC6]/20 border border-[#E9EBC6]/50 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-[#0D0D0D]/70">Progresso Geral</span>
          <span className="text-2xl font-bold text-[#0D0D0D]">{progressoGeral}%</span>
        </div>
        
        {/* Barra de Progresso */}
        <div className="w-full bg-[#0D0D0D]/10 rounded-full h-2.5 overflow-hidden mb-3">
          <div 
            className="h-full bg-[#0D0D0D] rounded-full transition-all duration-500"
            style={{ width: `${progressoGeral}%` }}
          />
        </div>
        
        {/* Stats inline */}
        <div className="flex items-center gap-4 text-sm flex-wrap">
          <span className="text-green-600 font-medium">{fasesConcluidas} concluídas</span>
          <span className="text-[#0D0D0D]/40">•</span>
          <span className="text-[#0D0D0D] font-medium">
            {faseAtual ? `Fase ${faseAtual.fase_numero} atual` : "Nenhuma em andamento"}
          </span>
          <span className="text-[#0D0D0D]/40">•</span>
          <span className="text-amber-600 font-medium">
            {fases.length - fasesConcluidas - (faseAtual ? 1 : 0)} restantes
          </span>
        </div>
      </div>

      {/* Tabela de Fases */}
      <div className="bg-[#E9EBC6]/15 border border-[#E9EBC6]/40 rounded-xl overflow-hidden">
        {/* Header da Tabela */}
        <div className="grid grid-cols-12 gap-2 px-4 py-3 bg-[#E9EBC6]/30 border-b text-sm font-medium text-[#0D0D0D]">
          <div className="col-span-1">#</div>
          <div className="col-span-3">Fase</div>
          <div className="col-span-5 hidden sm:block">Descrição</div>
          <div className="col-span-3 sm:col-span-2 text-right">Status</div>
          <div className="col-span-1 text-center"></div>
        </div>
        
        {/* Linhas da Tabela */}
        {fases.map((fase) => {
          const isConcluida = fase.status === "concluida";
          const isAtual = fase.status === "em_andamento";
          const isPendente = fase.status === "pendente" || fase.status === "bloqueada";
          const isExpanded = expandedFaseId === fase.id;
          
          return (
            <div key={fase.id} className="border-b last:border-b-0">
              {/* Linha principal */}
              <div 
                className={cn(
                  "grid grid-cols-12 gap-2 px-4 py-3 items-center text-sm transition-colors cursor-pointer hover:bg-[#E9EBC6]/10",
                  isAtual && "bg-[#E9EBC6]/20 border-l-4 border-l-[#0D0D0D]",
                  isConcluida && "bg-green-50/50"
                )}
                onClick={() => handleRowClick(fase.id)}
              >
                {/* Número */}
                <div className={cn(
                  "col-span-1 font-bold",
                  isConcluida && "text-green-600",
                  isAtual && "text-[#0D0D0D]",
                  isPendente && "text-[#0D0D0D]/40"
                )}>
                  {fase.fase_numero}
                </div>
                
                {/* Indicador + Nome */}
                <div className="col-span-3 flex items-center gap-2">
                  {isConcluida && <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />}
                  {isAtual && <div className="w-2 h-2 rounded-full bg-[#0D0D0D] animate-pulse shrink-0" />}
                  {isPendente && <Circle className="h-4 w-4 text-[#0D0D0D]/30 shrink-0" />}
                  
                  <span className={cn(
                    "font-medium truncate",
                    isConcluida && "text-green-700",
                    isAtual && "text-[#0D0D0D] font-semibold",
                    isPendente && "text-[#0D0D0D]/60"
                  )}>
                    {fase.nome_fase}
                  </span>
                </div>
                
                {/* Descrição */}
                <div className={cn(
                  "col-span-5 truncate hidden sm:block",
                  isConcluida && "text-green-600/70",
                  isAtual && "text-[#0D0D0D]/80",
                  isPendente && "text-[#0D0D0D]/40"
                )}>
                  {fase.descricao || "—"}
                </div>
                
                {/* Status Badge */}
                <div className="col-span-3 sm:col-span-2 flex justify-end">
                  <Badge 
                    variant="outline"
                    className={cn(
                      "text-xs",
                      isConcluida && "bg-green-600 text-white border-green-600",
                      isAtual && "bg-[#0D0D0D] text-white border-[#0D0D0D]",
                      isPendente && "border-[#0D0D0D]/30 text-[#0D0D0D]/60"
                    )}
                  >
                    {isConcluida ? "Concluída" : isAtual ? "Em Andamento" : "Pendente"}
                  </Badge>
                </div>

                {/* Expand indicator */}
                <div className="col-span-1 flex justify-center text-[#0D0D0D]/40">
                  {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </div>
              </div>

              {/* Detalhes expandidos */}
              {isExpanded && (
                <div className="px-4 py-4 bg-[#E9EBC6]/10 border-t border-[#E9EBC6]/30">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Datas */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm font-medium text-[#0D0D0D]/80">
                        <Calendar className="h-4 w-4" />
                        Datas
                      </div>
                      <div className="text-sm space-y-1 text-[#0D0D0D]/60">
                        <p>Início: {fase.data_inicio ? format(new Date(fase.data_inicio), "dd/MM/yyyy", { locale: ptBR }) : "—"}</p>
                        <p>Conclusão: {fase.data_conclusao ? format(new Date(fase.data_conclusao), "dd/MM/yyyy", { locale: ptBR }) : "—"}</p>
                      </div>
                    </div>

                    {/* Sessão */}
                    {fase.sessao && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm font-medium text-[#0D0D0D]/80">
                          <Calendar className="h-4 w-4" />
                          Sessão
                        </div>
                        <div className="text-sm space-y-1 text-[#0D0D0D]/60">
                          <p className="font-medium text-[#0D0D0D]/80">{fase.sessao.titulo}</p>
                          {fase.sessao.data_sessao && (
                            <p>{format(new Date(fase.sessao.data_sessao), "dd/MM/yyyy", { locale: ptBR })}</p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Projeto */}
                    {fase.projeto && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm font-medium text-[#0D0D0D]/80">
                          <Folder className="h-4 w-4" />
                          Projeto
                        </div>
                        <div className="text-sm space-y-1 text-[#0D0D0D]/60">
                          <p className="font-medium text-[#0D0D0D]/80">{fase.projeto.titulo}</p>
                          <p className="truncate">{fase.projeto.objetivo_projeto}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Tarefas */}
                  {fase.tarefas && fase.tarefas.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-[#E9EBC6]/30">
                      <div className="flex items-center gap-2 text-sm font-medium text-[#0D0D0D]/80 mb-2">
                        <ListTodo className="h-4 w-4" />
                        Tarefas ({fase.tarefas.filter(t => t.concluida).length}/{fase.tarefas.length})
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {fase.tarefas.slice(0, 4).map((tarefa) => (
                          <div 
                            key={tarefa.id} 
                            className={cn(
                              "text-sm px-2 py-1 rounded flex items-center gap-2",
                              tarefa.concluida ? "text-green-700 bg-green-50" : "text-[#0D0D0D]/60"
                            )}
                          >
                            {tarefa.concluida ? (
                              <CheckCircle2 className="h-3 w-3 text-green-600 shrink-0" />
                            ) : (
                              <Circle className="h-3 w-3 text-[#0D0D0D]/30 shrink-0" />
                            )}
                            <span className="truncate">{tarefa.titulo}</span>
                          </div>
                        ))}
                        {fase.tarefas.length > 4 && (
                          <div className="text-xs text-[#0D0D0D]/40">
                            +{fase.tarefas.length - 4} tarefas...
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Observações */}
                  {fase.observacoes && (
                    <div className="mt-4 pt-4 border-t border-[#E9EBC6]/30">
                      <p className="text-sm text-[#0D0D0D]/60">
                        <span className="font-medium">Observações:</span> {fase.observacoes}
                      </p>
                    </div>
                  )}

                  {/* Botão Editar */}
                  {!readonly && (
                    <div className="mt-4 pt-4 border-t border-[#E9EBC6]/30 flex justify-end">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditFase(fase);
                        }}
                        className="border-[#0D0D0D]/20 text-[#0D0D0D]/80 hover:bg-[#E9EBC6]/20"
                      >
                        <Pencil className="h-3 w-3 mr-1" />
                        Editar Fase
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
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
