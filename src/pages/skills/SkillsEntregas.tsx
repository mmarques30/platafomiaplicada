import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { CheckSquare, Clock, FileText, Send, CheckCircle2, AlertCircle, Play, Plus, Package, User, Calendar, FolderOpen } from "lucide-react";
import { useSkillsEntregas } from "@/hooks/useSkillsEntregas";
import { useEntregasEquipe, type EntregaEquipe } from "@/hooks/useEntregasEquipe";
import { EntregaEquipeModal } from "@/components/skills/EntregaEquipeModal";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { EntregaSkillsEditModal } from "@/components/skills/EntregaSkillsEditModal";

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  pendente: { label: "Pendente", color: "bg-slate-100 text-slate-700", icon: Clock },
  em_andamento: { label: "Em Andamento", color: "bg-blue-100 text-blue-700", icon: FileText },
  aguardando_validacao: { label: "Aguardando Validação", color: "bg-amber-100 text-amber-700", icon: Send },
  aprovada: { label: "Aprovada", color: "bg-green-100 text-green-700", icon: CheckCircle2 },
};

const STATUS_EQUIPE_CONFIG: Record<string, { label: string; color: string }> = {
  pendente: { label: "Pendente", color: "bg-yellow-500/10 text-yellow-700 border-yellow-500/30" },
  em_andamento: { label: "Em Andamento", color: "bg-blue-500/10 text-blue-700 border-blue-500/30" },
  concluido: { label: "Concluído", color: "bg-green-500/10 text-green-700 border-green-500/30" },
  bloqueado: { label: "Bloqueado", color: "bg-red-500/10 text-red-700 border-red-500/30" },
};

// Unified item type for display
interface UnifiedEntrega {
  id: string;
  titulo: string;
  descricao: string | null;
  status: string;
  prazo: string | null;
  origem: "ia" | "manual";
  responsavel?: { nome_completo: string; avatar_url?: string | null } | null;
  progresso?: number;
  prioridade?: string | null;
  raw: any;
}

export default function SkillsEntregas() {
  const { entregas: entregasIA, isLoading: loadingIA, isLider, equipeId, submeterEntrega, iniciarEntrega, atualizarEntrega } = useSkillsEntregas();
  const { entregas: entregasEquipe, isLoading: loadingEquipe, upsertMutation, uploadFile } = useEntregasEquipe(equipeId);

  const [tab, setTab] = useState("todas");
  const [modalEquipeOpen, setModalEquipeOpen] = useState(false);
  const [selectedEquipe, setSelectedEquipe] = useState<EntregaEquipe | null>(null);
  const [modalIAOpen, setModalIAOpen] = useState(false);
  const [selectedIA, setSelectedIA] = useState<any>(null);

  // Membros da equipe
  const { data: membros } = useQuery({
    queryKey: ["membros-equipe-skills", equipeId],
    queryFn: async () => {
      const { data } = await supabase
        .from("membros_equipe_skills")
        .select("user_id, profiles:user_id (nome_completo)")
        .eq("equipe_id", equipeId!)
        .eq("status", "ativo");
      return (data || []).map((m: any) => ({
        id: m.user_id,
        nome_completo: m.profiles?.nome_completo || "Sem nome",
      }));
    },
    enabled: !!equipeId,
  });

  // Projetos do backlog
  const { data: projetos } = useQuery({
    queryKey: ["projetos-backlog-skills", equipeId],
    queryFn: async () => {
      const { data } = await supabase
        .from("backlog_skills")
        .select("id, titulo")
        .eq("equipe_id", equipeId!)
        .neq("status", "descartado")
        .order("titulo");
      return (data || []) as { id: string; titulo: string }[];
    },
    enabled: !!equipeId,
  });

  const isLoading = loadingIA || loadingEquipe;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  // Unify both sources
  const unifiedIA: UnifiedEntrega[] = (entregasIA || []).map((e: any) => ({
    id: e.id,
    titulo: e.titulo,
    descricao: e.descricao,
    status: e.status,
    prazo: e.prazo,
    origem: "ia" as const,
    responsavel: e.responsavel,
    raw: e,
  }));

  const unifiedEquipe: UnifiedEntrega[] = (entregasEquipe || []).map((e) => ({
    id: e.id,
    titulo: e.titulo_equipe,
    descricao: e.descricao_equipe,
    status: e.status_equipe,
    prazo: e.prazo_equipe,
    origem: "manual" as const,
    responsavel: e.responsavel,
    progresso: e.progresso,
    prioridade: e.prioridade_equipe,
    raw: e,
  }));

  const allEntregas = [...unifiedIA, ...unifiedEquipe];

  const filterByTab = (items: UnifiedEntrega[]) => {
    if (tab === "ia") return items.filter(e => e.origem === "ia");
    if (tab === "manual") return items.filter(e => e.origem === "manual");
    return items;
  };

  const filtered = filterByTab(allEntregas);

  const pendentes = filtered.filter(e => e.status === "pendente" || e.status === "em_andamento");
  const aguardando = filtered.filter(e => e.status === "aguardando_validacao");
  const concluidas = filtered.filter(e => e.status === "aprovada" || e.status === "concluido");

  const handleClickEntrega = (item: UnifiedEntrega) => {
    if (item.origem === "manual") {
      setSelectedEquipe(item.raw);
      setModalEquipeOpen(true);
    } else {
      setSelectedIA(item.raw);
      setModalIAOpen(true);
    }
  };

  const handleSaveEquipe = (values: any) => {
    upsertMutation.mutate({ ...values, equipe_id: equipeId! }, {
      onSuccess: () => setModalEquipeOpen(false),
    });
  };

  const openNewEntrega = () => {
    setSelectedEquipe(null);
    setModalEquipeOpen(true);
  };

  return (
    <div className="container py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-primary/10">
            <CheckSquare className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {isLider ? "Entregas da Equipe" : "Minhas Entregas"}
            </h1>
            <p className="text-muted-foreground">
              {isLider ? "Visualize e gerencie todas as entregas" : "Tarefas atribuídas a você no projeto"}
            </p>
          </div>
        </div>
        <Button onClick={openNewEntrega} size="sm">
          <Plus className="h-4 w-4 mr-1" /> Nova Entrega
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{allEntregas.length}</p>
              </div>
              <Package className="h-8 w-8 text-muted-foreground/50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pendentes</p>
                <p className="text-2xl font-bold">{pendentes.length}</p>
              </div>
              <Clock className="h-8 w-8 text-muted-foreground/50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Aguardando</p>
                <p className="text-2xl font-bold">{aguardando.length}</p>
              </div>
              <Send className="h-8 w-8 text-muted-foreground/50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Concluídas</p>
                <p className="text-2xl font-bold">{concluidas.length}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-muted-foreground/50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-3">
        <span className="text-sm text-muted-foreground">Origem:</span>
        <div className="flex gap-1">
          {[
            { value: "todas", label: "Todas" },
            { value: "ia", label: "IA/Admin" },
            { value: "manual", label: "Manuais" },
          ].map(t => (
            <Button
              key={t.value}
              size="sm"
              variant={tab === t.value ? "default" : "outline"}
              onClick={() => setTab(t.value)}
            >
              {t.label}
            </Button>
          ))}
        </div>
        <span className="text-sm text-muted-foreground ml-2">{filtered.length} entrega(s)</span>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
            <p className="text-muted-foreground">Nenhuma entrega encontrada</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((item) => (
            <EntregaUnifiedCard
              key={`${item.origem}-${item.id}`}
              item={item}
              isLider={isLider}
              onClick={() => handleClickEntrega(item)}
              onIniciar={item.origem === "ia" && item.status === "pendente" ? () => iniciarEntrega.mutate(item.id) : undefined}
              onSubmeter={item.origem === "ia" && item.status === "em_andamento" ? () => submeterEntrega.mutate(item.id) : undefined}
            />
          ))}
        </div>
      )}

      {/* Modal for manual entregas */}
      <EntregaEquipeModal
        open={modalEquipeOpen}
        onOpenChange={setModalEquipeOpen}
        entrega={selectedEquipe}
        membros={membros || []}
        projetos={projetos || []}
        onSave={handleSaveEquipe}
        onUploadFile={(file) => uploadFile(file, equipeId!)}
        isSaving={upsertMutation.isPending}
      />

      {/* Modal for IA entregas (edit status) */}
      <EntregaSkillsEditModal
        open={modalIAOpen}
        onOpenChange={setModalIAOpen}
        entrega={selectedIA}
        onSave={(dados) => {
          if (selectedIA) {
            atualizarEntrega.mutate({ entregaId: selectedIA.id, dados }, {
              onSuccess: () => setModalIAOpen(false),
            });
          }
        }}
        isSaving={atualizarEntrega.isPending}
        isLider={isLider}
      />
    </div>
  );
}

