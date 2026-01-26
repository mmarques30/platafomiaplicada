import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Plus, Pencil, Trash2, ChevronDown, ChevronRight, Clock, AlertCircle, CheckCircle2, FolderKanban, CalendarDays, Loader2 } from "lucide-react";
import { useEntregasBusiness, EntregaBusiness, EntregaInput } from "@/hooks/useEntregasBusiness";
import { useContratosBusiness } from "@/hooks/useContratosBusiness";
import { useEtapasBusiness } from "@/hooks/useEtapasBusiness";
import { useQueryClient } from "@tanstack/react-query";
import { DocumentosUploadSection } from "./DocumentosUploadSection";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface EntregasBusinessManagerProps {
  contratoId: string;
  userId: string;
  userName?: string;
}

const PRIORIDADE_CONFIG = {
  baixa: { label: "Baixa", variant: "outline" as const },
  media: { label: "Média", variant: "secondary" as const },
  alta: { label: "Alta", variant: "default" as const },
  critica: { label: "Crítica", variant: "destructive" as const },
};

const STATUS_CONFIG = {
  pendente: { label: "Pendente", icon: Clock, color: "text-amber-600" },
  em_andamento: { label: "Em Andamento", icon: AlertCircle, color: "text-blue-600" },
  concluida: { label: "Concluída", icon: CheckCircle2, color: "text-emerald-600" },
  cancelada: { label: "Cancelada", icon: AlertCircle, color: "text-muted-foreground" },
};

