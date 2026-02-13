import { useMemo } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export interface ProjetosFilters {
  projeto: string;
  responsavel: string;
  dataInicio: Date | undefined;
  dataFim: Date | undefined;
}

interface ProjetosFilterBarProps {
  entregas: any[];
  membros: { user_id: string; nome: string }[];
  filters: ProjetosFilters;
  onFiltersChange: (filters: ProjetosFilters) => void;
}

export default function ProjetosFilterBar({
  entregas,
  membros,
  filters,
  onFiltersChange,
}: ProjetosFilterBarProps) {
  const projetos = useMemo(() => {
    const unique = new Map<string, string>();
    entregas.forEach((e) => {
      if (e.titulo) unique.set(e.id, e.titulo);
    });
    return Array.from(unique.entries()).map(([id, titulo]) => ({ id, titulo }));
  }, [entregas]);

  const hasFilters =
    filters.projeto !== "todos" ||
    filters.responsavel !== "todos" ||
    filters.dataInicio ||
    filters.dataFim;

  const clearFilters = () =>
    onFiltersChange({
      projeto: "todos",
      responsavel: "todos",
      dataInicio: undefined,
      dataFim: undefined,
    });

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-lg border border-[#9EB038]/20 bg-[#9EB038]/8 border-l-3 border-l-[#9EB038] px-3 py-2">
      <Select
        value={filters.projeto}
        onValueChange={(v) => onFiltersChange({ ...filters, projeto: v })}
      >
        <SelectTrigger className="bg-card border-border h-8 text-xs w-[140px]">
          <SelectValue placeholder="Projeto" />
        </SelectTrigger>
        <SelectContent className="bg-card border-border z-50">
          <SelectItem value="todos">Todos os projetos</SelectItem>
          {projetos.map((p) => (
            <SelectItem key={p.id} value={p.id}>{p.titulo}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.responsavel}
        onValueChange={(v) => onFiltersChange({ ...filters, responsavel: v })}
      >
        <SelectTrigger className="bg-card border-border h-8 text-xs w-[140px]">
          <SelectValue placeholder="Responsável" />
        </SelectTrigger>
        <SelectContent className="bg-card border-border z-50">
          <SelectItem value="todos">Todos</SelectItem>
          {membros.map((m) => (
            <SelectItem key={m.user_id} value={m.user_id}>{m.nome}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className={cn("h-8 text-xs bg-card border-border px-2.5", !filters.dataInicio && "text-muted-foreground")}>
            <CalendarIcon className="mr-1.5 h-3.5 w-3.5" />
            {filters.dataInicio ? format(filters.dataInicio, "dd/MM/yy", { locale: ptBR }) : "Início"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 z-50" align="start">
          <Calendar mode="single" selected={filters.dataInicio} onSelect={(d) => onFiltersChange({ ...filters, dataInicio: d })} initialFocus className="p-3 pointer-events-auto" />
        </PopoverContent>
      </Popover>

      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className={cn("h-8 text-xs bg-card border-border px-2.5", !filters.dataFim && "text-muted-foreground")}>
            <CalendarIcon className="mr-1.5 h-3.5 w-3.5" />
            {filters.dataFim ? format(filters.dataFim, "dd/MM/yy", { locale: ptBR }) : "Fim"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 z-50" align="start">
          <Calendar mode="single" selected={filters.dataFim} onSelect={(d) => onFiltersChange({ ...filters, dataFim: d })} initialFocus className="p-3 pointer-events-auto" />
        </PopoverContent>
      </Popover>

      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={clearFilters} className="h-8 text-[11px] text-muted-foreground px-2">
          <X className="h-3 w-3 mr-1" />
          Limpar
        </Button>
      )}
    </div>
  );
}
