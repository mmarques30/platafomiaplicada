import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Calendar, Target, Plus, Pencil, Trash2, Flag, User, Users } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import { 
  useEtapaById, 
  useInstrucoesEtapa, 
  useUpdateInstrucao,
  useDeleteInstrucao,
  useUpdateEtapa,
  type InstrucaoEtapa 
} from "@/hooks/useEtapasBusiness";
import { InstrucaoCard } from "@/components/mentoria/business/InstrucaoCard";
import { InstrucaoFormModal } from "@/components/admin/business/InstrucaoFormModal";
import { MarcosEditModal } from "@/components/admin/business/MarcosEditModal";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const statusConfig = {
  pendente: {
    label: "Pendente",
    className: "bg-zinc-500/10 text-zinc-600 border-zinc-500/30",
  },
  em_andamento: {
    label: "Em Andamento",
    className: "bg-amber-500/10 text-amber-600 border-amber-500/30",
  },
  concluida: {
    label: "Concluída",
    className: "bg-emerald-500/10 text-emerald-600 border-emerald-500/30",
  },
};

const responsavelConfig = {
  voce: { label: "Cliente", icon: User, color: "text-blue-600" },
  conjunto: { label: "Conjunto", icon: Users, color: "text-amber-600" },
};

export default function AdminEtapaBusinessPage() {
  const { etapaId } = useParams<{ etapaId: string }>();
  const navigate = useNavigate();
  
  const { data: etapa, isLoading: etapaLoading } = useEtapaById(etapaId);
  const { data: instrucoes = [], isLoading: instrucoesLoading } = useInstrucoesEtapa(etapaId);
  const updateInstrucao = useUpdateInstrucao();
  const deleteInstrucao = useDeleteInstrucao();
  const updateEtapa = useUpdateEtapa();

  const [instrucaoModalOpen, setInstrucaoModalOpen] = useState(false);
  const [editingInstrucao, setEditingInstrucao] = useState<InstrucaoEtapa | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [instrucaoToDelete, setInstrucaoToDelete] = useState<InstrucaoEtapa | null>(null);
  const [marcosModalOpen, setMarcosModalOpen] = useState(false);
  const [selectedResponsavel, setSelectedResponsavel] = useState<'voce' | 'conjunto'>('voce');

  const handleToggleStatus = (id: string, novoStatus: 'pendente' | 'concluida') => {
    updateInstrucao.mutate({ id, etapaId: etapaId!, status: novoStatus });
  };

  const handleEditInstrucao = (instrucao: InstrucaoEtapa) => {
    setEditingInstrucao(instrucao);
    setInstrucaoModalOpen(true);
  };

  const handleAddInstrucao = (responsavel: 'voce' | 'conjunto') => {
    setEditingInstrucao(null);
    setSelectedResponsavel(responsavel);
    setInstrucaoModalOpen(true);
  };

  const handleDeleteClick = (instrucao: InstrucaoEtapa) => {
    setInstrucaoToDelete(instrucao);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (instrucaoToDelete) {
      deleteInstrucao.mutate({ id: instrucaoToDelete.id, etapaId: etapaId! }, {
        onSuccess: () => {
          toast.success("Instrução excluída com sucesso");
          setDeleteDialogOpen(false);
          setInstrucaoToDelete(null);
        },
      });
    }
  };

  const instrucoesVoce = instrucoes.filter(i => i.responsavel === 'voce');
  const instrucoesConjunto = instrucoes.filter(i => i.responsavel === 'conjunto');

  const calcularProgresso = (lista: InstrucaoEtapa[]) => {
    if (lista.length === 0) return 0;
    const concluidas = lista.filter(i => i.status === 'concluida').length;
    return Math.round((concluidas / lista.length) * 100);
  };

  if (etapaLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-12 w-2/3" />
        <Skeleton className="h-24 w-full" />
        <div className="space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  if (!etapa) {
    return (
      <div className="container mx-auto p-6">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <div className="mt-8 text-center">
          <h1 className="text-xl font-semibold text-foreground">Etapa não encontrada</h1>
          <p className="text-muted-foreground mt-2">A etapa solicitada não existe ou foi removida.</p>
        </div>
      </div>
    );
  }

  const status = statusConfig[etapa.status as keyof typeof statusConfig] || statusConfig.pendente;

  const renderInstrucaoSection = (
    lista: InstrucaoEtapa[],
    responsavel: 'voce' | 'conjunto'
  ) => {
    const config = responsavelConfig[responsavel];
    const Icon = config.icon;
    const progresso = calcularProgresso(lista);
    const concluidas = lista.filter(i => i.status === 'concluida').length;

    return (
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <Icon className={`h-4 w-4 ${config.color}`} />
              {config.label}
              <span className="text-sm text-muted-foreground font-normal">
                — {concluidas}/{lista.length} concluídas ({progresso}%)
              </span>
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleAddInstrucao(responsavel)}
            >
              <Plus className="h-4 w-4 mr-1" />
              Adicionar
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {lista.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Nenhuma instrução cadastrada
            </p>
          ) : (
            lista.map((instrucao) => (
              <div key={instrucao.id} className="relative group">
                <InstrucaoCard
                  instrucao={instrucao}
                  onToggleStatus={handleToggleStatus}
                  isUpdating={updateInstrucao.isPending}
                />
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => handleEditInstrucao(instrucao)}
                  >
                    <Pencil className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-destructive hover:text-destructive"
                    onClick={() => handleDeleteClick(instrucao)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/admin/mentoria/business")}
          className="text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar para Business
        </Button>

        <div className="space-y-3">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-semibold text-foreground">
              Encontro {etapa.numero_etapa}: {etapa.titulo}
            </h1>
            <Badge variant="outline" className={status.className}>
              {status.label}
            </Badge>
          </div>

          {etapa.data_prevista && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>
                Data prevista: {format(new Date(etapa.data_prevista), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
              </span>
            </div>
          )}

          {etapa.objetivo && (
            <div className="flex items-start gap-2 p-4 bg-muted/30 rounded-lg border">
              <Target className="h-5 w-5 text-primary mt-0.5 shrink-0" />
              <div>
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Objetivo
                </span>
                <p className="text-foreground mt-1">{etapa.objetivo}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Instruções por responsável */}
      {instrucoesLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
        </div>
      ) : (
        <div className="space-y-4">
          {renderInstrucaoSection(instrucoesVoce, 'voce')}
          {renderInstrucaoSection(instrucoesConjunto, 'conjunto')}
        </div>
      )}

      {/* Marcos */}
      <Card className="border-dashed">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <Flag className="h-4 w-4 text-primary" />
              Marcos para o Próximo Encontro
            </CardTitle>
            <Button variant="outline" size="sm" onClick={() => setMarcosModalOpen(true)}>
              <Pencil className="h-4 w-4 mr-1" />
              Editar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {etapa.marcos_proxima_etapa && etapa.marcos_proxima_etapa.length > 0 ? (
            <ul className="space-y-2">
              {etapa.marcos_proxima_etapa.map((marco, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary mt-2 shrink-0" />
                  <span className="text-foreground">{marco}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              Nenhum marco definido
            </p>
          )}
        </CardContent>
      </Card>

      {/* Modals */}
      <InstrucaoFormModal
        open={instrucaoModalOpen}
        onOpenChange={setInstrucaoModalOpen}
        etapaId={etapaId!}
        instrucao={editingInstrucao}
        defaultResponsavel={selectedResponsavel}
      />

      <MarcosEditModal
        open={marcosModalOpen}
        onOpenChange={setMarcosModalOpen}
        etapaId={etapaId!}
        marcos={etapa.marcos_proxima_etapa || []}
      />

      {/* Delete confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir instrução</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir "{instrucaoToDelete?.titulo}"? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
