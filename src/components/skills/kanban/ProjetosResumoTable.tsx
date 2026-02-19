import { useMemo } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

interface ProjetoAggregated {
  id: string;
  titulo: string;
  status: string | null;
  entregasCount: number;
  subtarefasCount: number;
  
}

interface ProjetosResumoTableProps {
  projetos: any[];
  entregasEquipe: any[];
  onVerMais: () => void;
  maxRows?: number;
}

const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
  levantado: { label: "Levantado", variant: "outline" },
  backlog: { label: "Backlog", variant: "outline" },
  aprovado: { label: "Aprovado", variant: "default" },
  nao_aprovado: { label: "Não Aprovado", variant: "destructive" },
  priorizado: { label: "Priorizado", variant: "secondary" },
  em_execucao: { label: "Em Execução", variant: "default" },
  entregue: { label: "Entregue", variant: "default" },
};


export default function ProjetosResumoTable({ projetos, entregasEquipe, onVerMais, maxRows = 5 }: ProjetosResumoTableProps) {
  const aggregated = useMemo<ProjetoAggregated[]>(() => {
    return projetos.map((p: any) => {
      const entregas = entregasEquipe.filter((e: any) => e.projeto_id === p.id);
      const subtarefasCount = entregas.reduce(
        (sum: number, e: any) => sum + (e.subtarefas_entregas_skills?.length ?? 0),
        0
      );
      return {
        id: p.id,
        titulo: p.titulo,
        status: p.status,
        entregasCount: entregas.length,
        subtarefasCount,
      };
    });
  }, [projetos, entregasEquipe]);

  const visible = aggregated.slice(0, maxRows);
  const hasMore = aggregated.length > maxRows;

  if (aggregated.length === 0) return null;

  return (
    <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
      <div className="px-5 py-3 border-b border-border flex items-center justify-between">
        <span className="text-sm font-semibold text-foreground">Visão Geral dos Projetos</span>
        <span className="text-[11px] text-muted-foreground">{aggregated.length} projeto{aggregated.length !== 1 ? "s" : ""}</span>
      </div>
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="text-[11px] font-medium text-muted-foreground">Projeto</TableHead>
            <TableHead className="text-[11px] font-medium text-muted-foreground">Status</TableHead>
            <TableHead className="text-[11px] font-medium text-muted-foreground text-center">Entregas</TableHead>
            <TableHead className="text-[11px] font-medium text-muted-foreground text-center">Subtarefas</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {visible.map((p) => {
            const status = statusMap[p.status ?? ""] || { label: p.status ?? "—", variant: "outline" as const };

            return (
              <TableRow key={p.id} className="group">
                <TableCell className="text-sm font-medium text-foreground max-w-[220px] truncate">
                  {p.titulo}
                </TableCell>
                <TableCell>
                  <Badge variant={status.variant} className="text-[10px] font-medium">
                    {status.label}
                  </Badge>
                </TableCell>
                <TableCell className="text-center">
                  <span className="text-xs font-semibold text-foreground">{p.entregasCount}</span>
                </TableCell>
                <TableCell className="text-center">
                  <span className="text-xs font-semibold text-foreground">{p.subtarefasCount}</span>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      {hasMore && (
        <div className="px-5 py-3 border-t border-border flex justify-center">
          <Button variant="ghost" size="sm" onClick={onVerMais} className="text-xs gap-1.5 hover:text-[#9EB038]">
            Ver todos os projetos
            <ArrowRight size={14} />
          </Button>
        </div>
      )}
    </div>
  );
}
