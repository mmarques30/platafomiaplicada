import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface Responsavel {
  id: string;
  nome: string;
  avatar_url: string | null;
}

export interface AdvancedFilters {
  status: string | null;
  tipo: string | null;
  responsavel: string | null;
  prioridade: string | null;
  meusProjetos: boolean;
}

interface KanbanFiltersAdvancedProps {
  filters: AdvancedFilters;
  onChange: (filters: AdvancedFilters) => void;
  responsaveis: Responsavel[];
}

export default function KanbanFiltersAdvanced({
  filters,
  onChange,
  responsaveis,
}: KanbanFiltersAdvancedProps) {
  const update = (partial: Partial<AdvancedFilters>) =>
    onChange({ ...filters, ...partial });

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Select
        value={filters.status ?? "todos"}
        onValueChange={(v) => update({ status: v === "todos" ? null : v })}
      >
        <SelectTrigger className="w-[140px] h-8 text-xs">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="todos">Todos Status</SelectItem>
          <SelectItem value="pendente">Backlog</SelectItem>
          <SelectItem value="em_andamento">Em Andamento</SelectItem>
          <SelectItem value="aguardando_validacao">Em Validação</SelectItem>
          <SelectItem value="concluido">Rodando</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={filters.tipo ?? "todos"}
        onValueChange={(v) => update({ tipo: v === "todos" ? null : v })}
      >
        <SelectTrigger className="w-[140px] h-8 text-xs">
          <SelectValue placeholder="Tipo" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="todos">Todos Tipos</SelectItem>
          <SelectItem value="individual">Individual</SelectItem>
          <SelectItem value="colaborativo">Colaborativo</SelectItem>
          <SelectItem value="sistema">Sistema</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={filters.responsavel ?? "todos"}
        onValueChange={(v) => update({ responsavel: v === "todos" ? null : v })}
      >
        <SelectTrigger className="w-[160px] h-8 text-xs">
          <SelectValue placeholder="Responsável" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="todos">Todos</SelectItem>
          {responsaveis.map((r) => (
            <SelectItem key={r.id} value={r.id}>
              {r.nome}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.prioridade ?? "todas"}
        onValueChange={(v) => update({ prioridade: v === "todas" ? null : v })}
      >
        <SelectTrigger className="w-[120px] h-8 text-xs">
          <SelectValue placeholder="Prioridade" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="todas">Todas</SelectItem>
          <SelectItem value="P1">P1</SelectItem>
          <SelectItem value="P2">P2</SelectItem>
          <SelectItem value="P3">P3</SelectItem>
        </SelectContent>
      </Select>

      <div className="flex items-center gap-2">
        <Switch
          id="meus-projetos"
          checked={filters.meusProjetos}
          onCheckedChange={(v) => update({ meusProjetos: v })}
        />
        <Label htmlFor="meus-projetos" className="text-xs cursor-pointer">
          Meus projetos
        </Label>
      </div>
    </div>
  );
}
