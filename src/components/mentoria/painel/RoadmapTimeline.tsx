import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { PainelCard, PainelCardHeader } from "./PainelCard";
import { getPainelTheme } from "./painelTheme";

interface Props {
  sessoes: Array<{
    id: string;
    titulo: string;
    data_sessao: string;
    status: string;
    notas?: string;
  }>;
  isBusiness?: boolean;
}

export const RoadmapTimeline = ({ sessoes, isBusiness = false }: Props) => {
  if (!sessoes || sessoes.length === 0) return null;

  const theme = getPainelTheme(isBusiness);

  // Agrupar sessões por mês
  const sessoesPorMes = sessoes.reduce((acc, sessao) => {
    const mes = format(new Date(sessao.data_sessao), "MMMM yyyy", { locale: ptBR });
    if (!acc[mes]) {
      acc[mes] = [];
    }
    acc[mes].push(sessao);
    return acc;
  }, {} as Record<string, typeof sessoes>);

  return (
    <PainelCard isBusiness={isBusiness}>
      <PainelCardHeader 
        title="Roadmap e Timeline" 
        isBusiness={isBusiness}
      />
      
      {/* Desktop: Timeline vertical */}
      <div className="hidden md:block">
        <div className="relative">
          {/* Linha vertical */}
          <div className={cn(
            "absolute left-4 top-0 bottom-0 w-0.5",
            isBusiness ? "bg-white/12" : "bg-border"
          )} />

          {Object.entries(sessoesPorMes).map(([mes, sessoesMes], mesIndex) => (
            <div key={mes} className="relative mb-8">
              {/* Círculo do mês */}
              <div className="flex items-center mb-4">
                <div className={cn(
                  "relative z-10 w-8 h-8 rounded-full flex items-center justify-center",
                  isBusiness ? "bg-violet-500/30 ring-2 ring-violet-500/50" : "bg-aplicada-green-900"
                )}>
                  <span className={cn(
                    "font-bold text-sm",
                    isBusiness ? "text-violet-300" : "text-white"
                  )}>
                    {mesIndex + 1}
                  </span>
                </div>
                <h3 className={cn(
                  "ml-4 text-lg font-bold capitalize",
                  theme.textPrimary
                )}>
                  {mes}
                </h3>
              </div>

              {/* Sessões do mês */}
              <div className="ml-12 space-y-3">
                {sessoesMes.map((sessao) => (
                  <div 
                    key={sessao.id} 
                    className={cn(
                      "rounded-xl border p-4 transition-all",
                      isBusiness 
                        ? "bg-white/5 border-white/10 hover:bg-white/8" 
                        : "bg-muted border-border"
                    )}
                  >
                    <h4 className={cn("font-semibold mb-1", theme.textSecondary)}>
                      {sessao.titulo}
                    </h4>
                    <p className={cn("text-sm", theme.textMuted)}>
                      {format(new Date(sessao.data_sessao), "dd 'de' MMMM", { locale: ptBR })}
                    </p>
                    {sessao.notas && (
                      <p className={cn("text-sm mt-2", theme.textSecondary)}>
                        {sessao.notas}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mobile: Accordion */}
      <div className="md:hidden">
        <Accordion type="single" collapsible className="w-full space-y-2">
          {Object.entries(sessoesPorMes).map(([mes, sessoesMes], mesIndex) => (
            <AccordionItem 
              key={mes} 
              value={mes}
              className={cn(
                "border rounded-xl overflow-hidden",
                isBusiness ? "border-white/10" : "border-border"
              )}
            >
              <AccordionTrigger 
                className={cn(
                  "text-left font-semibold px-4 py-3 transition-colors",
                  isBusiness 
                    ? "bg-white/5 hover:bg-white/8 text-slate-100" 
                    : "bg-muted hover:bg-muted/80 text-card-foreground"
                )}
              >
                <span className="flex items-center gap-2">
                  <span className={cn(
                    "w-6 h-6 rounded-full flex items-center justify-center text-sm",
                    isBusiness ? "bg-violet-500/30 text-violet-300" : "bg-aplicada-green-900 text-white"
                  )}>
                    {mesIndex + 1}
                  </span>
                  <span className="capitalize">{mes}</span>
                </span>
              </AccordionTrigger>
              <AccordionContent 
                className={cn(
                  "px-4 py-4",
                  isBusiness ? "bg-white/3" : "bg-card"
                )}
              >
                <div className="space-y-3">
                  {sessoesMes.map((sessao) => (
                    <div 
                      key={sessao.id} 
                      className={cn(
                        "border-l-2 pl-3",
                        isBusiness ? "border-violet-500/50" : "border-aplicada-green-900"
                      )}
                    >
                      <h4 className={cn("font-semibold", theme.textSecondary)}>
                        {sessao.titulo}
                      </h4>
                      <p className={cn("text-sm", theme.textMuted)}>
                        {format(new Date(sessao.data_sessao), "dd 'de' MMMM", { locale: ptBR })}
                      </p>
                      {sessao.notas && (
                        <p className={cn("text-sm mt-1", theme.textSecondary)}>
                          {sessao.notas}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </PainelCard>
  );
};
