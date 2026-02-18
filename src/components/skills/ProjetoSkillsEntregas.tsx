import { useState } from "react";
import { useEntregasEquipe, EntregaEquipe } from "@/hooks/useEntregasEquipe";
import { useSkillsEntregas } from "@/hooks/useSkillsEntregas";
import { EntregaEquipeModal } from "./EntregaEquipeModal";
import { EntregaSkillsEditModal } from "./EntregaSkillsEditModal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Plus, Package, Calendar, User, FolderOpen, Bot, Users } from "lucide-react";
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
const prioridadeColors: Record<string, string> = {
  P1: "bg-red-500/10 text-red-700",
  P2: "bg-yellow-500/10 text-yellow-700",
  P3: "bg-green-500/10 text-green-700",
};

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
  arquivosCount?: number;
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

  // Membros da equipe
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

  // Projetos do backlog
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

  // Unificar entregas
  const unifiedIA: UnifiedEntrega[] = (entregasIA || []).map((e: any) => ({
    id: e.id,
    titulo: e.titulo,
    descricao: e.descricao,
    status: e.status || "pendente",
    prazo: e.prazo,
    responsavelNome: e.responsavel?.nome_completo,
    prioridade: null,
    progresso: 0,
    origem: "ia" as const,
    projetoTitulo: null,
    arquivosCount: 0,
    raw: e,
  }));

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
    arquivosCount: e.arquivos?.length || 0,
    raw: e,
  }));

  const allEntregas = [...unifiedIA, ...unifiedEquipe];
  const filtered = filterStatus === "all" ? allEntregas : allEntregas.filter(e => e.status === filterStatus);

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
    upsertMutation.mutate({ ...values, equipe_id: equipeId }, {
      onSuccess: () => setModalEquipeOpen(false),
    });
  };

  const handleSaveIA = (dados: { status?: string; descricao?: string }) => {
    if (!selectedIA) return;
    atualizarEntrega.mutate({ entregaId: selectedIA.id, dados }, {
      onSuccess: () => setModalIAOpen(false),
    });
  };

  if (isLoading) return <div className="flex justify-center py-12"><div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[180px]"><SelectValue placeholder="Filtrar status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="pendente">Pendente</SelectItem>
              <SelectItem value="em_andamento">Em Andamento</SelectItem>
              <SelectItem value="concluido">Concluído</SelectItem>
              <SelectItem value="bloqueado">Bloqueado</SelectItem>
              <SelectItem value="aguardando_validacao">Aguardando Validação</SelectItem>
              <SelectItem value="aprovada">Aprovada</SelectItem>
            </SelectContent>
          </Select>
          <span className="text-sm text-muted-foreground">{filtered.length} entrega(s)</span>
        </div>
        <Button onClick={openNew} size="sm"><Plus className="h-4 w-4 mr-1" /> Nova Entrega</Button>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Package className="h-12 w-12 mx-auto mb-3 opacity-40" />
          <p className="font-medium">Nenhuma entrega encontrada</p>
          <p className="text-sm">Clique em "Nova Entrega" para adicionar.</p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map(e => (
            <Card key={`${e.origem}-${e.id}`} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => openEdit(e)}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h4 className="font-medium truncate">{e.titulo}</h4>
                      <Badge variant="outline" className={statusColors[e.status] || ""}>{statusLabels[e.status] || e.status}</Badge>
                      {e.prioridade && <Badge variant="outline" className={prioridadeColors[e.prioridade]}>{e.prioridade}</Badge>}
                      <Badge variant="outline" className={e.origem === "ia" ? "bg-purple-500/10 text-purple-700 border-purple-500/30" : "bg-sky-500/10 text-sky-700 border-sky-500/30"}>
                        {e.origem === "ia" ? <><Bot className="h-3 w-3 mr-1" />IA</> : <><Users className="h-3 w-3 mr-1" />Manual</>}
                      </Badge>
                    </div>
                    {e.projetoTitulo && (
                      <div className="flex items-center gap-1 text-xs text-primary mb-1">
                        <FolderOpen className="h-3 w-3" />
                        <span>{e.projetoTitulo}</span>
                      </div>
                    )}
                    {e.descricao && <p className="text-sm text-muted-foreground line-clamp-1">{e.descricao}</p>}
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      {e.responsavelNome && (
                        <span className="flex items-center gap-1"><User className="h-3 w-3" />{e.responsavelNome}</span>
                      )}
                      {e.prazo && (
                        <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{format(new Date(e.prazo), "dd/MM/yyyy")}</span>
                      )}
                      {(e.arquivosCount || 0) > 0 && <span>{e.arquivosCount} arquivo(s)</span>}
                    </div>
                  </div>
                  {e.origem === "manual" && (
                    <div className="w-20 flex-shrink-0">
                      <div className="text-xs text-right mb-1">{e.progresso || 0}%</div>
                      <Progress value={e.progresso || 0} className="h-2" />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
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
      />
    </div>
  );
}
