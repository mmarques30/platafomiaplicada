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
import KanbanColumn from "./kanban/KanbanColumn";
import KanbanCard from "./kanban/KanbanCard";
import KanbanFiltersAdvanced, { AdvancedFilters } from "./kanban/KanbanFiltersAdvanced";
import PortfolioOverview from "./kanban/PortfolioOverview";
import { Loader2 } from "lucide-react";

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
  const [activeId, setActiveId] = useState<string | null>(null);
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
