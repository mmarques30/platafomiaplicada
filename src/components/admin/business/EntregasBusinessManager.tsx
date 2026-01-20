import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Plus, Pencil, Trash2, ChevronDown, ChevronRight, Package, Clock, AlertCircle, CheckCircle2, FolderKanban } from "lucide-react";
import { useEntregasBusiness, EntregaBusiness, EntregaInput } from "@/hooks/useEntregasBusiness";

interface EntregasBusinessManagerProps {
  contratoId: string;
  userId: string;
  userName?: string;
}

const PRIORIDADE_CONFIG = {
  baixa: { label: "Baixa", variant: "outline" as const, color: "text-muted-foreground" },
  media: { label: "Média", variant: "secondary" as const, color: "text-blue-600" },
  alta: { label: "Alta", variant: "default" as const, color: "text-orange-600" },
  critica: { label: "Crítica", variant: "destructive" as const, color: "text-red-600" },
};

const STATUS_CONFIG = {
  pendente: { label: "Pendente", icon: Clock, color: "text-yellow-600" },
  em_andamento: { label: "Em Andamento", icon: AlertCircle, color: "text-blue-600" },
  concluida: { label: "Concluída", icon: CheckCircle2, color: "text-green-600" },
  cancelada: { label: "Cancelada", icon: AlertCircle, color: "text-muted-foreground" },
};

const TIPO_CONFIG = {
  ativa: { label: "Ativa", color: "bg-green-100 text-green-800" },
  backlog: { label: "Backlog", color: "bg-yellow-100 text-yellow-800" },
  futura: { label: "Futura", color: "bg-gray-100 text-gray-800" },
};

