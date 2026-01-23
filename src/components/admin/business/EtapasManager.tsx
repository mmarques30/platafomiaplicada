import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { 
  Plus, 
  Sparkles, 
  ChevronRight, 
  Calendar,
  Edit,
  Loader2,
  Trash2
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useNavigate } from "react-router-dom";
import { 
  useEtapasBusiness, 
  useCreateEtapa, 
  useUpdateEtapa,
  useInstrucoesEtapa,
  type EtapaBusiness 
} from "@/hooks/useEtapasBusiness";
import { useContratosBusiness } from "@/hooks/useContratosBusiness";
import { UploadTranscricaoModal } from "./UploadTranscricaoModal";
import { GerarEtapasIAModal } from "./GerarEtapasIAModal";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface EtapasManagerProps {
  contratoId?: string;
  userId?: string;
  userName?: string;
}

const statusConfig = {
  pendente: { label: "Pendente", className: "bg-zinc-500/10 text-zinc-600" },
  em_andamento: { label: "Em Andamento", className: "bg-amber-500/10 text-amber-600" },
  concluida: { label: "Concluída", className: "bg-emerald-500/10 text-emerald-600" },
};

function EtapaCard({ etapa, onEdit }: { etapa: EtapaBusiness; onEdit: () => void }) {
  const navigate = useNavigate();
  const { data: instrucoes } = useInstrucoesEtapa(etapa.id);
  const status = statusConfig[etapa.status] || statusConfig.pendente;

  const totalInstrucoes = instrucoes?.length || 0;
  const concluidas = instrucoes?.filter(i => i.status === 'concluida').length || 0;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-medium text-muted-foreground">
                Fase {etapa.numero_etapa}
              </span>
              <Badge variant="outline" className={cn("text-xs", status.className)}>
                {status.label}
              </Badge>
            </div>
            <h4 className="font-medium text-foreground truncate">{etapa.titulo}</h4>
            
            {etapa.data_prevista && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                <Calendar className="h-3 w-3" />
                {format(new Date(etapa.data_prevista), "dd/MM/yyyy", { locale: ptBR })}
              </div>
            )}

            {totalInstrucoes > 0 && (
              <p className="text-xs text-muted-foreground mt-2">
                {concluidas}/{totalInstrucoes} instruções concluídas
              </p>
            )}
          </div>

          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" onClick={onEdit}>
              <Edit className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => navigate(`/admin/mentoria/business/etapa/${etapa.id}`)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function NovaEtapaDialog({ 
  contratoId, 
  proximoNumero,
  onSuccess 
}: { 
  contratoId: string; 
  proximoNumero: number;
  onSuccess: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [titulo, setTitulo] = useState("");
  const [objetivo, setObjetivo] = useState("");
  const [dataPrevista, setDataPrevista] = useState("");
  const createEtapa = useCreateEtapa();

  const handleSubmit = async () => {
    if (!titulo.trim()) return;

    await createEtapa.mutateAsync({
      contrato_id: contratoId,
      numero_etapa: proximoNumero,
      titulo: titulo.trim(),
      objetivo: objetivo.trim() || null,
      data_prevista: dataPrevista || null,
      status: 'pendente',
      data_conclusao: null,
      marcos_proxima_etapa: null,
    });

    setTitulo("");
    setObjetivo("");
    setDataPrevista("");
    setOpen(false);
    onSuccess();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Nova Etapa
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nova Fase {proximoNumero}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Título</Label>
            <Input
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Ex: Arquitetura do Sistema"
            />
          </div>
          <div className="space-y-2">
            <Label>Objetivo</Label>
            <Textarea
              value={objetivo}
              onChange={(e) => setObjetivo(e.target.value)}
              placeholder="Descreva o objetivo principal desta etapa..."
            />
          </div>
          <div className="space-y-2">
            <Label>Data Prevista</Label>
            <Input
              type="date"
              value={dataPrevista}
              onChange={(e) => setDataPrevista(e.target.value)}
            />
          </div>
          <Button 
            onClick={handleSubmit} 
            disabled={!titulo.trim() || createEtapa.isPending}
            className="w-full"
          >
            {createEtapa.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Criar Etapa
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function EditEtapaDialog({ 
  etapa, 
  open, 
  onOpenChange,
  onSuccess 
}: { 
  etapa: EtapaBusiness;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}) {
  const [titulo, setTitulo] = useState(etapa.titulo);
  const [objetivo, setObjetivo] = useState(etapa.objetivo || "");
  const [dataPrevista, setDataPrevista] = useState(etapa.data_prevista || "");
  const [status, setStatus] = useState(etapa.status);
  const updateEtapa = useUpdateEtapa();

  const handleSubmit = async () => {
    await updateEtapa.mutateAsync({
      id: etapa.id,
      titulo: titulo.trim(),
      objetivo: objetivo.trim() || null,
      data_prevista: dataPrevista || null,
      status,
    });

    onOpenChange(false);
    onSuccess();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Fase {etapa.numero_etapa}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Título</Label>
            <Input
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Objetivo</Label>
            <Textarea
              value={objetivo}
              onChange={(e) => setObjetivo(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={status} onValueChange={(v: any) => setStatus(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pendente">Pendente</SelectItem>
                <SelectItem value="em_andamento">Em Andamento</SelectItem>
                <SelectItem value="concluida">Concluída</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Data Prevista</Label>
            <Input
              type="date"
              value={dataPrevista}
              onChange={(e) => setDataPrevista(e.target.value)}
            />
          </div>
          <Button 
            onClick={handleSubmit} 
            disabled={!titulo.trim() || updateEtapa.isPending}
            className="w-full"
          >
            {updateEtapa.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Salvar Alterações
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function EtapasManager({ contratoId: propContratoId, userId, userName }: EtapasManagerProps) {
  const queryClient = useQueryClient();
  // Buscar contrato se userId fornecido mas contratoId não
  const { contrato } = useContratosBusiness(userId);
  const contratoId = propContratoId || contrato?.id;
  
  const { data: etapas, isLoading, refetch } = useEtapasBusiness(contratoId);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [gerarIAModalOpen, setGerarIAModalOpen] = useState(false);
  const [editingEtapa, setEditingEtapa] = useState<EtapaBusiness | null>(null);
  const [isClearing, setIsClearing] = useState(false);

  const proximoNumero = (etapas?.length || 0) + 1;
  const hasEtapas = etapas && etapas.length > 0;

  const handleClearAll = async () => {
    if (!contratoId) return;
    setIsClearing(true);
    try {
      const { error } = await supabase
        .from("etapas_business")
        .delete()
        .eq("contrato_id", contratoId);
      
      if (error) throw error;
      
      queryClient.invalidateQueries({ queryKey: ["etapas-business", contratoId] });
      queryClient.invalidateQueries({ queryKey: ["instrucoes-etapa"] });
      toast.success("Todas as etapas foram removidas");
      refetch();
    } catch (error) {
      console.error("Erro ao limpar:", error);
      toast.error("Erro ao limpar etapas");
    } finally {
      setIsClearing(false);
    }
  };

  if (!contratoId) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-muted-foreground">Nenhum contrato Business encontrado para este usuário.</p>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-medium">Fases do Projeto</h3>
          {userName && (
            <p className="text-sm text-muted-foreground">{userName}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {hasEtapas && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                  <Trash2 className="h-4 w-4 mr-1" />
                  Limpar Tudo
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Limpar todas as etapas?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta ação irá remover permanentemente todas as etapas e suas instruções associadas. 
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
          {contrato && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setGerarIAModalOpen(true)}
            >
              <Sparkles className="h-4 w-4 mr-2" />
              {hasEtapas ? "Regenerar via IA" : "Gerar Roadmap via IA"}
            </Button>
          )}
          {hasEtapas && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setUploadModalOpen(true)}
            >
              Gerar Instruções
            </Button>
          )}
          <NovaEtapaDialog 
            contratoId={contratoId} 
            proximoNumero={proximoNumero}
            onSuccess={() => refetch()}
          />
        </div>
      </div>

      {etapas && etapas.length > 0 ? (
        <div className="space-y-2">
          {etapas.map(etapa => (
            <EtapaCard 
              key={etapa.id} 
              etapa={etapa}
              onEdit={() => setEditingEtapa(etapa)}
            />
          ))}
        </div>
      ) : (
        <Card className="border-dashed">
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground mb-4">
              Nenhuma etapa cadastrada para este contrato.
            </p>
            <NovaEtapaDialog 
              contratoId={contratoId} 
              proximoNumero={1}
              onSuccess={() => refetch()}
            />
          </CardContent>
        </Card>
      )}

      {etapas && (
        <UploadTranscricaoModal
          open={uploadModalOpen}
          onOpenChange={setUploadModalOpen}
          etapas={etapas}
          onSuccess={() => refetch()}
        />
      )}

      {contrato && (
        <GerarEtapasIAModal
          open={gerarIAModalOpen}
          onOpenChange={setGerarIAModalOpen}
          contrato={contrato}
          onSuccess={() => refetch()}
        />
      )}

      {editingEtapa && (
        <EditEtapaDialog
          etapa={editingEtapa}
          open={!!editingEtapa}
          onOpenChange={(open) => !open && setEditingEtapa(null)}
          onSuccess={() => refetch()}
        />
      )}
    </div>
  );
}
