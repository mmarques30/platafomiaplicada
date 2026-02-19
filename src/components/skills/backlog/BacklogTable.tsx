import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import type { BacklogItem } from "@/hooks/useSkillsBacklog";

const statusLabels: Record<string, string> = {
  levantado: "Levantado",
  aprovado: "Aprovado",
  nao_aprovado: "Não Aprovado",
  backlog: "Backlog",
  priorizado: "Priorizado",
  em_execucao: "Em Execução",
  entregue: "Entregue",
};

const statusColors: Record<string, string> = {
  levantado: "",
  aprovado: "bg-blue-500/15 text-blue-700 border-blue-200",
  nao_aprovado: "bg-destructive/15 text-destructive border-destructive/30",
  backlog: "bg-amber-500/15 text-amber-700 border-amber-200",
  priorizado: "bg-indigo-500/15 text-indigo-700 border-indigo-200",
  em_execucao: "bg-[#9EB038]/15 text-[#738925] border-[#9EB038]/30",
  entregue: "bg-emerald-500/15 text-emerald-700 border-emerald-200",
};

const prioridadeCores: Record<string, string> = {
  p1: "bg-red-500/15 text-red-700 border-red-200",
  p2: "bg-[#9EB038]/15 text-[#738925] border-[#9EB038]/30",
  p3: "bg-[#9EB038]/10 text-[#9EB038] border-[#9EB038]/20",
  alta: "bg-red-500/15 text-red-700 border-red-200",
  media: "bg-[#9EB038]/15 text-[#738925] border-[#9EB038]/30",
  baixa: "bg-[#9EB038]/10 text-[#9EB038] border-[#9EB038]/20",
};

interface BacklogTableProps {
  items: BacklogItem[];
  onItemClick: (item: BacklogItem) => void;
}

export default function BacklogTable({ items, onItemClick }: BacklogTableProps) {
  return (
    <div className="rounded-xl border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Título</TableHead>
            <TableHead>Área</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Prioridade</TableHead>
            <TableHead>Responsável</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                Nenhum projeto no backlog
              </TableCell>
            </TableRow>
          )}
          {items.map(item => (
            <TableRow key={item.id} className="cursor-pointer hover:bg-muted/50" onClick={() => onItemClick(item)}>
              <TableCell className="font-medium max-w-[250px]">
                <span className="truncate">{item.titulo}</span>
              </TableCell>
              <TableCell className="text-muted-foreground text-sm">{item.area_impactada || "—"}</TableCell>
              <TableCell>
                <Badge variant="outline" className={cn("text-xs", statusColors[item.status || "levantado"])}>
                  {statusLabels[item.status || "levantado"] || item.status}
                </Badge>
              </TableCell>
              <TableCell>
                {item.prioridade && (
                  <Badge variant="outline" className={cn("text-xs", prioridadeCores[item.prioridade])}>
                    {item.prioridade.toUpperCase()}
                  </Badge>
                )}
              </TableCell>
              <TableCell>
                {item.responsavel || item.colaborador ? (
                  <div className="flex items-center gap-1.5">
                    <div className="flex -space-x-1.5">
                      {item.responsavel && (
                        <Avatar className="h-5 w-5 border-2 border-background">
                          <AvatarImage src={item.responsavel.avatar_url || ""} />
                          <AvatarFallback className="text-[8px]">{item.responsavel.nome?.substring(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                      )}
                      {item.colaborador && (
                        <Avatar className="h-5 w-5 border-2 border-background">
                          <AvatarImage src={item.colaborador.avatar_url || ""} />
                          <AvatarFallback className="text-[8px]">{item.colaborador.nome?.substring(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                    <span className="text-sm truncate max-w-[120px]">
                      {item.responsavel?.nome || ""}{item.responsavel && item.colaborador ? " + 1" : item.colaborador?.nome || ""}
                    </span>
                  </div>
                ) : (
                  <span className="text-muted-foreground text-sm">—</span>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