export function EntregasBusinessManager({ contratoId, userId, userName }: EntregasBusinessManagerProps) {
  const { entregas, entregasAtivas, entregasBacklog, isLoading, createEntrega, updateEntrega, deleteEntrega } = useEntregasBusiness(contratoId);
  
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEntrega, setEditingEntrega] = useState<EntregaBusiness | null>(null);
  const [ativasOpen, setAtivasOpen] = useState(true);
  const [backlogOpen, setBacklogOpen] = useState(true);

  const [formData, setFormData] = useState<Partial<EntregaInput>>({
    titulo: "",
    descricao: "",
    modulo_relacionado: "",
    tipo: "ativa",
    status: "pendente",
    prioridade: "media",
    prazo_previsto: "",
    tem_instrucoes: false,
    justificativa_backlog: "",
  });

  const handleOpenModal = (entrega?: EntregaBusiness) => {
    if (entrega) {
      setEditingEntrega(entrega);
      setFormData({
        titulo: entrega.titulo,
        descricao: entrega.descricao || "",
        modulo_relacionado: entrega.modulo_relacionado || "",
        tipo: entrega.tipo,
        status: entrega.status,
        prioridade: entrega.prioridade,
        prazo_previsto: entrega.prazo_previsto || "",
        tem_instrucoes: entrega.tem_instrucoes,
        justificativa_backlog: entrega.justificativa_backlog || "",
      });
    } else {
      setEditingEntrega(null);
      setFormData({
        titulo: "",
        descricao: "",
        modulo_relacionado: "",
        tipo: "ativa",
        status: "pendente",
        prioridade: "media",
        prazo_previsto: "",
        tem_instrucoes: false,
        justificativa_backlog: "",
      });
    }
    setModalOpen(true);
  };

  const handleSubmit = () => {
    if (!formData.titulo?.trim()) return;

    if (editingEntrega) {
      updateEntrega.mutate({ id: editingEntrega.id, ...formData });
    } else {
      createEntrega.mutate({ contrato_id: contratoId, ...formData } as EntregaInput);
    }
    setModalOpen(false);
  };

  const renderEntregaCard = (entrega: EntregaBusiness) => {
    const prioridade = PRIORIDADE_CONFIG[entrega.prioridade];
    const status = STATUS_CONFIG[entrega.status];
    const StatusIcon = status.icon;

    return (
      <Card key={entrega.id} className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <CardTitle className="text-base">{entrega.titulo}</CardTitle>
                <Badge variant={prioridade.variant} className="text-xs">
                  {prioridade.label}
                </Badge>
              </div>
              {entrega.modulo_relacionado && (
                <p className="text-xs text-muted-foreground">Módulo: {entrega.modulo_relacionado}</p>
              )}
            </div>
            <div className="flex items-center gap-1">
              <div className={`flex items-center gap-1 text-xs ${status.color}`}>
                <StatusIcon className="h-3.5 w-3.5" />
                {status.label}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {entrega.descricao && (
            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{entrega.descricao}</p>
          )}
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              {entrega.prazo_previsto && (
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {new Date(entrega.prazo_previsto).toLocaleDateString("pt-BR")}
                </span>
              )}
              {entrega.tem_instrucoes && (
                <Badge variant="outline" className="text-xs">
                  Com instruções
                </Badge>
              )}
            </div>
            
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleOpenModal(entrega)}>
                <Pencil className="h-3.5 w-3.5" />
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-7 w-7">
                    <Trash2 className="h-3.5 w-3.5 text-destructive" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Excluir Entrega</AlertDialogTitle>
                    <AlertDialogDescription>
                      Tem certeza que deseja excluir "{entrega.titulo}"? Esta ação não pode ser desfeita.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={() => deleteEntrega.mutate(entrega.id)}>
                      Excluir
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-muted-foreground">Carregando entregas...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <FolderKanban className="h-6 w-6" />
            Entregas de {userName}
          </h2>
          <p className="text-sm text-muted-foreground">
            Gerencie as entregas do projeto Business
          </p>
        </div>
        <Button onClick={() => handleOpenModal()}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Entrega
        </Button>
      </div>

      {/* Entregas Ativas */}
      <Collapsible open={ativasOpen} onOpenChange={setAtivasOpen}>
        <Card>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {ativasOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  <CardTitle className="text-lg">Entregas Ativas</CardTitle>
                  <Badge variant="secondary">{entregasAtivas.length}</Badge>
                </div>
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="pt-0">
              {entregasAtivas.length > 0 ? (
                <div className="grid gap-3">
                  {entregasAtivas.map(renderEntregaCard)}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-4">
                  Nenhuma entrega ativa cadastrada
                </p>
              )}
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Backlog / Futuras */}
      <Collapsible open={backlogOpen} onOpenChange={setBacklogOpen}>
        <Card>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {backlogOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  <CardTitle className="text-lg">Backlog / Futuras</CardTitle>
                  <Badge variant="outline">{entregasBacklog.length}</Badge>
                </div>
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="pt-0">
              {entregasBacklog.length > 0 ? (
                <div className="grid gap-3">
                  {entregasBacklog.map(renderEntregaCard)}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-4">
                  Nenhuma entrega no backlog
                </p>
              )}
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Modal Nova/Editar Entrega */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingEntrega ? "Editar Entrega" : "Nova Entrega"}</DialogTitle>
            <DialogDescription>
              {editingEntrega ? "Atualize os dados da entrega" : "Adicione uma nova entrega ao projeto"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Título *</label>
              <Input
                value={formData.titulo}
                onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                placeholder="Ex: CRM de Pacientes"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Descrição</label>
              <Textarea
                value={formData.descricao}
                onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                placeholder="Descreva a entrega..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Tipo</label>
                <Select
                  value={formData.tipo}
                  onValueChange={(v) => setFormData({ ...formData, tipo: v as EntregaInput["tipo"] })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ativa">Ativa</SelectItem>
                    <SelectItem value="backlog">Backlog</SelectItem>
                    <SelectItem value="futura">Futura</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">Prioridade</label>
                <Select
                  value={formData.prioridade}
                  onValueChange={(v) => setFormData({ ...formData, prioridade: v as EntregaInput["prioridade"] })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="baixa">Baixa</SelectItem>
                    <SelectItem value="media">Média</SelectItem>
                    <SelectItem value="alta">Alta</SelectItem>
                    <SelectItem value="critica">Crítica</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Status</label>
                <Select
                  value={formData.status}
                  onValueChange={(v) => setFormData({ ...formData, status: v as EntregaInput["status"] })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pendente">Pendente</SelectItem>
                    <SelectItem value="em_andamento">Em Andamento</SelectItem>
                    <SelectItem value="concluida">Concluída</SelectItem>
                    <SelectItem value="cancelada">Cancelada</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">Prazo Previsto</label>
                <Input
                  type="date"
                  value={formData.prazo_previsto}
                  onChange={(e) => setFormData({ ...formData, prazo_previsto: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Módulo Relacionado</label>
              <Input
                value={formData.modulo_relacionado}
                onChange={(e) => setFormData({ ...formData, modulo_relacionado: e.target.value })}
                placeholder="Ex: CRM, Dashboard, Financeiro..."
              />
            </div>

            {(formData.tipo === "backlog" || formData.tipo === "futura") && (
              <div>
                <label className="text-sm font-medium">Justificativa (Backlog/Futura)</label>
                <Textarea
                  value={formData.justificativa_backlog}
                  onChange={(e) => setFormData({ ...formData, justificativa_backlog: e.target.value })}
                  placeholder="Por que esta entrega está no backlog?"
                  rows={2}
                />
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit} disabled={!formData.titulo?.trim()}>
              {editingEntrega ? "Salvar" : "Criar Entrega"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
