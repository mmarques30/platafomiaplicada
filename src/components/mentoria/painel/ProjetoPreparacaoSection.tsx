import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ProjetoPreparacaoCard } from "../ProjetoPreparacaoCard";
import { formatProjetoTitulo } from "@/lib/utils";
import { Clock, BookOpen } from "lucide-react";

interface ProjetoPreparacaoSectionProps {
  projeto: any;
  userId: string;
}

const STATUS_LABELS: Record<string, string> = {
  planejamento: "Planejamento",
  em_andamento: "Em Andamento",
  em_revisao: "Em Revisão",
  concluido: "Concluído",
  cancelado: "Cancelado"
};

export const ProjetoPreparacaoSection = ({ projeto, userId }: ProjetoPreparacaoSectionProps) => {
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

  return (
    <div className="border-l-4 border-l-primary bg-card/50 p-6 rounded-lg space-y-4">
      {/* Header do Projeto */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-foreground mb-2">
            {formatProjetoTitulo(projeto.titulo)}
          </h3>
          <div className="flex items-center gap-3 text-sm text-muted-foreground flex-wrap">
            <Badge variant="outline" className="capitalize">
              {STATUS_LABELS[projeto.status] || projeto.status}
            </Badge>
            {projeto.data_entrega && (
              <span>
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
            <div className="flex items-center gap-1 text-green-700">
              <BookOpen className="h-4 w-4" />
              <span>{trilhasDisponiveis.length} trilha(s), {modulosDisponiveis.length} módulo(s) disponíveis</span>
            </div>
          )}
          {(trilhasEmBreve.length > 0 || modulosEmBreve.length > 0) && (
            <div className="flex items-center gap-1 text-amber-700">
              <Clock className="h-4 w-4" />
              <span>{trilhasEmBreve.length + modulosEmBreve.length} conteúdo(s) em breve</span>
            </div>
          )}
        </div>
      )}

      {/* Conteúdos Recomendados */}
      <div className="pl-4 border-l-2 border-muted space-y-3">
        <h4 className="text-sm font-medium text-foreground">
          Conteúdos de Preparação
        </h4>
        {temConteudo ? (
          <ProjetoPreparacaoCard projetoId={projeto.id} userId={userId} />
        ) : (
          <div className="bg-muted/50 rounded-lg p-4 text-center border border-dashed border-muted-foreground/20">
            <p className="text-sm text-muted-foreground">
              Nenhum conteúdo de preparação associado a este projeto ainda
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              A IA associará conteúdos automaticamente ao gerar o diagnóstico
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
