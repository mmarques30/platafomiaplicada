import { useState } from "react";
import { useEntregasEquipe, EntregaEquipe } from "@/hooks/useEntregasEquipe";
import { EntregaEquipeModal } from "./EntregaEquipeModal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Plus, Package, Calendar, User } from "lucide-react";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

const statusLabels: Record<string, string> = {
  pendente: "Pendente",
  em_andamento: "Em Andamento",
  concluido: "Concluído",
  bloqueado: "Bloqueado",
};
const statusColors: Record<string, string> = {
  pendente: "bg-yellow-500/10 text-yellow-700 border-yellow-500/30",
  em_andamento: "bg-blue-500/10 text-blue-700 border-blue-500/30",
  concluido: "bg-green-500/10 text-green-700 border-green-500/30",
  bloqueado: "bg-red-500/10 text-red-700 border-red-500/30",
};
const prioridadeColors: Record<string, string> = {
  P1: "bg-red-500/10 text-red-700",
  P2: "bg-yellow-500/10 text-yellow-700",
  P3: "bg-green-500/10 text-green-700",
};

interface Props {
  equipeId: string;
}

export default function ProjetoSkillsEntregas({ equipeId }: Props) {
  const { entregas, isLoading, upsertMutation, uploadFile } = useEntregasEquipe(equipeId);
  const [modalOpen, setModalOpen] = useState(false);
  const [selected, setSelected] = useState<EntregaEquipe | null>(null);
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

  const filtered = filterStatus === "all" ? entregas : entregas.filter(e => e.status_equipe === filterStatus);

  const openNew = () => { setSelected(null); setModalOpen(true); };
  const openEdit = (e: EntregaEquipe) => { setSelected(e); setModalOpen(true); };

  const handleSave = (values: any) => {
    upsertMutation.mutate({ ...values, equipe_id: equipeId }, {
      onSuccess: () => setModalOpen(false),
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
        <div className="grid gap-3">
          {filtered.map(e => (
            <Card key={e.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => openEdit(e)}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h4 className="font-medium truncate">{e.titulo_equipe}</h4>
                      <Badge variant="outline" className={statusColors[e.status_equipe]}>{statusLabels[e.status_equipe]}</Badge>
                      {e.prioridade_equipe && <Badge variant="outline" className={prioridadeColors[e.prioridade_equipe]}>{e.prioridade_equipe}</Badge>}
                    </div>
                    {e.descricao_equipe && <p className="text-sm text-muted-foreground line-clamp-1">{e.descricao_equipe}</p>}
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      {e.responsavel && (
                        <span className="flex items-center gap-1"><User className="h-3 w-3" />{e.responsavel.nome_completo}</span>
                      )}
                      {e.prazo_equipe && (
                        <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{format(new Date(e.prazo_equipe), "dd/MM/yyyy")}</span>
                      )}
                      {e.arquivos.length > 0 && <span>{e.arquivos.length} arquivo(s)</span>}
                    </div>
                  </div>
                  <div className="w-20 flex-shrink-0">
                    <div className="text-xs text-right mb-1">{e.progresso}%</div>
                    <Progress value={e.progresso} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <EntregaEquipeModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        entrega={selected}
        membros={membros || []}
        onSave={handleSave}
        onUploadFile={(file) => uploadFile(file, equipeId)}
        isSaving={upsertMutation.isPending}
      />
    </div>
  );
}
