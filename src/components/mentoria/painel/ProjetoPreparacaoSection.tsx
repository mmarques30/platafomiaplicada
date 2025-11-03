import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ProjetoPreparacaoCard } from "../ProjetoPreparacaoCard";
import { formatProjetoTitulo } from "@/lib/utils";

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
  const temConteudo = 
    (projeto.trilhas_recomendadas && Array.isArray(projeto.trilhas_recomendadas) && projeto.trilhas_recomendadas.length > 0) ||
    (projeto.modulos_obrigatorios && Array.isArray(projeto.modulos_obrigatorios) && projeto.modulos_obrigatorios.length > 0);

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
              Configure trilhas e módulos recomendados na área administrativa
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
