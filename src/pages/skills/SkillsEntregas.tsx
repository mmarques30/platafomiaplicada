import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CheckSquare, Clock, Send, CheckCircle2, Plus, Package, Bot, Users, X, Archive } from "lucide-react";
import { useSkillsEntregas } from "@/hooks/useSkillsEntregas";
import { useEntregasEquipe, type EntregaEquipe } from "@/hooks/useEntregasEquipe";
import { EntregaEquipeModal } from "@/components/skills/EntregaEquipeModal";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { EntregaSkillsEditModal } from "@/components/skills/EntregaSkillsEditModal";

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  pendente: { label: "Pendente", color: "bg-yellow-500/10 text-yellow-700 border-yellow-500/30" },
  em_andamento: { label: "Em Andamento", color: "bg-blue-500/10 text-blue-700 border-blue-500/30" },
  aguardando_validacao: { label: "Aguardando Validação", color: "bg-orange-500/10 text-orange-700 border-orange-500/30" },
  aprovada: { label: "Aprovada", color: "bg-emerald-500/10 text-emerald-700 border-emerald-500/30" },
  concluido: { label: "Concluído", color: "bg-green-500/10 text-green-700 border-green-500/30" },
  bloqueado: { label: "Bloqueado", color: "bg-red-500/10 text-red-700 border-red-500/30" },
};

const prioridadeColors: Record<string, string> = {
  P1: "bg-red-500/10 text-red-700",
  P2: "bg-yellow-500/10 text-yellow-700",
  P3: "bg-green-500/10 text-green-700",
};

const ARCHIVED_PROJECT_STATUSES = ["nao_aprovado", "descartado"];

interface UnifiedEntrega {
  id: string;
  titulo: string;
  descricao: string | null;
  status: string;
  prazo: string | null;
  origem: "ia" | "manual";
  responsavelNome?: string | null;
  progresso?: number;
  prioridade?: string | null;
  projetoTitulo?: string | null;
  projetoStatus?: string | null;
  raw: any;
}

