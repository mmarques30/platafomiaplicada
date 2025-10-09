import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Sparkles, Download } from "lucide-react";
import { useFormulariosCustomizados, useRespostasFormulario, useAnalisarRespostas } from "@/hooks/useFormulariosCustomizados";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { AnaliseFormulario } from "@/types/formularios-customizados";

interface RespostasFormularioDrawerProps {
  formularioId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const RespostasFormularioDrawer = ({
  formularioId,
  open,
  onOpenChange,
}: RespostasFormularioDrawerProps) => {
  const [analise, setAnalise] = useState<AnaliseFormulario | null>(null);
  const { formularios } = useFormulariosCustomizados();
  const { respostas, isLoading } = useRespostasFormulario(formularioId);
  const analisarRespostas = useAnalisarRespostas();

  const formulario = formularios.find(f => f.id === formularioId);

  const handleGerarInsight = async () => {
    const resultado = await analisarRespostas.mutateAsync(formularioId);
    setAnalise(resultado);
  };

  if (!formulario) return null;

  const totalMentorados = formulario.visibilidade === "todos" 
    ? "Todos" 
    : formulario.mentorados_ids.length;
  const percentualResposta = formulario.visibilidade === "especificos"
    ? Math.round((respostas.length / formulario.mentorados_ids.length) * 100)
    : null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Respostas: {formulario.titulo}</SheetTitle>
          <div className="flex gap-2 mt-2">
            <Badge variant="secondary">
              {respostas.length} {formulario.visibilidade === "especificos" && `de ${totalMentorados}`} respostas
              {percentualResposta !== null && ` (${percentualResposta}%)`}
            </Badge>
          </div>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Botão de análise IA */}
          {respostas.length > 0 && (
            <div className="flex gap-2">
              <Button
                onClick={handleGerarInsight}
                disabled={analisarRespostas.isPending}
                variant="outline"
                className="flex-1"
              >
                {analisarRespostas.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analisando...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Gerar Insight IA
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Análise IA */}
          {analise && (
            <Card className="p-6 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Análise Inteligente
              </h3>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">• Resumo Geral</h4>
                  <p className="text-sm text-muted-foreground">{analise.resumo}</p>
                </div>

                <div>
                  <h4 className="font-medium mb-2">• Padrões Identificados</h4>
                  <p className="text-sm text-muted-foreground">{analise.padrao_geral}</p>
                </div>

                {analise.mentorados_atencao.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">• Atenção Necessária</h4>
                    <div className="space-y-2">
                      {analise.mentorados_atencao.map((m, i) => (
                        <div key={i} className="bg-background/50 p-3 rounded-lg">
                          <p className="font-medium text-sm">{m.nome}</p>
                          <p className="text-xs text-muted-foreground">{m.motivo}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <h4 className="font-medium mb-2">• Insights</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                    {analise.insights.map((insight, i) => (
                      <li key={i}>{insight}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium mb-2">➥ Recomendações</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                    {analise.recomendacoes.map((rec, i) => (
                      <li key={i}>{rec}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </Card>
          )}

          {/* Respostas por pergunta */}
          {isLoading ? (
            <div className="text-center py-8">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Carregando respostas...</p>
            </div>
          ) : respostas.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">
                Ainda não há respostas para este formulário
              </p>
            </Card>
          ) : (
            <div className="space-y-6">
              {formulario.perguntas_geradas.perguntas.map((pergunta, index) => (
                <Card key={pergunta.id} className="p-4">
                  <h4 className="font-medium mb-3">
                    {index + 1}. {pergunta.pergunta}
                  </h4>
                  
                  <div className="space-y-3">
                    {respostas.map((resposta: any) => {
                      const respostaData = resposta.respostas[pergunta.id];
                      if (!respostaData) return null;

                      return (
                        <div key={resposta.id} className="border-l-2 border-primary/30 pl-4 py-2">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-sm">
                              {resposta.profiles.nome_completo}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              ({format(new Date(respostaData.respondido_em), "dd/MM HH:mm", { locale: ptBR })})
                            </span>
                          </div>
                          <p className="text-sm">
                            {typeof respostaData.resposta === "object" 
                              ? JSON.stringify(respostaData.resposta)
                              : respostaData.resposta}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};
