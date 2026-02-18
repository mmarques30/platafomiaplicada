import { useState } from "react";
import { LayoutGrid, List, Loader2, Plus } from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Button } from "@/components/ui/button";
import { useSkillsBacklog } from "@/hooks/useSkillsBacklog";
import BacklogKanban from "./BacklogKanban";
import BacklogTable from "./BacklogTable";
import ProjetoDetailModal from "./ProjetoDetailModal";
import AddProjetoModal from "./AddProjetoModal";
import type { BacklogItem } from "@/hooks/useSkillsBacklog";

export default function BacklogView() {
  const { items, isLoading, updateStatus, addItem, updateItem } = useSkillsBacklog();
  const [view, setView] = useState<string>("kanban");
  const [selectedItem, setSelectedItem] = useState<BacklogItem | null>(null);
  const [addOpen, setAddOpen] = useState(false);

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

      {view === "kanban" ? (
        <BacklogKanban
          items={items}
          onStatusChange={(id, status) => updateStatus.mutate({ id, status })}
          onItemClick={setSelectedItem}
        />
      ) : (
        <BacklogTable items={items} onItemClick={setSelectedItem} />
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
          setSelectedItem(null);
        }}
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
