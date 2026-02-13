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
    <div className="rounded-xl border border-[#9EB038]/20 bg-[#9EB038]/15 border-l-4 border-l-[#9EB038] p-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
        {/* Projeto */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-[#3a3a3a]">Projeto</label>
          <Select
            value={filters.projeto}
            onValueChange={(v) => onFiltersChange({ ...filters, projeto: v })}
          >
            <SelectTrigger className="bg-card border-border">
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent className="bg-card border-border z-50">
              <SelectItem value="todos">Todos</SelectItem>
              {projetos.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.titulo}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Responsável */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-[#3a3a3a]">Responsável</label>
          <Select
            value={filters.responsavel}
            onValueChange={(v) => onFiltersChange({ ...filters, responsavel: v })}
          >
            <SelectTrigger className="bg-card border-border">
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent className="bg-card border-border z-50">
              <SelectItem value="todos">Todos</SelectItem>
              {membros.map((m) => (
                <SelectItem key={m.user_id} value={m.user_id}>
                  {m.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Data início */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-[#3a3a3a]">Data Início</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal bg-card border-border",
                  !filters.dataInicio && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {filters.dataInicio
                  ? format(filters.dataInicio, "dd/MM/yyyy", { locale: ptBR })
                  : "Selecionar"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 z-50" align="start">
              <Calendar
                mode="single"
                selected={filters.dataInicio}
                onSelect={(d) => onFiltersChange({ ...filters, dataInicio: d })}
                initialFocus
                className={cn("p-3 pointer-events-auto")}
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Data fim */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-[#3a3a3a]">Data Fim</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal bg-card border-border",
                  !filters.dataFim && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {filters.dataFim
                  ? format(filters.dataFim, "dd/MM/yyyy", { locale: ptBR })
                  : "Selecionar"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 z-50" align="start">
              <Calendar
                mode="single"
                selected={filters.dataFim}
                onSelect={(d) => onFiltersChange({ ...filters, dataFim: d })}
                initialFocus
                className={cn("p-3 pointer-events-auto")}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {hasFilters && (
        <div className="mt-3 flex justify-end">
          <Button variant="ghost" size="sm" onClick={clearFilters} className="text-xs text-muted-foreground">
            <X className="h-3 w-3 mr-1" />
            Limpar filtros
          </Button>
        </div>
      )}
    </div>
  );
}
