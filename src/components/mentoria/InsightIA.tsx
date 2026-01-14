import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Target, Rocket, AlertTriangle, Focus, Loader2, CheckCircle2, Wrench, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { EtapaEvolucao, Etapa } from "./EtapaEvolucao";

interface FerramentaPrioritaria {
  nome: string;
  categoria: string;
  motivo: string;
  nivel_prioridade: number;
  gratuito: boolean;
}

interface InsightIAProps {
  formulario: any;
  onInsightGerado?: () => void;
}

export function InsightIA({ formulario, onInsightGerado }: InsightIAProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const planoJaCriado = formulario?.plano_gerado;
  const insight = formulario?.insight_ia;

  const gerarInsight = async () => {
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('gerar-insight-mentoria', {
        body: { formulario_id: formulario.id }
      });

      if (error) throw error;
      
      toast({
        title: "Insight gerado com sucesso!",
        description: "Confira abaixo sua jornada de evolução personalizada"
      });

      if (onInsightGerado) {
        onInsightGerado();
      } else {
        window.location.reload();
      }
    } catch (error: any) {
      console.error("Erro ao gerar insight:", error);
      toast({
        title: "Erro ao gerar insight",
        description: error.message || "Tente novamente mais tarde",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Estado inicial - sem insight
  if (!insight) {
    return (
      <Card className="mt-6 border-aplicada-green/30 bg-gradient-to-br from-aplicada-dark to-aplicada-dark/90">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Sparkles className="text-aplicada-green h-6 w-6" />
            Sua Jornada de Evolução com IA
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-white/70">
            Gere sua jornada personalizada com etapas claras de evolução, ferramentas que deve dominar e trilhas para estudar.
          </p>
          <Button 
            onClick={gerarInsight} 
            disabled={isGenerating}
            size="lg"
            className="w-full sm:w-auto bg-aplicada-green hover:bg-aplicada-green/90 text-white"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Gerando sua jornada...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-5 w-5" />
                Gerar Minha Jornada com IA
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Verificar se tem etapas de evolução (novo formato)
  const etapasEvolucao = insight.etapas_evolucao as Etapa[] | undefined;
  const ferramentasPrioritarias = (insight.ferramentas_prioritarias as FerramentaPrioritaria[] | undefined) || [];

  // Novo layout com etapas de evolução
  if (etapasEvolucao && etapasEvolucao.length > 0) {
    return (
      <div className="mt-6 bg-aplicada-dark rounded-2xl p-6 md:p-8 border border-aplicada-green/20">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 bg-aplicada-green rounded-full shadow-lg shadow-aplicada-green/30">
            <TrendingUp className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Sua Jornada de Evolução</h2>
            <p className="text-aplicada-green">Etapas personalizadas para seu desenvolvimento em IA</p>
          </div>
        </div>

        {/* Ferramentas Prioritárias - Destaque */}
        {ferramentasPrioritarias.length > 0 && (
          <div className="mb-8 p-5 rounded-xl bg-gradient-to-r from-aplicada-green/20 to-aplicada-green/5 border border-aplicada-green/30">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Wrench className="h-5 w-5 text-aplicada-green" />
              Ferramentas de IA para Dominar
            </h3>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {ferramentasPrioritarias
                .sort((a, b) => a.nivel_prioridade - b.nivel_prioridade)
                .slice(0, 6)
                .map((ferramenta, i) => (
                  <div 
                    key={i} 
                    className="p-4 rounded-lg bg-aplicada-dark border border-aplicada-green/20 hover:border-aplicada-green/50 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge 
                          className={i === 0 ? "bg-aplicada-green text-white" : "bg-aplicada-green/20 text-aplicada-green"}
                        >
                          #{i + 1}
                        </Badge>
                        <span className="font-semibold text-white">{ferramenta.nome}</span>
                      </div>
                      {ferramenta.gratuito && (
                        <Badge variant="outline" className="text-xs bg-green-500/10 text-green-400 border-green-500/30">
                          Grátis
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-aplicada-green/70 mb-1">{ferramenta.categoria}</p>
                    <p className="text-sm text-white/70">{ferramenta.motivo}</p>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Timeline de Etapas */}
        <div className="space-y-0">
          {etapasEvolucao.map((etapa, index) => (
            <EtapaEvolucao 
              key={etapa.numero}
              etapa={etapa}
              isFirst={index === 0}
              isLast={index === etapasEvolucao.length - 1}
            />
          ))}
        </div>

        {/* Alerta de Sucesso */}
        {planoJaCriado && (
          <Alert className="mt-8 border-aplicada-green/30 bg-aplicada-green/10">
            <CheckCircle2 className="h-4 w-4 text-aplicada-green" />
            <AlertDescription className="text-white/90">
              <strong className="text-aplicada-green">Plano de mentoria criado!</strong>
              <p className="text-sm mt-1">
                Seus objetivos e projetos iniciais já estão disponíveis na seção de Mentoria.
              </p>
            </AlertDescription>
          </Alert>
        )}

        {/* Footer */}
        <div className="mt-8 pt-4 border-t border-aplicada-green/20">
          <p className="text-xs text-white/50 text-center">
            Jornada gerada em {new Date(formulario.insight_gerado_em).toLocaleDateString('pt-BR', {
              day: '2-digit',
              month: 'long',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
        </div>
      </div>
    );
  }

  // Layout legado (accordion) para insights antigos sem etapas_evolucao
  return (
    <Card className="mt-6 border-aplicada-green/30 bg-gradient-to-br from-aplicada-dark via-aplicada-dark/95 to-aplicada-dark/90">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <Sparkles className="text-aplicada-green h-6 w-6" />
          Sua Análise Personalizada por IA
        </CardTitle>
        <p className="text-sm text-white/60 mt-2">
          Baseada nas informações do seu formulário diagnóstico
        </p>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full space-y-2">
          {/* Ferramentas de IA para Focar */}
          {ferramentasPrioritarias.length > 0 && (
            <AccordionItem value="ferramentas" className="border-2 border-aplicada-green/50 rounded-lg px-4 bg-gradient-to-r from-aplicada-green/10 to-aplicada-green/5">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-aplicada-green/20">
                    <Wrench className="h-5 w-5 text-aplicada-green" />
                  </div>
                  <div className="text-left">
                    <span className="font-semibold text-white">Ferramentas de IA para Focar</span>
                    <p className="text-xs text-white/60 font-normal">
                      {ferramentasPrioritarias.length} ferramentas prioritárias
                    </p>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-4 pb-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  {ferramentasPrioritarias
                    .sort((a, b) => a.nivel_prioridade - b.nivel_prioridade)
                    .map((ferramenta, i) => (
                      <div 
                        key={i} 
                        className="p-4 rounded-lg bg-aplicada-dark border border-aplicada-green/30 hover:border-aplicada-green/50 transition-colors"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Badge 
                              className={i === 0 ? "bg-aplicada-green text-white" : "bg-aplicada-green/20 text-aplicada-green"}
                            >
                              #{i + 1}
                            </Badge>
                            <span className="font-semibold text-white">{ferramenta.nome}</span>
                          </div>
                          {ferramenta.gratuito && (
                            <Badge variant="outline" className="text-xs bg-green-500/10 text-green-400 border-green-500/30">
                              Gratuito
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-aplicada-green/70 mb-2">{ferramenta.categoria}</p>
                        <p className="text-sm text-white/80">{ferramenta.motivo}</p>
                      </div>
                    ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          )}

          {/* Análise do Perfil */}
          <AccordionItem value="perfil" className="border border-aplicada-green/30 rounded-lg px-4 bg-aplicada-dark/50">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-aplicada-green/10">
                  <Target className="h-5 w-5 text-aplicada-green" />
                </div>
                <span className="font-semibold text-left text-white">Análise do Seu Perfil</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-4 pb-2">
              <p className="text-sm leading-relaxed text-white/80">
                {insight.analise_perfil}
              </p>
            </AccordionContent>
          </AccordionItem>

          {/* Principais Oportunidades */}
          <AccordionItem value="oportunidades" className="border border-aplicada-green/30 rounded-lg px-4 bg-aplicada-dark/50">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-aplicada-green/10">
                  <Rocket className="h-5 w-5 text-aplicada-green" />
                </div>
                <span className="font-semibold text-left text-white">Principais Oportunidades</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-4 pb-2">
              <ul className="space-y-3">
                {insight.oportunidades?.map((op: string, i: number) => (
                  <li key={i} className="flex items-start gap-3 p-3 bg-aplicada-dark rounded-lg border border-aplicada-green/20">
                    <span className="text-aplicada-green font-bold text-lg flex-shrink-0">{i + 1}.</span>
                    <span className="text-sm leading-relaxed text-white/80">{op}</span>
                  </li>
                ))}
              </ul>
            </AccordionContent>
          </AccordionItem>

          {/* Primeiros Passos */}
          <AccordionItem value="passos" className="border border-aplicada-green/30 rounded-lg px-4 bg-aplicada-dark/50">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-aplicada-green/10">
                  <Focus className="h-5 w-5 text-aplicada-green" />
                </div>
                <span className="font-semibold text-left text-white">Seus Primeiros Passos</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-4 pb-2">
              <ul className="space-y-3">
                {insight.primeiros_passos?.map((passo: string, i: number) => (
                  <li key={i} className="flex items-start gap-3 p-4 bg-aplicada-green/10 rounded-lg border border-aplicada-green/20">
                    <span className="text-aplicada-green font-bold text-lg flex-shrink-0">{i + 1}.</span>
                    <span className="text-sm leading-relaxed font-medium text-white/90">{passo}</span>
                  </li>
                ))}
              </ul>
            </AccordionContent>
          </AccordionItem>

          {/* Alerta de Desafios */}
          <AccordionItem value="desafios" className="border border-aplicada-green/30 rounded-lg px-4 bg-aplicada-dark/50">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-yellow-500/10">
                  <AlertTriangle className="h-5 w-5 text-yellow-500" />
                </div>
                <span className="font-semibold text-left text-white">Fique Atento</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-4 pb-2">
              <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                <p className="text-sm leading-relaxed text-white/80">
                  {insight.alerta_desafios}
                </p>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Recomendação de Foco */}
          <AccordionItem value="foco" className="border border-aplicada-green/50 rounded-lg px-4 bg-aplicada-dark/50">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-aplicada-green/10">
                  <Target className="h-5 w-5 text-aplicada-green" />
                </div>
                <span className="font-semibold text-left text-white">Recomendação de Foco</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-4 pb-2">
              <div className="p-4 bg-aplicada-green/10 border-2 border-aplicada-green/30 rounded-lg">
                <p className="text-sm font-medium leading-relaxed text-white">
                  {insight.recomendacao_foco}
                </p>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        {planoJaCriado && (
          <Alert className="mt-6 border-aplicada-green/30 bg-aplicada-green/10">
            <CheckCircle2 className="h-4 w-4 text-aplicada-green" />
            <AlertDescription className="text-white/90">
              <strong className="text-aplicada-green">Plano de mentoria criado com sucesso!</strong>
              <p className="text-sm mt-1">
                Seus objetivos e tarefas iniciais já estão disponíveis na seção de Mentoria.
              </p>
            </AlertDescription>
          </Alert>
        )}

        <div className="mt-6 pt-4 border-t border-aplicada-green/20">
          <p className="text-xs text-white/50 text-center">
            Análise gerada em {new Date(formulario.insight_gerado_em).toLocaleDateString('pt-BR', {
              day: '2-digit',
              month: 'long',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}