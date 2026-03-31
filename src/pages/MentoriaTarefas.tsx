import { useState } from "react";
import { CheckSquare } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar, 
  AlertTriangle, 
  Clock, 
  FileText, 
  Upload, 
  ExternalLink, 
  CheckCircle2, 
  ArrowLeft,
  LayoutGrid,
  List,
  Eye
} from "lucide-react";
import { useMentoriaTarefas } from "@/hooks/useMentoriaTarefas";
import { format, differenceInDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { PageTitle } from "@/components/shared/PageTitle";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";

type ViewMode = "tabela" | "kanban";

export default function MentoriaTarefas() {
  const navigate = useNavigate();
  const { tarefas, isLoading, updateTarefa, uploadEntrega, isUploading } = useMentoriaTarefas();
  const [entregaFile, setEntregaFile] = useState<File | null>(null);
  const [linkExterno, setLinkExterno] = useState("");
  const [selectedTarefa, setSelectedTarefa] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("tabela");

  const tarefaSelecionada = tarefas.find(t => t.id === selectedTarefa);

  const handleOpenTarefa = (tarefaId: string) => {
    const tarefa = tarefas.find(t => t.id === tarefaId);
    setSelectedTarefa(tarefaId);
    setLinkExterno(tarefa?.link_externo || "");
    setEntregaFile(null);
  };

  const handleUpload = () => {
    if (entregaFile && tarefaSelecionada) {
      uploadEntrega({ file: entregaFile, tarefaId: tarefaSelecionada.id, userId: tarefaSelecionada.user_id });
      setEntregaFile(null);
    }
  };

  const handleSaveLink = () => {
    if (tarefaSelecionada) {
      updateTarefa({ id: tarefaSelecionada.id, link_externo: linkExterno });
    }
  };

  const handleConcluir = () => {
    if (tarefaSelecionada) {
      updateTarefa({ id: tarefaSelecionada.id, status: "concluida" });
      setSelectedTarefa(null);
    }
  };

  const handleMarcarEmAndamento = () => {
    if (tarefaSelecionada) {
      updateTarefa({ id: tarefaSelecionada.id, status: "em_andamento" });
    }
  };

  const getPrioridadeBadge = (prioridade: string) => {
    const variants: Record<string, { variant: any; icon: any }> = {
      critica: { variant: "destructive", icon: AlertTriangle },
      alta: { variant: "default", icon: AlertTriangle },
      media: { variant: "secondary", icon: Clock },
      baixa: { variant: "outline", icon: CheckCircle2 }
    };
    const config = variants[prioridade] || variants.media;
    const Icon = config.icon;
    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {prioridade?.toUpperCase()}
      </Badge>
    );
  };

  const getStatusBadge = (status: string) => {
    const map: Record<string, { status: string; label: string }> = {
      pendente: { status: "pendente", label: "Pendente" },
      em_andamento: { status: "em_andamento", label: "Em Andamento" },
      atrasada: { status: "atrasado", label: "Atrasada" },
      concluida: { status: "concluido", label: "Concluída" },
    };
    const config = map[status] || map.pendente;
    return <StatusBadge status={config.status} label={config.label} />;
  };

  const getDiasRestantes = (prazo: string) => {
    const dias = differenceInDays(new Date(prazo), new Date());
    if (dias < 0) return <span className="text-destructive font-semibold">Atrasada</span>;
    if (dias === 0) return <span className="text-warning font-semibold">Vence hoje</span>;
    if (dias === 1) return <span className="text-warning">Vence amanhã</span>;
    if (dias <= 7) return <span className="text-warning">Vence em {dias} dias</span>;
    return <span className="text-muted-foreground">Vence em {dias} dias</span>;
  };

  const pendentes = tarefas.filter(t => t.status === "pendente");
  const emAndamento = tarefas.filter(t => t.status === "em_andamento");
  const atrasadas = tarefas.filter(t => t.status === "atrasada");
  const concluidas = tarefas.filter(t => t.status === "concluida");
  const todasTarefas = tarefas;

  // Kanban Column Component
  const KanbanColumn = ({ 
    title, 
    tasks, 
    colorClass 
  }: { 
    title: string; 
    tasks: typeof tarefas; 
    colorClass: string;
  }) => (
    <div className="flex-1 min-w-[280px] max-w-[320px]">
      <div className={`rounded-t-lg p-3 ${colorClass}`}>
        <h3 className="font-semibold text-sm flex items-center gap-2">
          {title}
          <Badge variant="secondary" className="ml-auto">{tasks.length}</Badge>
        </h3>
      </div>
      <div className="bg-muted/30 rounded-b-lg p-2 min-h-[400px] space-y-2">
        {tasks.map(tarefa => (
          <Card 
            key={tarefa.id} 
            className="cursor-pointer hover:shadow-md transition-shadow card-interactive"
            onClick={() => handleOpenTarefa(tarefa.id)}
          >
            <CardContent className="p-3">
              <div className="flex items-center gap-2 mb-2">
                {getPrioridadeBadge(tarefa.prioridade)}
              </div>
              <h4 className="font-medium text-sm line-clamp-2">{tarefa.titulo}</h4>
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{tarefa.descricao}</p>
              <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                {format(new Date(tarefa.prazo_entrega), "dd/MM", { locale: ptBR })}
              </div>
            </CardContent>
          </Card>
        ))}
        {tasks.length === 0 && (
          <EmptyState icon={CheckSquare} title="Nenhuma tarefa ainda" description="As tarefas do seu projeto aparecerão aqui quando forem criadas." />
        )}
      </div>
    </div>
  );


  if (isLoading) return <div className="p-8">Carregando...</div>;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Button variant="ghost" onClick={() => navigate("/mentoria")} className="mb-6">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Voltar para Mentoria
      </Button>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <PageTitle primary="Minhas" secondary="Tarefas" />
          <p className="text-muted-foreground mt-2">Gerencie suas entregas e acompanhe seu progresso</p>
        </div>
        
        {/* Toggle de visualização */}
        <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-lg">
          <Button
            variant={viewMode === "tabela" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setViewMode("tabela")}
            className="gap-2"
          >
            <List className="h-4 w-4" />
            Tabela
          </Button>
          <Button
            variant={viewMode === "kanban" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setViewMode("kanban")}
            className="gap-2"
          >
            <LayoutGrid className="h-4 w-4" />
            Kanban
          </Button>
        </div>
      </div>

      {/* Cards de métricas - verde claro e altura reduzida */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="border-aplicada-green-300 bg-aplicada-green-100">
          <CardHeader className="pb-1 pt-3">
            <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
          </CardHeader>
          <CardContent className="pb-3">
            <div className="text-xl font-bold">{pendentes.length}</div>
          </CardContent>
        </Card>
        <Card className="border-aplicada-green-300 bg-aplicada-green-100">
          <CardHeader className="pb-1 pt-3">
            <CardTitle className="text-sm font-medium">Em Andamento</CardTitle>
          </CardHeader>
          <CardContent className="pb-3">
            <div className="text-xl font-bold">{emAndamento.length}</div>
          </CardContent>
        </Card>
        <Card className="border-destructive/30 bg-destructive/10">
          <CardHeader className="pb-1 pt-3">
            <CardTitle className="text-sm font-medium text-destructive">Atrasadas</CardTitle>
          </CardHeader>
          <CardContent className="pb-3">
            <div className="text-xl font-bold text-destructive">{atrasadas.length}</div>
          </CardContent>
        </Card>
        <Card className="border-aplicada-green-300 bg-aplicada-green-100">
          <CardHeader className="pb-1 pt-3">
            <CardTitle className="text-sm font-medium">Concluídas</CardTitle>
          </CardHeader>
          <CardContent className="pb-3">
            <div className="text-xl font-bold text-success">{concluidas.length}</div>
          </CardContent>
        </Card>
      </div>


      {/* Visualização Tabela */}
      {viewMode === "tabela" && (
        <Card className="border-border/50">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tarefa</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Prioridade</TableHead>
                  <TableHead>Prazo</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {todasTarefas.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      Nenhuma tarefa encontrada
                    </TableCell>
                  </TableRow>
                ) : (
                  todasTarefas.map((tarefa) => (
                    <TableRow 
                      key={tarefa.id} 
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleOpenTarefa(tarefa.id)}
                    >
                      <TableCell>
                        <div>
                          <p className="font-medium">{tarefa.titulo}</p>
                          <p className="text-xs text-muted-foreground line-clamp-1">{tarefa.descricao}</p>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(tarefa.status)}</TableCell>
                      <TableCell>{getPrioridadeBadge(tarefa.prioridade)}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-sm">{format(new Date(tarefa.prazo_entrega), "dd/MM/yyyy", { locale: ptBR })}</span>
                          <span className="text-xs">{getDiasRestantes(tarefa.prazo_entrega)}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" variant="ghost">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Visualização Kanban */}
      {viewMode === "kanban" && (
        <ScrollArea className="w-full">
          <div className="flex gap-4 pb-4 min-w-max">
            <KanbanColumn 
              title="Pendentes" 
              tasks={pendentes}
              colorClass="bg-muted"
            />
            <KanbanColumn 
              title="Em Andamento" 
              tasks={emAndamento}
              colorClass="bg-aplicada-green-200"
            />
            <KanbanColumn 
              title="Atrasadas" 
              tasks={atrasadas}
              colorClass="bg-destructive/20"
            />
            <KanbanColumn 
              title="Concluídas" 
              tasks={concluidas}
              colorClass="bg-aplicada-green-100"
            />
          </div>
        </ScrollArea>
      )}

      {/* Modal de Detalhes e Edição */}
      <Dialog open={!!selectedTarefa} onOpenChange={(open) => !open && setSelectedTarefa(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="pr-8">{tarefaSelecionada?.titulo}</DialogTitle>
          </DialogHeader>
          
          {tarefaSelecionada && (
            <div className="space-y-4">
              {/* Status e Prioridade */}
              <div className="flex flex-wrap gap-2">
                {getStatusBadge(tarefaSelecionada.status)}
                {getPrioridadeBadge(tarefaSelecionada.prioridade)}
                <Badge variant="outline">{tarefaSelecionada.tipo}</Badge>
              </div>

              {/* Descrição */}
              <div>
                <Label className="text-muted-foreground text-xs">Descrição</Label>
                <p className="text-sm mt-1">{tarefaSelecionada.descricao}</p>
              </div>

              {/* Prazo */}
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>Prazo: {format(new Date(tarefaSelecionada.prazo_entrega), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}</span>
                <span className="ml-2">{getDiasRestantes(tarefaSelecionada.prazo_entrega)}</span>
              </div>

              {/* Link existente */}
              {tarefaSelecionada.link_externo && (
                <div>
                  <Label className="text-muted-foreground text-xs">Link anexado</Label>
                  <a 
                    href={tarefaSelecionada.link_externo} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-sm text-primary flex items-center gap-1 hover:underline mt-1"
                  >
                    <ExternalLink className="h-3 w-3" />
                    {tarefaSelecionada.link_externo}
                  </a>
                </div>
              )}

              {/* Arquivo existente */}
              {tarefaSelecionada.arquivo_entrega_url && (
                <div>
                  <Label className="text-muted-foreground text-xs">Arquivo anexado</Label>
                  <a 
                    href={tarefaSelecionada.arquivo_entrega_url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-sm text-primary flex items-center gap-1 hover:underline mt-1"
                  >
                    <FileText className="h-3 w-3" />
                    Ver arquivo
                  </a>
                </div>
              )}

              {/* Feedback do mentor */}
              {tarefaSelecionada.feedback_mentor && (
                <div className="p-3 bg-muted rounded-lg">
                  <Label className="text-xs font-semibold">Feedback do Mentor</Label>
                  <p className="text-sm mt-1">{tarefaSelecionada.feedback_mentor}</p>
                  {tarefaSelecionada.avaliacao_mentor && (
                    <p className="text-sm mt-1 text-muted-foreground">
                      Avaliação: {tarefaSelecionada.avaliacao_mentor}/5
                    </p>
                  )}
                </div>
              )}

              {/* Área de edição (apenas se não concluída) */}
              {tarefaSelecionada.status !== "concluida" && (
                <div className="space-y-4 border-t pt-4">
                  <h4 className="font-semibold text-sm">Entregar Tarefa</h4>
                  
                  {/* Link externo */}
                  <div>
                    <Label>Link Externo</Label>
                    <div className="flex gap-2 mt-1">
                      <Input
                        type="url"
                        placeholder="https://..."
                        value={linkExterno}
                        onChange={(e) => setLinkExterno(e.target.value)}
                      />
                      <Button 
                        onClick={handleSaveLink}
                        disabled={!linkExterno}
                        size="sm"
                      >
                        Salvar
                      </Button>
                    </div>
                  </div>

                  {/* Upload de arquivo */}
                  <div>
                    <Label>Anexar Arquivo</Label>
                    <div className="flex gap-2 mt-1">
                      <Input
                        type="file"
                        onChange={(e) => setEntregaFile(e.target.files?.[0] || null)}
                        className="flex-1"
                      />
                      <Button 
                        onClick={handleUpload}
                        disabled={!entregaFile || isUploading}
                        size="sm"
                      >
                        <Upload className="h-4 w-4 mr-1" />
                        {isUploading ? "Enviando..." : "Enviar"}
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            {tarefaSelecionada?.status !== "concluida" && (
              <>
                {tarefaSelecionada?.status === "pendente" && (
                  <Button variant="outline" onClick={handleMarcarEmAndamento}>
                    <Clock className="h-4 w-4 mr-2" />
                    Marcar Em Andamento
                  </Button>
                )}
                <Button onClick={handleConcluir}>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Marcar Concluída
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
