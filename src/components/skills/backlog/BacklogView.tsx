import { useState, useMemo } from "react";
import { LayoutGrid, List, Loader2, Plus } from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSkillsBacklog } from "@/hooks/useSkillsBacklog";
import { useSkillsMembro } from "@/hooks/useSkillsMembro";
import BacklogKanban from "./BacklogKanban";
import BacklogTable from "./BacklogTable";
import ProjetoDetailModal from "./ProjetoDetailModal";
import AddProjetoModal from "./AddProjetoModal";
import type { BacklogItem } from "@/hooks/useSkillsBacklog";

export default function BacklogView() {
  const { items, isLoading, updateStatus, addItem, updateItem } = useSkillsBacklog();
  const { equipeId } = useSkillsMembro();
  const [view, setView] = useState<string>("kanban");
  const [selectedItem, setSelectedItem] = useState<BacklogItem | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [filtroResponsavel, setFiltroResponsavel] = useState("todos");
  const [filtroPrioridade, setFiltroPrioridade] = useState("todos");
  const [filtroArea, setFiltroArea] = useState("todos");

  const responsavelOptions = useMemo(() => {
    const names = [
      ...items.map(i => i.responsavel?.nome),
      ...items.map(i => i.colaborador?.nome),
    ].filter(Boolean) as string[];
    return [...new Set(names)].sort();
  }, [items]);

  const prioridadeOptions = useMemo(() => {
    const vals = items.map(i => i.prioridade).filter(Boolean) as string[];
    return [...new Set(vals)].sort();
  }, [items]);

  const areaOptions = useMemo(() => {
    const vals = items.map(i => i.area_impactada).filter(Boolean) as string[];
    return [...new Set(vals)].sort();
  }, [items]);

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      if (filtroResponsavel !== "todos" && item.responsavel?.nome !== filtroResponsavel && item.colaborador?.nome !== filtroResponsavel) return false;
      if (filtroPrioridade !== "todos" && item.prioridade !== filtroPrioridade) return false;
      if (filtroArea !== "todos" && item.area_impactada !== filtroArea) return false;
      return true;
    });
  }, [items, filtroResponsavel, filtroPrioridade, filtroArea]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Backlog de Projetos</h2>
        <div className="flex items-center gap-2">
          <Button size="sm" onClick={() => setAddOpen(true)} className="gap-1.5">
            <Plus className="h-4 w-4" />
            Novo Projeto
          </Button>
          <ToggleGroup type="single" value={view} onValueChange={v => v && setView(v)} size="sm">
            <ToggleGroupItem value="kanban" aria-label="Kanban">
              <LayoutGrid className="h-4 w-4" />
            </ToggleGroupItem>
            <ToggleGroupItem value="tabela" aria-label="Tabela">
              <List className="h-4 w-4" />
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Select value={filtroResponsavel} onValueChange={setFiltroResponsavel}>
          <SelectTrigger className="border-border/50 h-8 text-xs w-[160px] bg-transparent hover:bg-muted/50 transition-colors">
            <SelectValue placeholder="Responsável" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos</SelectItem>
            {responsavelOptions.map(r => (
              <SelectItem key={r} value={r}>{r}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filtroPrioridade} onValueChange={setFiltroPrioridade}>
          <SelectTrigger className="border-border/50 h-8 text-xs w-[160px] bg-transparent hover:bg-muted/50 transition-colors">
            <SelectValue placeholder="Prioridade" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todas</SelectItem>
            {prioridadeOptions.map(p => (
              <SelectItem key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filtroArea} onValueChange={setFiltroArea}>
          <SelectTrigger className="border-border/50 h-8 text-xs w-[160px] bg-transparent hover:bg-muted/50 transition-colors">
            <SelectValue placeholder="Área" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todas</SelectItem>
            {areaOptions.map(a => (
              <SelectItem key={a} value={a}>{a}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {view === "kanban" ? (
        <BacklogKanban
          items={filteredItems}
          onStatusChange={(id, status) => updateStatus.mutate({ id, status })}
          onItemClick={setSelectedItem}
        />
      ) : (
        <BacklogTable items={filteredItems} onItemClick={setSelectedItem} />
      )}

      <ProjetoDetailModal
        item={selectedItem}
        open={!!selectedItem}
        onOpenChange={open => !open && setSelectedItem(null)}
        onStatusChange={(id, status) => {
          updateStatus.mutate({ id, status });
          setSelectedItem(null);
        }}
        onUpdate={(id, fields) => {
          updateItem.mutate({ id, ...fields });
        }}
        equipeId={equipeId}
      />

      <AddProjetoModal
        open={addOpen}
        onOpenChange={setAddOpen}
        onAdd={item => addItem.mutate(item)}
        isLoading={addItem.isPending}
      />
    </div>
  );
}
