import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ProjetoPreparacaoCard } from "../ProjetoPreparacaoCard";
import { formatProjetoTitulo } from "@/lib/utils";
import { Clock, BookOpen, RefreshCw, Loader2 } from "lucide-react";
import { useUserRole } from "@/hooks/useUserRole";
import { useAtualizarConteudosProjeto } from "@/hooks/useAtualizarConteudosProjeto";
import { cn } from "@/lib/utils";
import { getPainelTheme } from "./painelTheme";

interface ProjetoPreparacaoSectionProps {
  projeto: any;
  userId: string;
  isBusiness?: boolean;
}

const STATUS_LABELS: Record<string, string> = {
  planejamento: "Planejamento",
  em_andamento: "Em Andamento",
  em_revisao: "Em Revisão",
  concluido: "Concluído",
  cancelado: "Cancelado"
};

export const ProjetoPreparacaoSection = ({ projeto, userId, isBusiness = false }: ProjetoPreparacaoSectionProps) => {
  const { isAdmin } = useUserRole();
  const { atualizarConteudos, isLoading: isAtualizando } = useAtualizarConteudosProjeto();
  const theme = getPainelTheme(isBusiness);

  // Verificar se o projeto tem conteúdo de preparação
  const trilhasRecomendadas = projeto.trilhas_recomendadas && Array.isArray(projeto.trilhas_recomendadas) 
    ? projeto.trilhas_recomendadas 
    : [];
  const modulosObrigatorios = projeto.modulos_obrigatorios && Array.isArray(projeto.modulos_obrigatorios) 
    ? projeto.modulos_obrigatorios 
    : [];
  
  const temConteudo = trilhasRecomendadas.length > 0 || modulosObrigatorios.length > 0;
  
  // Contar conteúdos disponíveis e em breve
  const trilhasDisponiveis = trilhasRecomendadas.filter((t: any) => t.status === 'disponivel');
  const trilhasEmBreve = trilhasRecomendadas.filter((t: any) => t.status === 'em_breve');
  const modulosDisponiveis = modulosObrigatorios.filter((m: any) => m.status === 'disponivel');
  const modulosEmBreve = modulosObrigatorios.filter((m: any) => m.status === 'em_breve');

  const handleAtualizarConteudos = async () => {
    await atualizarConteudos(projeto.id);
  };

  return (
    <div className={cn(
      "border-l-4 p-6 rounded-lg space-y-4",
      isBusiness 
        ? "border-l-violet-500/50 bg-white/5" 
        : "border-l-primary bg-card/50"
    )}>
      {/* Header do Projeto */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div className="flex-1">
          <h3 className={cn("text-lg font-semibold mb-2", theme.textPrimary)}>
            {formatProjetoTitulo(projeto.titulo)}
          </h3>
          <div className="flex items-center gap-3 text-sm flex-wrap">
            <Badge 
              variant="outline" 
              className={cn(
                "capitalize",
                isBusiness && "border-white/20 text-slate-300"
              )}
            >
              {STATUS_LABELS[projeto.status] || projeto.status}
            </Badge>
            {projeto.data_entrega && (
              <span className={theme.textMuted}>
                Entrega: {format(new Date(projeto.data_entrega), 'dd/MM/yyyy', { locale: ptBR })}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Resumo de Conteúdos */}
      {temConteudo && (
        <div className="flex items-center gap-4 flex-wrap text-sm">
          {(trilhasDisponiveis.length > 0 || modulosDisponiveis.length > 0) && (
            <div className={cn(
              "flex items-center gap-1",
              isBusiness ? "text-emerald-400" : "text-green-700"
            )}>
              <BookOpen className="h-4 w-4" />
              <span>{trilhasDisponiveis.length} trilha(s), {modulosDisponiveis.length} módulo(s) disponíveis</span>
            </div>
          )}
          {(trilhasEmBreve.length > 0 || modulosEmBreve.length > 0) && (
            <div className={cn(
              "flex items-center gap-1",
              isBusiness ? "text-amber-400" : "text-amber-700"
            )}>
              <Clock className="h-4 w-4" />
              <span>{trilhasEmBreve.length + modulosEmBreve.length} conteúdo(s) em breve</span>
            </div>
          )}
        </div>
      )}

      {/* Conteúdos Recomendados */}
      <div className={cn(
        "pl-4 border-l-2 space-y-3",
        isBusiness ? "border-white/10" : "border-muted"
      )}>
        <h4 className={cn("text-sm font-medium", theme.textPrimary)}>
          Conteúdos de Preparação
        </h4>
        {temConteudo ? (
          <ProjetoPreparacaoCard projetoId={projeto.id} userId={userId} />
        ) : (
          <div className={cn(
            "rounded-lg p-4 text-center border border-dashed",
            isBusiness 
              ? "bg-white/3 border-white/10" 
              : "bg-muted/50 border-muted-foreground/20"
          )}>
            <p className={cn("text-sm", theme.textMuted)}>
              Nenhum conteúdo de preparação associado a este projeto ainda
            </p>
            <p className={cn("text-xs mt-1", theme.textMuted)}>
              A IA associará conteúdos automaticamente ao gerar o diagnóstico
            </p>
            {isAdmin && (
              <Button
                variant="outline"
                size="sm"
                className={cn("mt-3", isBusiness && theme.buttonOutline)}
                onClick={handleAtualizarConteudos}
                disabled={isAtualizando}
              >
                {isAtualizando ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Atualizando...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Atualizar Conteúdos com IA
                  </>
                )}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
