import { useState } from "react";
import { useEntregasEquipe, EntregaEquipe } from "@/hooks/useEntregasEquipe";
import { useSkillsEntregas } from "@/hooks/useSkillsEntregas";
import { EntregaEquipeModal } from "./EntregaEquipeModal";
import { EntregaSkillsEditModal } from "./EntregaSkillsEditModal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Plus, Package, Bot, Users, X, Archive } from "lucide-react";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

const statusLabels: Record<string, string> = {
  pendente: "Pendente",
  em_andamento: "Em Andamento",
  concluido: "Concluído",
  bloqueado: "Bloqueado",
  aguardando_validacao: "Aguardando Validação",
  aprovada: "Aprovada",
};
const statusColors: Record<string, string> = {
  pendente: "bg-yellow-500/10 text-yellow-700 border-yellow-500/30",
  em_andamento: "bg-blue-500/10 text-blue-700 border-blue-500/30",
  concluido: "bg-green-500/10 text-green-700 border-green-500/30",
  bloqueado: "bg-red-500/10 text-red-700 border-red-500/30",
  aguardando_validacao: "bg-orange-500/10 text-orange-700 border-orange-500/30",
  aprovada: "bg-emerald-500/10 text-emerald-700 border-emerald-500/30",
};

const ARCHIVED_PROJECT_STATUSES = ["nao_aprovado", "descartado"];

interface UnifiedEntrega {
  id: string;
  titulo: string;
  descricao?: string | null;
  status: string;
  prazo?: string | null;
  responsavelNome?: string | null;
  prioridade?: string | null;
  progresso?: number;
  origem: "ia" | "manual";
  projetoTitulo?: string | null;
  projetoStatus?: string | null;
  raw: any;
}

interface Props {
  equipeId: string;
}

