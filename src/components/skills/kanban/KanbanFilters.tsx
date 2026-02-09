import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Users } from "lucide-react";

interface KanbanFiltersProps {
  responsaveis: { id: string; nome: string; avatar_url: string | null }[];
  filtroResponsavel: string | null;
  onFiltroChange: (id: string | null) => void;
}

export default function KanbanFilters({ responsaveis, filtroResponsavel, onFiltroChange }: KanbanFiltersProps) {
  if (responsaveis.length <= 1) return null;

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <Users className="h-4 w-4 text-muted-foreground" />
      <Button
        size="sm"
        variant={filtroResponsavel === null ? "default" : "outline"}
        className="h-7 text-xs"
        onClick={() => onFiltroChange(null)}
      >
        Todos
      </Button>
      {responsaveis.map((r) => (
        <Button
          key={r.id}
          size="sm"
          variant={filtroResponsavel === r.id ? "default" : "outline"}
          className="h-7 text-xs gap-1.5"
          onClick={() => onFiltroChange(r.id === filtroResponsavel ? null : r.id)}
        >
          <Avatar className="h-4 w-4">
            <AvatarImage src={r.avatar_url || undefined} />
            <AvatarFallback className="text-[8px]">{r.nome?.slice(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          {r.nome?.split(" ")[0]}
        </Button>
      ))}
    </div>
  );
}
