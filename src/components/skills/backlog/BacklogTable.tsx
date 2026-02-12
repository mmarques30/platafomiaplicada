import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import type { BacklogItem } from "@/hooks/useSkillsBacklog";

const statusLabels: Record<string, string> = {
  levantado: "Levantado",
  em_andamento: "Em Andamento",
  concluido: "Concluído",
  descartado: "Descartado",
};

const prioridadeCores: Record<string, string> = {
  alta: "bg-red-500/15 text-red-700 border-red-200",
  media: "bg-yellow-500/15 text-yellow-700 border-yellow-200",
  baixa: "bg-green-500/15 text-green-700 border-green-200",
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
            <TableHead className="text-right">Economia (h/sem)</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                Nenhum projeto no backlog
              </TableCell>
            </TableRow>
          )}
          {items.map(item => (
            <TableRow key={item.id} className="cursor-pointer hover:bg-muted/50" onClick={() => onItemClick(item)}>
              <TableCell className="font-medium max-w-[250px]">
                <div className="flex items-center gap-1.5">
                  {item.origem === "ia" && <Zap className="h-3 w-3 text-amber-500 shrink-0" />}
                  <span className="truncate">{item.titulo}</span>
                </div>
              </TableCell>
              <TableCell className="text-muted-foreground text-sm">{item.area_impactada || "—"}</TableCell>
              <TableCell>
                <Badge variant="outline" className="text-xs">{statusLabels[item.status || "levantado"] || item.status}</Badge>
              </TableCell>
              <TableCell>
                {item.prioridade && (
                  <Badge variant="outline" className={cn("text-xs", prioridadeCores[item.prioridade])}>
                    {item.prioridade.toUpperCase()}
                  </Badge>
                )}
              </TableCell>
              <TableCell>
                {item.responsavel ? (
                  <div className="flex items-center gap-1.5">
                    <Avatar className="h-5 w-5">
                      <AvatarImage src={item.responsavel.avatar_url || ""} />
                      <AvatarFallback className="text-[8px]">{item.responsavel.nome?.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm truncate max-w-[120px]">{item.responsavel.nome}</span>
                  </div>
                ) : (
                  <span className="text-muted-foreground text-sm">—</span>
                )}
              </TableCell>
              <TableCell className="text-right font-medium">{item.horas_estimadas_economia ?? "—"}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