export default function ProjetoSkillsEntregas({ equipeId }: Props) {
  const { entregas: entregasEquipe, isLoading: loadingEquipe, upsertMutation, uploadFile } = useEntregasEquipe(equipeId);
  const { entregas: entregasIA, isLoading: loadingIA, atualizarEntrega } = useSkillsEntregas();

  const [modalEquipeOpen, setModalEquipeOpen] = useState(false);
  const [modalIAOpen, setModalIAOpen] = useState(false);
  const [selectedEquipe, setSelectedEquipe] = useState<EntregaEquipe | null>(null);
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
        .eq("equipe_id", equipeId)
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
        .eq("equipe_id", equipeId)
        .neq("status", "descartado")
        .order("titulo");
      return (data || []) as { id: string; titulo: string }[];
    },
    enabled: !!equipeId,
  });

  const unifiedIA: UnifiedEntrega[] = (entregasIA || []).map((e: any) => ({
    id: e.id,
    titulo: e.titulo,
    descricao: e.descricao,
    status: e.status || "pendente",
    prazo: e.prazo,
    responsavelNome: e.responsavel?.nome_completo || e.backlog_item?.responsavel_id ? undefined : undefined,
    prioridade: null,
    progresso: 0,
    origem: "ia" as const,
    projetoTitulo: e.backlog_item?.titulo || null,
    projetoStatus: e.backlog_item?.status || null,
    raw: e,
  }));

  // For IA entregas, use backlog_item responsavel as fallback
  for (const entry of unifiedIA) {
    const raw = entry.raw;
    if (raw.responsavel?.nome_completo) {
      entry.responsavelNome = raw.responsavel.nome_completo;
    } else if (raw.backlog_item?.responsavel_id && membros) {
      const membro = membros.find((m: any) => m.id === raw.backlog_item.responsavel_id);
      if (membro) entry.responsavelNome = membro.nome_completo;
    }
  }

  const unifiedEquipe: UnifiedEntrega[] = (entregasEquipe || []).map(e => ({
    id: e.id,
    titulo: e.titulo_equipe,
    descricao: e.descricao_equipe,
    status: e.status_equipe,
    prazo: e.prazo_equipe,
    responsavelNome: e.responsavel?.nome_completo,
    prioridade: e.prioridade_equipe,
    progresso: e.progresso,
    origem: "manual" as const,
    projetoTitulo: e.projeto?.titulo,
    projetoStatus: null,
    raw: e,
  }));

  const allEntregas = [...unifiedIA, ...unifiedEquipe];

  const filtered = allEntregas.filter(e => {
    // Hide archived project entregas by default
    if (!showArchived && e.projetoStatus && ARCHIVED_PROJECT_STATUSES.includes(e.projetoStatus)) return false;
    if (filterStatus !== "all" && e.status !== filterStatus) return false;
    if (filterOrigem !== "all" && e.origem !== filterOrigem) return false;
    if (filterResponsavel !== "all" && (e.responsavelNome || "") !== filterResponsavel) return false;
    
    if (filterProjeto !== "all" && (e.projetoTitulo || "") !== filterProjeto) return false;
    return true;
  });

  const archivedCount = allEntregas.filter(e => e.projetoStatus && ARCHIVED_PROJECT_STATUSES.includes(e.projetoStatus)).length;

  const hasActiveFilters = filterStatus !== "all" || filterResponsavel !== "all" || filterOrigem !== "all" || filterProjeto !== "all";

  const clearFilters = () => {
    setFilterStatus("all");
    setFilterResponsavel("all");
    setFilterOrigem("all");
    setFilterProjeto("all");
  };

  const uniqueResponsaveis = Array.from(new Set(allEntregas.map(e => e.responsavelNome).filter(Boolean))) as string[];
  const uniqueProjetos = Array.from(new Set(allEntregas.map(e => e.projetoTitulo).filter(Boolean))) as string[];

  const isLoading = loadingEquipe || loadingIA;

  const openNew = () => { setSelectedEquipe(null); setModalEquipeOpen(true); };

  const openEdit = (item: UnifiedEntrega) => {
    if (item.origem === "ia") {
      setSelectedIA(item.raw);
      setModalIAOpen(true);
    } else {
      setSelectedEquipe(item.raw);
      setModalEquipeOpen(true);
    }
  };

  const handleSaveEquipe = (values: any) => {
    const isNew = !values.id;
    upsertMutation.mutate({ ...values, equipe_id: equipeId }, {
      onSuccess: (data) => {
        if (isNew && data) {
          setSelectedEquipe(data);
        } else {
          setModalEquipeOpen(false);
        }
      },
    });
  };

  const handleSaveIA = (dados: { titulo?: string; status?: string; descricao?: string; prazo?: string | null; responsavel_id?: string | null }) => {
    if (!selectedIA) return;
    atualizarEntrega.mutate({ entregaId: selectedIA.id, dados }, {
      onSuccess: () => setModalIAOpen(false),
    });
  };

  if (isLoading) return <div className="flex justify-center py-12"><div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" /></div>;

  return (
    <div className="space-y-4">
      {/* Filter bar */}
      <div className="flex items-center justify-between flex-wrap gap-2">
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

        <Button onClick={openNew} size="sm"><Plus className="h-4 w-4 mr-1" /> Nova Entrega</Button>
      </div>

      {/* Archive toggle */}
      {archivedCount > 0 && (
        <div className="flex items-center gap-2">
          <Switch checked={showArchived} onCheckedChange={setShowArchived} id="show-archived" />
          <label htmlFor="show-archived" className="text-xs text-muted-foreground flex items-center gap-1 cursor-pointer">
            <Archive className="h-3 w-3" />
            Incluir projetos arquivados ({archivedCount})
          </label>
        </div>
      )}

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Package className="h-12 w-12 mx-auto mb-3 opacity-40" />
          <p className="font-medium">Nenhuma entrega encontrada</p>
          <p className="text-sm">Clique em "Nova Entrega" para adicionar.</p>
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Título</TableHead>
                <TableHead>Projeto</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Responsável</TableHead>
                <TableHead>Prazo</TableHead>
                <TableHead>Progresso</TableHead>
                
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(e => {
                const isArchived = e.projetoStatus && ARCHIVED_PROJECT_STATUSES.includes(e.projetoStatus);
                return (
                  <TableRow
                    key={`${e.origem}-${e.id}`}
                    className={`cursor-pointer ${isArchived ? "opacity-50" : ""}`}
                    onClick={() => openEdit(e)}
                  >
                    <TableCell className="font-medium max-w-[200px]">
                      <span className="truncate block">{e.titulo}</span>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        {e.projetoTitulo || "—"}
                        {isArchived && (
                          <Badge variant="outline" className="text-[10px] bg-red-500/10 text-red-600 border-red-500/30 ml-1">
                            Arquivado
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`text-xs ${statusColors[e.status] || ""}`}>
                        {statusLabels[e.status] || e.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs">
                      {e.responsavelNome || <span className="text-muted-foreground">—</span>}
                    </TableCell>
                    <TableCell className="text-xs">
                      {e.prazo ? format(new Date(e.prazo), "dd/MM/yyyy") : <span className="text-muted-foreground">—</span>}
                    </TableCell>
                    <TableCell>
                      {e.origem === "manual" ? (
                        <div className="w-16">
                          <div className="text-xs text-right mb-0.5">{e.progresso || 0}%</div>
                          <Progress value={e.progresso || 0} className="h-1.5" />
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
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
        onUploadFile={(file) => uploadFile(file, equipeId)}
        isSaving={upsertMutation.isPending}
      />

      <EntregaSkillsEditModal
        open={modalIAOpen}
        onOpenChange={setModalIAOpen}
        entrega={selectedIA}
        onSave={handleSaveIA}
        isSaving={atualizarEntrega.isPending}
        isLider={true}
        membros={membros || []}
      />
    </div>
  );
}