export function EntregasBusinessManager({ contratoId, userId, userName }: EntregasBusinessManagerProps) {
  const queryClient = useQueryClient();
  const { entregas, entregasAtivas, entregasBacklog, isLoading, createEntrega, updateEntrega, deleteEntrega } = useEntregasBusiness(contratoId);
  const { contrato } = useContratosBusiness(userId);
  const { data: etapas = [] } = useEtapasBusiness(contratoId);
  
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEntrega, setEditingEntrega] = useState<EntregaBusiness | null>(null);
  const [ativasOpen, setAtivasOpen] = useState(true);
  const [backlogOpen, setBacklogOpen] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  const [formData, setFormData] = useState<Partial<EntregaInput>>({
    titulo: "",
    descricao: "",
    modulo_relacionado: "",
    etapa_id: "",
    tipo: "ativa",
    status: "pendente",
    prioridade: "media",
    prazo_previsto: "",
    tem_instrucoes: false,
    justificativa_backlog: "",
  });

  const handleClearAll = async () => {
    setIsClearing(true);
    try {
      const { error } = await supabase
        .from("entregas_business")
        .delete()
        .eq("contrato_id", contratoId);
      
      if (error) throw error;
      
      queryClient.invalidateQueries({ queryKey: ["entregas-business", contratoId] });
      queryClient.invalidateQueries({ queryKey: ["instrucoes-etapa"] });
      toast.success("Todas as entregas foram removidas");
    } catch (error) {
      console.error("Erro ao limpar:", error);
      toast.error("Erro ao limpar entregas");
    } finally {
      setIsClearing(false);
    }
  };

  // Get modulos from contract
  const modulosSelecionados = (contrato as any)?.modulos_selecionados || [];
  
  // Helper to get etapa name by id
  const getEtapaNome = (etapaId?: string) => {
    if (!etapaId) return null;
    const etapa = etapas.find(e => e.id === etapaId);
    return etapa ? `Fase ${etapa.numero_etapa}: ${etapa.titulo}` : null;
  };

  const handleOpenModal = (entrega?: EntregaBusiness) => {
    if (entrega) {
      setEditingEntrega(entrega);
      setFormData({
        titulo: entrega.titulo,
        descricao: entrega.descricao || "",
        modulo_relacionado: entrega.modulo_relacionado || "",
        etapa_id: entrega.etapa_id || "",
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
        etapa_id: "",
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

  const handleEntregasGeradas = () => {
    queryClient.invalidateQueries({ queryKey: ["entregas-business", contratoId] });
  };

  const renderEntregaCard = (entrega: EntregaBusiness) => {
    const prioridade = PRIORIDADE_CONFIG[entrega.prioridade];
    const status = STATUS_CONFIG[entrega.status];
    const StatusIcon = status.icon;
    const etapaNome = getEtapaNome(entrega.etapa_id);

    return (
      <div 
        key={entrega.id} 
        className="p-3 rounded-xl border border-border/50 bg-card hover:shadow-sm transition-all"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5">
              <h4 className="font-medium text-sm truncate">
                {entrega.numero_entrega === -1 
                  ? "MVP. " 
                  : entrega.numero_entrega && entrega.numero_entrega > 0 
                    ? `${entrega.numero_entrega}. ` 
                    : ""
                }{entrega.titulo}
              </h4>
              <Badge variant={prioridade.variant} className="text-xs shrink-0">
                {prioridade.label}
              </Badge>
            </div>
            
            {etapaNome && (
              <p className="text-xs text-primary/80 mb-1 flex items-center gap-1">
                <CalendarDays className="h-3 w-3" />
                {etapaNome}
              </p>
            )}
            
            {entrega.modulo_relacionado && (
              <p className="text-xs text-muted-foreground mb-1">
                Módulo: {entrega.modulo_relacionado}
              </p>
            )}
            
            {entrega.descricao && (
              <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                {entrega.descricao}
              </p>
            )}
            
            <div className="flex flex-wrap items-center gap-2">
              <div className={`flex items-center gap-1 text-xs ${status.color}`}>
                <StatusIcon className="h-3 w-3" />
                {status.label}
              </div>
              
              {entrega.prazo_previsto && (
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {new Date(entrega.prazo_previsto).toLocaleDateString("pt-BR")}
                </span>
              )}
              
              {entrega.tem_instrucoes && (
                <Badge variant="outline" className="text-xs">
                  Instruções
                </Badge>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-0.5 shrink-0">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-7 w-7" 
              onClick={() => handleOpenModal(entrega)}
            >
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
      </div>
    );
  };

  if (isLoading) {
    return (
      <Card className="border-border/50 shadow-sm">
        <CardContent className="py-8 text-center">
          <p className="text-sm text-muted-foreground">Carregando entregas...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header compacto */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FolderKanban className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-lg font-semibold">Entregas</h2>
          <Badge variant="secondary" className="text-xs">
            {entregas.length} total
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          {entregas.length > 0 && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                  <Trash2 className="h-4 w-4 mr-1" />
                  Limpar Tudo
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Limpar todas as entregas?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta ação irá remover permanentemente todas as entregas e suas instruções associadas. 
                    Esta ação não pode ser desfeita.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={handleClearAll} disabled={isClearing} className="bg-destructive text-destructive-foreground">
                    {isClearing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                    Sim, limpar tudo
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
          <Button size="sm" onClick={() => handleOpenModal()}>
            <Plus className="h-4 w-4 mr-1" />
            Nova Entrega
          </Button>
        </div>
      </div>

      {/* Upload de Documentos com IA */}
      <DocumentosUploadSection 
        contratoId={contratoId}
        modulosContratados={modulosSelecionados}
        onEntregasGeradas={handleEntregasGeradas}
      />

      {/* Entregas Ativas */}
      <Collapsible open={ativasOpen} onOpenChange={setAtivasOpen}>
        <CollapsibleTrigger className="flex items-center gap-2 w-full p-3 bg-muted/30 rounded-xl hover:bg-muted/50 transition-colors">
          {ativasOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          <span className="font-medium text-sm">Entregas Ativas</span>
          <Badge variant="secondary" className="ml-auto text-xs">{entregasAtivas.length}</Badge>
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-3 space-y-2">
          {entregasAtivas.length > 0 ? (
            entregasAtivas.map(renderEntregaCard)
          ) : (
            <p className="text-center text-sm text-muted-foreground py-4">
              Nenhuma entrega ativa cadastrada
            </p>
          )}
        </CollapsibleContent>
      </Collapsible>

      {/* Backlog / Futuras */}
      <Collapsible open={backlogOpen} onOpenChange={setBacklogOpen}>
        <CollapsibleTrigger className="flex items-center gap-2 w-full p-3 bg-muted/30 rounded-xl hover:bg-muted/50 transition-colors">
          {backlogOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          <span className="font-medium text-sm">Backlog / Futuras</span>
          <Badge variant="outline" className="ml-auto text-xs">{entregasBacklog.length}</Badge>
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-3 space-y-2">
          {entregasBacklog.length > 0 ? (
            entregasBacklog.map(renderEntregaCard)
          ) : (
            <p className="text-center text-sm text-muted-foreground py-4">
              Nenhuma entrega no backlog
            </p>
          )}
        </CollapsibleContent>
      </Collapsible>

      {/* Modal Nova/Editar Entrega */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-base">{editingEntrega ? "Editar Entrega" : "Nova Entrega"}</DialogTitle>
            <DialogDescription className="text-sm">
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
                className="mt-1"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Descrição</label>
              <Textarea
                value={formData.descricao}
                onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                placeholder="Descreva a entrega..."
                rows={3}
                className="mt-1"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium">Tipo</label>
                <Select
                  value={formData.tipo}
                  onValueChange={(v) => setFormData({ ...formData, tipo: v as EntregaInput["tipo"] })}
                >
                  <SelectTrigger className="mt-1">
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
                  <SelectTrigger className="mt-1">
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

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium">Status</label>
                <Select
                  value={formData.status}
                  onValueChange={(v) => setFormData({ ...formData, status: v as EntregaInput["status"] })}
                >
                  <SelectTrigger className="mt-1">
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
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Fase Relacionada</label>
              <Select
                value={formData.etapa_id || "none"}
                onValueChange={(v) => setFormData({ ...formData, etapa_id: v === "none" ? "" : v })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Selecione uma etapa..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhuma etapa</SelectItem>
                  {etapas.map((etapa) => (
                    <SelectItem key={etapa.id} value={etapa.id}>
                      Encontro {etapa.numero_etapa}: {etapa.titulo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Módulo Relacionado</label>
              <Input
                value={formData.modulo_relacionado}
                onChange={(e) => setFormData({ ...formData, modulo_relacionado: e.target.value })}
                placeholder="Ex: CRM, Dashboard, Financeiro..."
                className="mt-1"
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
                  className="mt-1"
                />
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setModalOpen(false)}>
              Cancelar
            </Button>
            <Button size="sm" onClick={handleSubmit} disabled={!formData.titulo?.trim()}>
              {editingEntrega ? "Salvar" : "Criar Entrega"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
