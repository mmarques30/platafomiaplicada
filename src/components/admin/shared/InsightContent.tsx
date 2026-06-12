import { Target, Lightbulb, Wrench, BookOpen } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface InsightContentProps {
  insight: any;
}

/**
 * Renderiza o conteúdo do insight gerado pela IA (mesmo formato usado em
 * FormularioDetalhesDrawer e na visão admin do diagnóstico). Mostra:
 * projetos sugeridos, objetivos identificados, oportunidades e quaisquer
 * outros campos que vierem no JSON do insight_ia.
 *
 * Extraído de FormularioDetalhesDrawer pra ser reutilizado em DiagnosticoAdmin
 * (preview do que o mentorado está vendo).
 */
export function InsightContent({ insight }: InsightContentProps) {
  if (!insight || typeof insight !== "object") {
    return <p className="text-sm text-muted-foreground">{String(insight)}</p>;
  }

  const { projetos, objetivos, oportunidades, ...outros } = insight;

  return (
    <div className="space-y-4">
      {projetos && Array.isArray(projetos) && projetos.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold flex items-center gap-2 mb-2">
            <Target className="h-4 w-4 text-primary" />
            Projetos Sugeridos
          </h4>
          <div className="space-y-3">
            {projetos.map((projeto: any, idx: number) => (
              <div key={idx} className="border rounded-lg p-3 bg-background">
                <h5 className="font-medium text-sm">{projeto.titulo}</h5>
                {projeto.descricao && (
                  <p className="text-xs text-muted-foreground mt-1">{projeto.descricao}</p>
                )}
                {projeto.objetivo_projeto && (
                  <p className="text-xs mt-2">
                    <span className="font-medium">Objetivo:</span> {projeto.objetivo_projeto}
                  </p>
                )}
                {projeto.contribuicao_plano && (
                  <p className="text-xs mt-1">
                    <span className="font-medium">Contribuição:</span> {projeto.contribuicao_plano}
                  </p>
                )}
                <div className="flex flex-wrap gap-2 mt-2">
                  {projeto.ferramentas_projeto && Array.isArray(projeto.ferramentas_projeto) && (
                    <div className="flex items-center gap-1 text-xs">
                      <Wrench className="h-3 w-3 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        {projeto.ferramentas_projeto.map((f: any) => f?.nome ?? String(f)).join(", ")}
                      </span>
                    </div>
                  )}
                  {projeto.trilhas_recomendadas && Array.isArray(projeto.trilhas_recomendadas) && (
                    <div className="flex items-center gap-1 text-xs">
                      <BookOpen className="h-3 w-3 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        {projeto.trilhas_recomendadas.map((t: any) => t?.titulo ?? String(t)).join(", ")}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {objetivos && Array.isArray(objetivos) && objetivos.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold flex items-center gap-2 mb-2">
            <Target className="h-4 w-4 text-primary" />
            Objetivos Identificados
          </h4>
          <div className="space-y-2">
            {objetivos.map((obj: any, idx: number) => (
              <div key={idx} className="flex items-start gap-2 text-sm">
                <Badge variant="outline" className="text-xs shrink-0">
                  {obj.tipo || `#${idx + 1}`}
                </Badge>
                <span>{obj.objetivo || obj}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {oportunidades && Array.isArray(oportunidades) && oportunidades.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold flex items-center gap-2 mb-2">
            <Lightbulb className="h-4 w-4 text-primary" />
            Oportunidades
          </h4>
          <ul className="space-y-1">
            {oportunidades.map((op: any, idx: number) => (
              <li key={idx} className="text-sm flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>{typeof op === "string" ? op : op.descricao || JSON.stringify(op)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {Object.keys(outros).length > 0 && (
        <div className="pt-2 border-t">
          {Object.entries(outros).map(([key, value]: [string, any]) => (
            <div key={key} className="text-sm py-1">
              <span className="font-medium capitalize">{key.replace(/_/g, " ")}: </span>
              <span className="text-muted-foreground">
                {typeof value === "object" ? JSON.stringify(value) : String(value)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
