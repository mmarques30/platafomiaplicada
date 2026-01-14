import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar, Target, CheckSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { PainelCard } from "./PainelCard";
import { getPainelTheme } from "./painelTheme";

interface Props {
  sessao?: {
    titulo: string;
    notas?: string;
    data_sessao: string;
  };
  isBusiness?: boolean;
}

export const ProximaSessao = ({ sessao, isBusiness = false }: Props) => {
  const theme = getPainelTheme(isBusiness);

  if (!sessao) {
    return (
      <PainelCard isBusiness={isBusiness}>
        <div className="text-center py-6">
          <Calendar className={cn("w-12 h-12 mx-auto mb-3", theme.accentColor)} />
          <p className={theme.textMuted}>Nenhuma sessão agendada no momento</p>
        </div>
      </PainelCard>
    );
  }

  return (
    <PainelCard isBusiness={isBusiness}>
      <div className="flex items-center gap-2 mb-6">
        <Calendar className={cn("w-6 h-6", theme.accentColor)} />
        <h2 className={cn("text-2xl font-bold tracking-tight", theme.textPrimary)}>
          Próxima Sessão
        </h2>
      </div>
      
      <div className="space-y-6">
        <div>
          <h3 className={cn("text-xl font-bold mb-2", theme.textPrimary)}>
            {sessao.titulo}
          </h3>
          <p className={cn("flex items-center gap-2", theme.textMuted)}>
            <Calendar className="w-4 h-4" />
            {format(new Date(sessao.data_sessao), "EEEE, dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}
          </p>
        </div>

        {sessao.notas && (
          <div>
            <h4 className={cn("font-semibold mb-2 flex items-center gap-2", theme.textPrimary)}>
              <Target className={cn("w-4 h-4", theme.accentColor)} />
              Objetivo
            </h4>
            <p className={cn("text-sm", theme.textSecondary)}>{sessao.notas}</p>
          </div>
        )}

        <div className={theme.separator} />

        <div>
          <h4 className={cn("font-semibold mb-3 flex items-center gap-2", theme.textPrimary)}>
            <CheckSquare className={cn("w-4 h-4", theme.accentColor)} />
            O que vamos fazer
          </h4>
          <div className="space-y-2">
            {[
              "Revisão do progresso desde a última sessão",
              "Discussão de desafios e oportunidades",
              "Planejamento das próximas ações",
              "Definição de metas e prazos",
            ].map((item, index) => (
              <div key={index} className="flex items-start gap-2 text-sm">
                <span className={cn(
                  "mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0",
                  isBusiness ? "bg-violet-400" : "bg-aplicada-green-900"
                )} />
                <p className={theme.textSecondary}>{item}</p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h4 className={cn("font-semibold mb-3", theme.textPrimary)}>
            Preparação necessária
          </h4>
          <div className="space-y-2">
            {[
              "Revisar objetivos definidos anteriormente",
              "Listar dúvidas ou bloqueios encontrados",
              "Preparar materiais ou projetos para discussão",
            ].map((item, index) => (
              <div key={index} className="flex items-start gap-2 text-sm">
                <span className={cn(
                  "mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0",
                  isBusiness ? "bg-violet-400" : "bg-aplicada-green-900"
                )} />
                <p className={cn("flex-1", theme.textSecondary)}>{item}</p>
              </div>
            ))}
          </div>
        </div>

        <div className={cn(
          "p-4 rounded-xl border",
          isBusiness 
            ? "bg-gradient-to-r from-violet-500/15 to-transparent border-white/10" 
            : "bg-muted border-border"
        )}>
          <h4 className={cn("font-semibold mb-2", theme.textPrimary)}>
            Resultado esperado
          </h4>
          <p className={cn("text-sm", theme.textSecondary)}>
            Clareza sobre os próximos passos e plano de ação detalhado para implementação
          </p>
        </div>
      </div>
    </PainelCard>
  );
};
