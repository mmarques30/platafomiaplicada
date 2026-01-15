import { PainelCard, PainelCardHeader } from "./PainelCard";
import { getPainelTheme } from "./painelTheme";
import { cn } from "@/lib/utils";

interface Props {
  objetivos: Array<{
    id: string;
    objetivo: string;
    status: string;
    prazo?: string;
  }>;
  isBusiness?: boolean;
}

export const ObjetivosEstrategicos = ({ objetivos, isBusiness = false }: Props) => {
  if (!objetivos || objetivos.length === 0) return null;
  
  const theme = getPainelTheme(isBusiness);

  return (
    <PainelCard isBusiness={isBusiness}>
      <PainelCardHeader 
        title="Objetivos Estratégicos" 
        isBusiness={isBusiness}
      />
      <div className="space-y-3">
        {objetivos.slice(0, 6).map((objetivo, index) => (
          <div
            key={objetivo.id}
            className={cn(
              "flex items-start gap-4 p-4 rounded-lg border transition-all duration-200",
              isBusiness 
                ? "border-white/10 bg-white/5 hover:bg-white/10 hover:border-violet-500/30" 
                : "border-border bg-muted hover:shadow-md hover:border-primary"
            )}
          >
            <div className={cn(
              "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm",
              isBusiness 
                ? "bg-violet-500/20 text-violet-300" 
                : "bg-aplicada-green-900 text-white"
            )}>
              {index + 1}
            </div>
            <div className="flex-1">
              <p className={cn(
                "font-semibold text-base leading-relaxed",
                theme.textPrimary
              )}>
                {objetivo.objetivo}
              </p>
              {objetivo.prazo && (
                <p className={cn("text-sm mt-2 font-medium", theme.textMuted)}>
                  Prazo: {new Date(objetivo.prazo).toLocaleDateString('pt-BR')}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </PainelCard>
  );
};
