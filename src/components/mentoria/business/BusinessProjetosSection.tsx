import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { 
  FolderKanban, 
  Plus, 
  ChevronDown, 
  ChevronRight,
  CheckCircle2,
  Circle,
  Clock,
  Calendar,
  Upload
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { AtividadeModal } from "./AtividadeModal";

interface Tarefa {
  id: string;
  titulo: string;
  descricao?: string;
  status: string;
  prazo_entrega?: string;
  arquivo_entrega_url?: string;
}

interface Projeto {
  id: string;
  titulo: string;
  descricao?: string;
  status: string;
  prazo_final?: string;
  prioridade?: number;
}

interface BusinessProjetosSectionProps {
  projetos: Projeto[];
  tarefas: Tarefa[];
  onCreateTarefa: (data: any) => void;
  onUpdateTarefa: (id: string, data: any) => void;
  onUploadEntrega: (tarefaId: string, file: File) => void;
  isCreating?: boolean;
  isUpdating?: boolean;
}

export function BusinessProjetosSection({ 
  projetos, 
  tarefas,
  onCreateTarefa,
  onUpdateTarefa,
  onUploadEntrega,
  isCreating,
  isUpdating
}: BusinessProjetosSectionProps) {
  const [openProjetos, setOpenProjetos] = useState<string[]>([projetos[0]?.id].filter(Boolean));
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProjetoId, setSelectedProjetoId] = useState<string | null>(null);

  const toggleProjeto = (projetoId: string) => {
    setOpenProjetos(prev => 
      prev.includes(projetoId) 
        ? prev.filter(id => id !== projetoId)
        : [...prev, projetoId]
    );
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'concluida':
        return <CheckCircle2 className="h-4 w-4 text-emerald-600" />;
      case 'em_andamento':
        return <Clock className="h-4 w-4 text-amber-600" />;
      default:
        return <Circle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; className: string }> = {
      'em_andamento': { label: 'Em andamento', className: 'bg-amber-500/10 text-amber-700 border-amber-500/30' },
      'concluido': { label: 'Concluído', className: 'bg-emerald-500/10 text-emerald-700 border-emerald-500/30' },
      'pendente': { label: 'Pendente', className: 'bg-muted text-muted-foreground border-border' },
      'pausado': { label: 'Pausado', className: 'bg-red-500/10 text-red-700 border-red-500/30' },
    };
    const config = statusMap[status] || statusMap['pendente'];
    return <Badge variant="outline" className={config.className}>{config.label}</Badge>;
  };

  const getTarefasByProjeto = (projetoId: string) => {
    return tarefas.filter(t => t.id.startsWith(projetoId.slice(0, 8)) || true); // Adjust based on real relation
  };

  const handleAddAtividade = (projetoId: string) => {
    setSelectedProjetoId(projetoId);
    setModalOpen(true);
  };

  const handleSaveAtividade = (data: any) => {
    onCreateTarefa({
      ...data,
      projeto_id: selectedProjetoId,
    });
    setModalOpen(false);
  };

  return (
    <>
      <Card className="border-border">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-foreground flex items-center gap-2 text-lg font-semibold">
              <FolderKanban className="h-5 w-5 text-aplicada-green-700" />
              Projetos em Andamento
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {projetos.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FolderKanban className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Nenhum projeto cadastrado ainda.</p>
              <p className="text-sm mt-1">Os projetos serão criados durante as sessões de mentoria.</p>
            </div>
          ) : (
            projetos.map((projeto) => {
              const projetoTarefas = getTarefasByProjeto(projeto.id);
              const isOpen = openProjetos.includes(projeto.id);
              
              return (
                <Collapsible 
                  key={projeto.id} 
                  open={isOpen}
                  onOpenChange={() => toggleProjeto(projeto.id)}
                >
                  <div className="rounded-xl border border-border bg-muted/30 overflow-hidden">
                    <CollapsibleTrigger className="w-full">
                      <div className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-3">
                          {isOpen ? (
                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                          )}
                          <div className="text-left">
                            <h4 className="font-medium text-foreground">{projeto.titulo}</h4>
                            {projeto.prazo_final && (
                              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                                <Calendar className="h-3 w-3" />
                                Prazo: {format(new Date(projeto.prazo_final), "dd/MM/yyyy", { locale: ptBR })}
                              </p>
                            )}
                          </div>
                        </div>
                        {getStatusBadge(projeto.status)}
                      </div>
                    </CollapsibleTrigger>
                    
                    <CollapsibleContent>
                      <div className="border-t border-border p-4 space-y-3">
                        {projeto.descricao && (
                          <p className="text-sm text-muted-foreground mb-4">{projeto.descricao}</p>
                        )}
                        
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm font-medium text-foreground">Atividades</span>
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => handleAddAtividade(projeto.id)}
                            className="h-7 text-xs text-aplicada-green-700 hover:text-aplicada-green-800 hover:bg-aplicada-green-700/10"
                          >
                            <Plus className="h-3.5 w-3.5 mr-1" />
                            Nova Atividade
                          </Button>
                        </div>
                        
                        {projetoTarefas.length === 0 ? (
                          <p className="text-sm text-muted-foreground text-center py-4">
                            Nenhuma atividade cadastrada
                          </p>
                        ) : (
                          <div className="space-y-2">
                            {projetoTarefas.slice(0, 5).map((tarefa) => (
                              <div 
                                key={tarefa.id}
                                className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors group"
                              >
                                <div className="flex items-center gap-3">
                                  <button 
                                    onClick={() => onUpdateTarefa(tarefa.id, { 
                                      status: tarefa.status === 'concluida' ? 'pendente' : 'concluida' 
                                    })}
                                    className="hover:scale-110 transition-transform"
                                    disabled={isUpdating}
                                  >
                                    {getStatusIcon(tarefa.status)}
                                  </button>
                                  <div>
                                    <span className={`text-sm ${tarefa.status === 'concluida' ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
                                      {tarefa.titulo}
                                    </span>
                                    {tarefa.prazo_entrega && (
                                      <p className="text-xs text-muted-foreground">
                                        Prazo: {format(new Date(tarefa.prazo_entrega), "dd/MM", { locale: ptBR })}
                                      </p>
                                    )}
                                  </div>
                                </div>
                                
                                {tarefa.arquivo_entrega_url ? (
                                  <Badge variant="outline" className="bg-emerald-500/10 text-emerald-700 border-emerald-500/30 text-xs">
                                    Entregue
                                  </Badge>
                                ) : (
                                  <label className="cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
                                    <input 
                                      type="file" 
                                      className="hidden" 
                                      onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) onUploadEntrega(tarefa.id, file);
                                      }}
                                    />
                                    <Upload className="h-4 w-4 text-muted-foreground hover:text-aplicada-green-700" />
                                  </label>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </CollapsibleContent>
                  </div>
                </Collapsible>
              );
            })
          )}
        </CardContent>
      </Card>

      <AtividadeModal 
        open={modalOpen}
        onOpenChange={setModalOpen}
        onSave={handleSaveAtividade}
        isLoading={isCreating}
      />
    </>
  );
}
