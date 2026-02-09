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
import KanbanColumn from "./kanban/KanbanColumn";
import KanbanCard from "./kanban/KanbanCard";
import KanbanFilters from "./kanban/KanbanFilters";
import { Loader2 } from "lucide-react";

export interface KanbanColumnDef {
  id: string;
  title: string;
  statuses: string[];
  color: string;
}

const COLUMNS: KanbanColumnDef[] = [
  { id: "pendente", title: "Pendente", statuses: ["pendente"], color: "hsl(var(--muted))" },
  { id: "em_andamento", title: "Em Andamento", statuses: ["em_andamento"], color: "hsl(210 80% 55%)" },
  { id: "aguardando_validacao", title: "Aguardando Validação", statuses: ["aguardando_validacao"], color: "hsl(45 90% 50%)" },
  { id: "concluido", title: "Concluído", statuses: ["concluido", "aprovada"], color: "hsl(72 50% 35%)" },
];

export default function ProjetoSkillsKanban() {
  const { entregas, isLoading, atualizarStatus } = useSkillsEntregas();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [filtroResponsavel, setFiltroResponsavel] = useState<string | null>(null);

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
    if (!filtroResponsavel) return entregas;
    return entregas.filter((e: any) => e.responsavel_id === filtroResponsavel);
  }, [entregas, filtroResponsavel]);

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

    // Don't update if already in that column
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
    <div className="space-y-4">
      <KanbanFilters
        responsaveis={responsaveis}
        filtroResponsavel={filtroResponsavel}
        onFiltroChange={setFiltroResponsavel}
      />

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 overflow-x-auto">
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
  );
}
