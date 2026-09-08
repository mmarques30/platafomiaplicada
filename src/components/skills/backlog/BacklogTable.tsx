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
  aprovado: "bg-status-info/15 text-status-info border-status-info/40",
  nao_aprovado: "bg-destructive/15 text-destructive border-destructive/30",
  backlog: "bg-status-warning/15 text-status-warning border-status-warning/40",
  priorizado: "bg-status-info/15 text-status-info border-status-info/40",
  em_execucao: "bg-primary/15 text-secondary border-primary/30",
  entregue: "bg-status-success/15 text-status-success border-status-success/40",
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
            <TableHead>Responsável</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.length === 0 && (
            <TableRow>
              <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
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
