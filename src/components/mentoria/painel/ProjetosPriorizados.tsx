import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatProjetoTitulo } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { PainelCard, PainelCardHeader } from "./PainelCard";
import { getPainelTheme } from "./painelTheme";

interface Props {
  projetos: Array<{
    id: string;
    titulo: string;
    descricao: string;
    status: string;
    objetivo_projeto: string;
    data_entrega?: string;
  }>;
  isBusiness?: boolean;
}

export const ProjetosPriorizados = ({ projetos, isBusiness = false }: Props) => {
  if (!projetos || projetos.length === 0) return null;

  const theme = getPainelTheme(isBusiness);

  const getComplexityBadge = (index: number) => {
    if (isBusiness) {
      if (index === 0) return <Badge className="bg-red-500/20 text-red-300 border-red-500/30 hover:bg-red-500/30">Alta</Badge>;
      if (index <= 2) return <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 hover:bg-amber-500/30">Média</Badge>;
      return <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/30">Baixa</Badge>;
    }
    if (index === 0) return <Badge variant="complexity-high">Alta</Badge>;
    if (index <= 2) return <Badge variant="complexity-medium">Média</Badge>;
    return <Badge variant="complexity-low">Baixa</Badge>;
  };

  return (
    <PainelCard isBusiness={isBusiness}>
      <PainelCardHeader 
        title="Projetos Priorizados" 
        isBusiness={isBusiness}
      />
      
      {/* Desktop: Tabela */}
      <div className="hidden md:block overflow-x-auto">
        <div className={cn(
          "rounded-xl overflow-hidden border",
          isBusiness ? "border-white/10" : "border-border"
        )}>
          <Table>
            <TableHeader>
              <TableRow className={cn(
                isBusiness 
                  ? "bg-white/6 hover:bg-white/6 border-b border-white/10" 
                  : "bg-primary hover:bg-primary"
              )}>
                <TableHead className={cn(
                  "font-bold",
                  isBusiness ? "text-slate-200" : "text-primary-foreground"
                )}>#</TableHead>
                <TableHead className={cn(
                  "font-bold",
                  isBusiness ? "text-slate-200" : "text-primary-foreground"
                )}>Projeto</TableHead>
                <TableHead className={cn(
                  "font-bold",
                  isBusiness ? "text-slate-200" : "text-primary-foreground"
                )}>Objetivo</TableHead>
                <TableHead className={cn(
                  "font-bold",
                  isBusiness ? "text-slate-200" : "text-primary-foreground"
                )}>Complexidade</TableHead>
                <TableHead className={cn(
                  "font-bold",
                  isBusiness ? "text-slate-200" : "text-primary-foreground"
                )}>Prazo</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projetos.map((projeto, index) => (
                <TableRow 
                  key={projeto.id}
                  className={cn(
                    "transition-colors",
                    isBusiness 
                      ? index % 2 === 0 
                        ? "bg-transparent hover:bg-white/5" 
                        : "bg-white/2 hover:bg-white/5"
                      : index % 2 === 0 
                        ? "bg-card hover:bg-muted" 
                        : "bg-muted hover:bg-muted/80"
                  )}
                >
                  <TableCell className={cn("font-bold", theme.textSecondary)}>
                    {index + 1}
                  </TableCell>
                  <TableCell className={cn("font-semibold", theme.textSecondary)}>
                    {formatProjetoTitulo(projeto.titulo)}
                  </TableCell>
                  <TableCell className={theme.textSecondary}>
                    {projeto.objetivo_projeto}
                  </TableCell>
                  <TableCell>{getComplexityBadge(index)}</TableCell>
                  <TableCell className={cn("font-medium", theme.textSecondary)}>
                    {projeto.data_entrega 
                      ? new Date(projeto.data_entrega).toLocaleDateString('pt-BR')
                      : "A definir"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Mobile: Cards */}
      <div className="md:hidden space-y-3">
        {projetos.map((projeto, index) => (
          <div 
            key={projeto.id} 
            className={cn(
              "rounded-xl border p-4",
              isBusiness ? "bg-white/5 border-white/10" : "bg-card border-border"
            )}
          >
            <div className="flex items-start gap-3 mb-3">
              <span className={cn(
                "flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold",
                isBusiness ? "bg-violet-500/30 text-violet-300" : "bg-aplicada-green-900 text-white"
              )}>
                {index + 1}
              </span>
              <h3 className={cn("font-semibold flex-1", theme.textSecondary)}>
                {formatProjetoTitulo(projeto.titulo)}
              </h3>
            </div>
            <div className="space-y-2 text-sm">
              <div>
                <span className={cn("font-medium", theme.textMuted)}>Objetivo:</span>
                <p className={cn("mt-1", theme.textSecondary)}>{projeto.objetivo_projeto}</p>
              </div>
              <div className="flex items-center justify-between">
                <span className={cn("font-medium", theme.textMuted)}>Complexidade:</span>
                {getComplexityBadge(index)}
              </div>
              {projeto.data_entrega && (
                <div>
                  <span className={cn("font-medium", theme.textMuted)}>Prazo:</span>
                  <p className={cn("mt-1 font-medium", theme.textSecondary)}>
                    {new Date(projeto.data_entrega).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Impacto Total */}
      <div className={cn(
        "mt-6 rounded-xl border p-6",
        isBusiness 
          ? "bg-gradient-to-r from-violet-500/15 to-transparent border-white/10" 
          : "bg-muted border-border"
      )}>
        <h3 className={cn("text-lg font-bold mb-2", theme.textPrimary)}>
          Impacto Total Estimado
        </h3>
        <p className={cn(
          "text-2xl font-bold",
          isBusiness ? "text-violet-400" : "text-aplicada-green-900"
        )}>
          {projetos.length} projeto{projetos.length !== 1 ? 's' : ''} priorizados
        </p>
      </div>
    </PainelCard>
  );
};