// Card component for unified entregas
function EntregaUnifiedCard({ item, isLider, onClick, onIniciar, onSubmeter }: {
  item: UnifiedEntrega;
  isLider: boolean;
  onClick: () => void;
  onIniciar?: () => void;
  onSubmeter?: () => void;
}) {
  const isAtrasada = item.prazo && new Date(item.prazo) < new Date() && item.status !== "aprovada" && item.status !== "concluido";
  const statusConfig = item.origem === "ia"
    ? STATUS_CONFIG[item.status]
    : STATUS_EQUIPE_CONFIG[item.status];

  return (
    <Card
      className={`cursor-pointer hover:shadow-md transition-shadow ${isAtrasada ? "border-red-200" : ""}`}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h4 className="font-medium truncate">{item.titulo}</h4>
              <Badge variant="outline" className={statusConfig?.color || ""}>
                {statusConfig?.label || item.status}
              </Badge>
              <Badge variant="outline" className={item.origem === "ia" ? "bg-purple-500/10 text-purple-700 border-purple-500/30" : "bg-emerald-500/10 text-emerald-700 border-emerald-500/30"}>
                {item.origem === "ia" ? "IA" : "Manual"}
              </Badge>
              {isAtrasada && (
                <Badge variant="destructive" className="text-xs">
                  <AlertCircle className="h-3 w-3 mr-1" /> Atrasada
                </Badge>
              )}
            </div>
            {item.descricao && <p className="text-sm text-muted-foreground line-clamp-1">{item.descricao}</p>}
            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
              {item.responsavel && (
                <span className="flex items-center gap-1"><User className="h-3 w-3" />{item.responsavel.nome_completo}</span>
              )}
              {item.prazo && (
                <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{format(new Date(item.prazo), "dd/MM/yyyy", { locale: ptBR })}</span>
              )}
            </div>
          </div>
          {item.progresso !== undefined && (
            <div className="w-16 flex-shrink-0">
              <div className="text-xs text-right mb-1">{item.progresso}%</div>
              <Progress value={item.progresso} className="h-2" />
            </div>
          )}
        </div>
        {/* Quick actions for IA entregas */}
        {item.origem === "ia" && !isLider && (onIniciar || onSubmeter) && (
          <div className="mt-3 flex gap-2" onClick={e => e.stopPropagation()}>
            {onIniciar && (
              <Button size="sm" variant="outline" onClick={onIniciar}>
                <Play className="h-3 w-3 mr-1" /> Iniciar
              </Button>
            )}
            {onSubmeter && (
              <Button size="sm" variant="outline" onClick={onSubmeter}>
                <Send className="h-3 w-3 mr-1" /> Enviar
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
