import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

interface ProjetosResumoTableProps {
  entregas: any[];
  onVerMais: () => void;
  maxRows?: number;
}

const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
  pendente: { label: "Backlog", variant: "outline" },
  em_andamento: { label: "Em Andamento", variant: "default" },
  aguardando_validacao: { label: "Validação", variant: "secondary" },
  concluido: { label: "Concluído", variant: "default" },
  aprovada: { label: "Aprovado", variant: "default" },
};

const prioridadeMap: Record<string, { label: string; color: string }> = {
  alta: { label: "P1", color: "#ef4444" },
  media: { label: "P2", color: "#f59e0b" },
  baixa: { label: "P3", color: "#9EB038" },
};

export default function ProjetosResumoTable({ entregas, onVerMais, maxRows = 5 }: ProjetosResumoTableProps) {
  const visibleEntregas = entregas.slice(0, maxRows);
  const hasMore = entregas.length > maxRows;

  if (entregas.length === 0) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
      <div className="px-5 py-3 border-b border-border flex items-center justify-between">
        <span className="text-sm font-semibold text-foreground">Visão Geral dos Projetos</span>
        <span className="text-[11px] text-muted-foreground">{entregas.length} projeto{entregas.length !== 1 ? "s" : ""}</span>
      </div>
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="text-[11px] font-medium text-muted-foreground">Projeto</TableHead>
            <TableHead className="text-[11px] font-medium text-muted-foreground">Status</TableHead>
            <TableHead className="text-[11px] font-medium text-muted-foreground">Prioridade</TableHead>
            <TableHead className="text-[11px] font-medium text-muted-foreground">Tipo</TableHead>
            <TableHead className="text-[11px] font-medium text-muted-foreground text-right">Progresso</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {visibleEntregas.map((e: any) => {
            const status = statusMap[e.status] || { label: e.status, variant: "outline" as const };
            const prioridade = prioridadeMap[e.prioridade] || { label: e.prioridade || "—", color: "#a1a1aa" };
            const tipo = e.tipo ?? "individual";

            return (
              <TableRow key={e.id} className="group">
                <TableCell className="text-sm font-medium text-foreground max-w-[220px] truncate">
                  {e.titulo}
                </TableCell>
                <TableCell>
                  <Badge variant={status.variant} className="text-[10px] font-medium">
                    {status.label}
                  </Badge>
                </TableCell>
                <TableCell>
                  <span
                    className="inline-flex items-center gap-1 text-[10px] font-bold"
                    style={{ color: prioridade.color }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: prioridade.color }} />
                    {prioridade.label}
                  </span>
                </TableCell>
                <TableCell>
                  <span className="text-xs text-muted-foreground capitalize">{tipo}</span>
                </TableCell>
                <TableCell className="text-right">
                  <span className="text-xs font-semibold text-foreground">{e.progresso ?? 0}%</span>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      {hasMore && (
        <div className="px-5 py-3 border-t border-border flex justify-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={onVerMais}
            className="text-xs gap-1.5 hover:text-[#9EB038]"
          >
            Ver todos os projetos
            <ArrowRight size={14} />
          </Button>
        </div>
      )}
    </div>
  );
}