export default function SkillsEntregas() {
  const { entregas: entregasIA, isLoading: loadingIA, isLider, equipeId, submeterEntrega, iniciarEntrega, atualizarEntrega } = useSkillsEntregas();
  const { entregas: entregasEquipe, isLoading: loadingEquipe, upsertMutation, uploadFile } = useEntregasEquipe(equipeId);

  const [modalEquipeOpen, setModalEquipeOpen] = useState(false);
  const [selectedEquipe, setSelectedEquipe] = useState<EntregaEquipe | null>(null);
  const [modalIAOpen, setModalIAOpen] = useState(false);
  const [selectedIA, setSelectedIA] = useState<any>(null);

  const [filterStatus, setFilterStatus] = useState("all");
  const [filterResponsavel, setFilterResponsavel] = useState("all");
  const [filterOrigem, setFilterOrigem] = useState("all");
  const [filterProjeto, setFilterProjeto] = useState("all");
  const [showArchived, setShowArchived] = useState(false);

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

  const unifiedIA: UnifiedEntrega[] = (entregasIA || []).map((e: any) => ({
    id: e.id,
    titulo: e.titulo,
    descricao: e.descricao,
    status: e.status,
    prazo: e.prazo,
    origem: "ia" as const,
    responsavelNome: e.responsavel?.nome_completo || null,
    projetoTitulo: e.backlog_item?.titulo || null,
    projetoStatus: e.backlog_item?.status || null,
    raw: e,
  }));

  // Use backlog_item responsavel as fallback for IA entregas
  for (const entry of unifiedIA) {
    const raw = entry.raw;
    if (!entry.responsavelNome && raw.backlog_item?.responsavel_id && membros) {
      const membro = membros.find((m: any) => m.id === raw.backlog_item.responsavel_id);
      if (membro) entry.responsavelNome = membro.nome_completo;
    }
  }

  const unifiedEquipe: UnifiedEntrega[] = (entregasEquipe || []).map((e) => ({
    id: e.id,
    titulo: e.titulo_equipe,
    descricao: e.descricao_equipe,
    status: e.status_equipe,
    prazo: e.prazo_equipe,
    origem: "manual" as const,
    responsavelNome: e.responsavel?.nome_completo,
    progresso: e.progresso,
    prioridade: e.prioridade_equipe,
    projetoTitulo: e.projeto?.titulo,
    projetoStatus: null,
    raw: e,
  }));

  const allEntregas = [...unifiedIA, ...unifiedEquipe];

  const filtered = allEntregas.filter(e => {
    if (!showArchived && e.projetoStatus && ARCHIVED_PROJECT_STATUSES.includes(e.projetoStatus)) return false;
    if (filterStatus !== "all" && e.status !== filterStatus) return false;
    if (filterOrigem !== "all" && e.origem !== filterOrigem) return false;
    if (filterResponsavel !== "all" && (e.responsavelNome || "") !== filterResponsavel) return false;
    if (filterProjeto !== "all" && (e.projetoTitulo || "") !== filterProjeto) return false;
    return true;
  });

  const archivedCount = allEntregas.filter(e => e.projetoStatus && ARCHIVED_PROJECT_STATUSES.includes(e.projetoStatus)).length;

  const hasActiveFilters = filterStatus !== "all" || filterResponsavel !== "all" || filterOrigem !== "all" || filterProjeto !== "all";
  const clearFilters = () => { setFilterStatus("all"); setFilterResponsavel("all"); setFilterOrigem("all"); setFilterProjeto("all"); };

  const uniqueResponsaveis = Array.from(new Set(allEntregas.map(e => e.responsavelNome).filter(Boolean))) as string[];
  const uniqueProjetos = Array.from(new Set(allEntregas.map(e => e.projetoTitulo).filter(Boolean))) as string[];

  // KPI stats exclude archived by default
  const activeEntregas = allEntregas.filter(e => !(e.projetoStatus && ARCHIVED_PROJECT_STATUSES.includes(e.projetoStatus)));
  const pendentes = activeEntregas.filter(e => e.status === "pendente" || e.status === "em_andamento");
  const aguardando = activeEntregas.filter(e => e.status === "aguardando_validacao");
  const concluidas = activeEntregas.filter(e => e.status === "aprovada" || e.status === "concluido");

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
    const isNew = !values.id;
    upsertMutation.mutate({ ...values, equipe_id: equipeId! }, {
      onSuccess: (data) => {
        if (isNew && data) {
          setSelectedEquipe(data);
        } else {
          setModalEquipeOpen(false);
        }
      },
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
                <p className="text-2xl font-bold">{activeEntregas.length}</p>
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

      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="border-border/50 h-8 text-xs w-[150px] bg-transparent hover:bg-muted/50 transition-colors">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os status</SelectItem>
            <SelectItem value="pendente">Pendente</SelectItem>
            <SelectItem value="em_andamento">Em Andamento</SelectItem>
            <SelectItem value="concluido">Concluído</SelectItem>
            <SelectItem value="bloqueado">Bloqueado</SelectItem>
            <SelectItem value="aguardando_validacao">Aguardando Validação</SelectItem>
            <SelectItem value="aprovada">Aprovada</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterResponsavel} onValueChange={setFilterResponsavel}>
          <SelectTrigger className="border-border/50 h-8 text-xs w-[160px] bg-transparent hover:bg-muted/50 transition-colors">
            <SelectValue placeholder="Responsável" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos responsáveis</SelectItem>
            {uniqueResponsaveis.map(name => (
              <SelectItem key={name} value={name}>{name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filterProjeto} onValueChange={setFilterProjeto}>
          <SelectTrigger className="border-border/50 h-8 text-xs w-[160px] bg-transparent hover:bg-muted/50 transition-colors">
            <SelectValue placeholder="Projeto" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos projetos</SelectItem>
            {uniqueProjetos.map(name => (
              <SelectItem key={name} value={name}>{name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filterOrigem} onValueChange={setFilterOrigem}>
          <SelectTrigger className="border-border/50 h-8 text-xs w-[120px] bg-transparent hover:bg-muted/50 transition-colors">
            <SelectValue placeholder="Origem" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas origens</SelectItem>
            <SelectItem value="ia">IA</SelectItem>
            <SelectItem value="manual">Manual</SelectItem>
          </SelectContent>
        </Select>

        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="h-8 text-xs text-muted-foreground">
            <X className="h-3 w-3 mr-1" /> Limpar
          </Button>
        )}

        <span className="text-xs text-muted-foreground">{filtered.length} entrega(s)</span>
      </div>

      {/* Archive toggle */}
      {archivedCount > 0 && (
        <div className="flex items-center gap-2">
          <Switch checked={showArchived} onCheckedChange={setShowArchived} id="show-archived-main" />
          <label htmlFor="show-archived-main" className="text-xs text-muted-foreground flex items-center gap-1 cursor-pointer">
            <Archive className="h-3 w-3" />
            Incluir projetos arquivados ({archivedCount})
          </label>
        </div>
      )}

      {/* Table */}
      {filtered.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
            <p className="text-muted-foreground">Nenhuma entrega encontrada</p>
          </CardContent>
        </Card>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Título</TableHead>
                <TableHead>Projeto</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Prioridade</TableHead>
                <TableHead>Responsável</TableHead>
                <TableHead>Prazo</TableHead>
                <TableHead>Progresso</TableHead>
                <TableHead>Origem</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((item) => {
                const isArchived = item.projetoStatus && ARCHIVED_PROJECT_STATUSES.includes(item.projetoStatus);
                return (
                  <TableRow
                    key={`${item.origem}-${item.id}`}
                    className={`cursor-pointer ${isArchived ? "opacity-50" : ""}`}
                    onClick={() => handleClickEntrega(item)}
                  >
                    <TableCell className="font-medium max-w-[250px]">
                      <span className="truncate block">{item.titulo}</span>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        {item.projetoTitulo || "—"}
                        {isArchived && (
                          <Badge variant="outline" className="text-[10px] bg-red-500/10 text-red-600 border-red-500/30 ml-1">
                            Arquivado
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`text-xs ${STATUS_CONFIG[item.status]?.color || ""}`}>
                        {STATUS_CONFIG[item.status]?.label || item.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {item.prioridade ? (
                        <Badge variant="outline" className={`text-xs ${prioridadeColors[item.prioridade] || ""}`}>
                          {item.prioridade}
                        </Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-xs">
                      {item.responsavelNome || <span className="text-muted-foreground">—</span>}
                    </TableCell>
                    <TableCell className="text-xs">
                      {item.prazo ? format(new Date(item.prazo), "dd/MM/yyyy") : <span className="text-muted-foreground">—</span>}
                    </TableCell>
                    <TableCell>
                      {item.origem === "manual" ? (
                        <div className="w-16">
                          <div className="text-xs text-right mb-0.5">{item.progresso || 0}%</div>
                          <Progress value={item.progresso || 0} className="h-1.5" />
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`text-xs ${item.origem === "ia" ? "bg-purple-500/10 text-purple-700 border-purple-500/30" : "bg-sky-500/10 text-sky-700 border-sky-500/30"}`}>
                        {item.origem === "ia" ? <><Bot className="h-3 w-3 mr-1" />IA</> : <><Users className="h-3 w-3 mr-1" />Manual</>}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

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
        membros={membros || []}
      />
    </div>
  );
}
