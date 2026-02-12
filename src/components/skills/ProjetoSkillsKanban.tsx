import { useMemo, useState } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from "@dnd-kit/core";
import { useSkillsEntregas } from "@/hooks/useSkillsEntregas";
import { useAuth } from "@/hooks/useAuth";
import { useSkillsMembro } from "@/hooks/useSkillsMembro";
import { useUserRole } from "@/hooks/useUserRole";
import KanbanColumn from "./kanban/KanbanColumn";
import KanbanCard from "./kanban/KanbanCard";
import KanbanFiltersAdvanced, { AdvancedFilters } from "./kanban/KanbanFiltersAdvanced";
import PortfolioOverview from "./kanban/PortfolioOverview";
import { Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export interface KanbanColumnDef {
  id: string;
  title: string;
  statuses: string[];
  color: string;
  headerBg?: string;
}

const COLUMNS: KanbanColumnDef[] = [
  { id: "pendente", title: "BACKLOG", statuses: ["pendente"], color: "hsl(var(--muted))" },
  { id: "em_andamento", title: "EM ANDAMENTO", statuses: ["em_andamento"], color: "hsl(72 50% 35%)", headerBg: "hsl(72 40% 90%)" },
  { id: "aguardando_validacao", title: "EM VALIDAÇÃO", statuses: ["aguardando_validacao"], color: "hsl(45 90% 50%)", headerBg: "hsl(45 80% 90%)" },
  { id: "concluido", title: "RODANDO", statuses: ["concluido", "aprovada"], color: "hsl(var(--muted))" },
];

export default function ProjetoSkillsKanban() {
  const { entregas, isLoading, atualizarStatus } = useSkillsEntregas();
  const { user } = useAuth();
  const { equipeId, isLider } = useSkillsMembro();
  const { isAdmin } = useUserRole();
  const queryClient = useQueryClient();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [filters, setFilters] = useState<AdvancedFilters>({
    status: null,
    tipo: null,
    responsavel: null,
    prioridade: null,
    meusProjetos: false,
  });

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  // Check backlog for existing projects without entregas
  const { data: backlogCount } = useQuery({
    queryKey: ["backlog-skills-count", equipeId],
    queryFn: async () => {
      if (!equipeId) return 0;
      const { count } = await supabase
        .from("backlog_skills")
        .select("id", { count: "exact", head: true })
        .eq("equipe_id", equipeId);
      return count || 0;
    },
    enabled: !!equipeId,
  });

  const canGenerateEntregas = (isAdmin || isLider) && backlogCount && backlogCount > 0 && (!entregas || entregas.length === 0);

  async function handleGerarEntregas() {
    if (!equipeId) return;
    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("gerar-entregas-skills", {
        body: { equipe_id: equipeId },
      });
      if (error) throw error;
      toast.success(`${data.entregas_criadas || 0} entregas geradas com sucesso!`);
      queryClient.invalidateQueries({ queryKey: ["entregas-skills"] });
    } catch (e: any) {
      toast.error("Erro ao gerar entregas: " + (e.message || "Tente novamente"));
    } finally {
      setGenerating(false);
    }
  }

  const responsaveis = useMemo(() => {
    if (!entregas) return [];
    const map = new Map<string, { id: string; nome: string; avatar_url: string | null }>();
    entregas.forEach((e: any) => {
      if (e.responsavel && !map.has(e.responsavel.id)) {
        map.set(e.responsavel.id, {
          id: e.responsavel.id,
          nome: e.responsavel.nome_completo,
          avatar_url: e.responsavel.avatar_url,
        });
      }
    });
    return Array.from(map.values());
  }, [entregas]);

  const filteredEntregas = useMemo(() => {
    if (!entregas) return [];
    return entregas.filter((e: any) => {
      if (filters.status) {
        const col = COLUMNS.find((c) => c.id === filters.status);
        if (col && !col.statuses.includes(e.status ?? "pendente")) return false;
      }
      if (filters.tipo && (e.tipo ?? "individual") !== filters.tipo) return false;
      if (filters.responsavel && e.responsavel_id !== filters.responsavel) return false;
      if (filters.prioridade && (e.prioridade ?? "P3") !== filters.prioridade) return false;
      if (filters.meusProjetos && user && e.responsavel_id !== user.id) return false;
      return true;
    });
  }, [entregas, filters, user]);

  const columnItems = useMemo(() => {
    const map: Record<string, any[]> = {};
    COLUMNS.forEach((col) => (map[col.id] = []));
    filteredEntregas.forEach((entrega: any) => {
      const col = COLUMNS.find((c) => c.statuses.includes(entrega.status || "pendente"));
      if (col) map[col.id].push(entrega);
    });
    return map;
  }, [filteredEntregas]);

  const activeEntrega = useMemo(
    () => filteredEntregas.find((e: any) => e.id === activeId),
    [activeId, filteredEntregas]
  );

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as string);
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveId(null);
    const { active, over } = event;
    if (!over) return;

    const entregaId = active.id as string;
    const targetColumnId = over.id as string;
    const targetColumn = COLUMNS.find((c) => c.id === targetColumnId);
    if (!targetColumn) return;

    const entrega = filteredEntregas.find((e: any) => e.id === entregaId);
    if (!entrega) return;

    if (targetColumn.statuses.includes(entrega.status || "pendente")) return;

    const newStatus = targetColumn.statuses[0];
    atualizarStatus.mutate({ entregaId, novoStatus: newStatus });
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Seção 1: Visão Geral */}
      <PortfolioOverview entregas={entregas ?? []} />

      {/* Botão para gerar entregas quando Kanban vazio mas backlog tem projetos */}
      {canGenerateEntregas && (
        <div className="flex flex-col items-center justify-center py-8 px-4 border border-dashed border-muted-foreground/30 rounded-xl bg-muted/30">
          <Sparkles className="h-10 w-10 text-primary mb-3" />
          <p className="text-sm text-muted-foreground mb-1">
            Existem <strong>{backlogCount}</strong> projetos mapeados no backlog sem entregas vinculadas.
          </p>
          <p className="text-xs text-muted-foreground mb-4">
            Gere entregas com IA para começar a executar os projetos no Kanban.
          </p>
          <Button onClick={handleGerarEntregas} disabled={generating}>
            {generating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Gerando entregas...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Gerar Entregas com IA
              </>
            )}
          </Button>
        </div>
      )}

      {/* Seção 2: Backlog de Projetos */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">Backlog de Projetos</h2>

        <KanbanFiltersAdvanced
          filters={filters}
          onChange={setFilters}
          responsaveis={responsaveis}
        />

        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {COLUMNS.map((col) => (
              <KanbanColumn key={col.id} column={col} items={columnItems[col.id] || []}>
                {(columnItems[col.id] || []).map((entrega: any) => (
                  <KanbanCard key={entrega.id} entrega={entrega} />
                ))}
              </KanbanColumn>
            ))}
          </div>

          <DragOverlay>
            {activeEntrega ? <KanbanCard entrega={activeEntrega} isOverlay /> : null}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  );
}
