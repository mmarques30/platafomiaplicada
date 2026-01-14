import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Target, Rocket, AlertTriangle, Focus, Loader2, CheckCircle2, Wrench, PlayCircle, Lightbulb, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { EtapaEvolucao, Etapa } from "./EtapaEvolucao";
import { useUserPlan } from "@/hooks/useUserPlan";
import { useNavigate } from "react-router-dom";

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
  const [expandirDetalhes, setExpandirDetalhes] = useState(false);
  const { isBusiness } = useUserPlan();
  const navigate = useNavigate();
  
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
        title: "Diagnóstico gerado com sucesso!",
        description: "Confira abaixo suas recomendações personalizadas"
      });

      if (onInsightGerado) {
        onInsightGerado();
      } else {
        window.location.reload();
      }
    } catch (error: any) {
      console.error("Erro ao gerar insight:", error);
      toast({
        title: "Erro ao gerar diagnóstico",
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
      <Card className="mt-6 border-primary/30 bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Sparkles className="text-primary h-6 w-6" />
            Seu Diagnóstico Personalizado
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Gere seu diagnóstico personalizado com ferramentas prioritárias, módulos recomendados e problemas para resolver com IA.
          </p>
          <Button 
            onClick={gerarInsight} 
            disabled={isGenerating}
            size="lg"
            className="w-full sm:w-auto"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Gerando diagnóstico...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-5 w-5" />
                Gerar Meu Diagnóstico com IA
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Dados do insight
  const etapasEvolucao = insight.etapas_evolucao as Etapa[] | undefined;
  const ferramentasPrioritarias = (insight.ferramentas_prioritarias as FerramentaPrioritaria[] | undefined) || [];
  
  // Extrair problemas para resolver baseado nos desafios + oportunidades
  const problemasResolver = [
    formulario?.desafio_1,
    formulario?.desafio_2,
    formulario?.desafio_3,
  ].filter(Boolean);

  // Extrair trilhas recomendadas das etapas
  const trilhasRecomendadas = etapasEvolucao?.flatMap(e => e.trilhas_recomendadas || []).slice(0, 4) || [];

  return (
    <div className="mt-6 bg-accent/30 rounded-2xl p-6 md:p-8 border border-border">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 pb-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-primary/10 rounded-xl">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">Seu Diagnóstico Personalizado</h2>
            <p className="text-sm text-muted-foreground">
              Gerado em {new Date(formulario.insight_gerado_em).toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: 'long',
                year: 'numeric'
              })}
            </p>
          </div>
        </div>
      </div>

      {/* ===== SEÇÕES PRINCIPAIS VISÍVEIS PARA TODOS ===== */}
      <div className="space-y-6">
        
        {/* 1. Ferramentas para Começar */}
        {ferramentasPrioritarias.length > 0 && (
          <section>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-primary mb-3 flex items-center gap-2">
              <Wrench className="h-4 w-4" />
              Ferramentas para Começar
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {ferramentasPrioritarias
                .sort((a, b) => a.nivel_prioridade - b.nivel_prioridade)
                .slice(0, 4)
                .map((ferramenta, i) => (
                  <div 
                    key={i} 
                    className="p-4 bg-card rounded-xl border border-border hover:border-primary/40 transition-colors text-center"
                  >
                    <Badge className={i === 0 ? "bg-primary text-primary-foreground mb-2" : "bg-primary/20 text-primary border-primary/30 mb-2"}>
                      #{i + 1}
                    </Badge>
                    <p className="font-semibold text-foreground text-sm">{ferramenta.nome}</p>
                    <p className="text-xs text-muted-foreground mt-1">{ferramenta.categoria}</p>
                    {ferramenta.gratuito && (
                      <Badge variant="outline" className="text-xs mt-2 bg-green-500/10 text-green-600 border-green-500/30">
                        Grátis
                      </Badge>
                    )}
                  </div>
                ))}
            </div>
          </section>
        )}

        {/* 2. Módulos Prioritários */}
        {trilhasRecomendadas.length > 0 && (
          <section>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-primary mb-3 flex items-center gap-2">
              <PlayCircle className="h-4 w-4" />
              Módulos Prioritários
            </h3>
            <div className="space-y-2">
              {trilhasRecomendadas.map((trilha, i) => (
                <div 
                  key={i} 
                  className="flex items-center justify-between p-3 bg-primary/5 rounded-lg border border-primary/20"
                >
                  <div className="flex items-center gap-3">
                    <PlayCircle className="h-5 w-5 text-primary shrink-0" />
                    <span className="font-medium text-foreground text-sm">{trilha.titulo}</span>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-primary hover:text-primary hover:bg-primary/10"
                    onClick={() => navigate(`/trilhas/${trilha.trilha_id}`)}
                  >
                    Acessar
                  </Button>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 3. Problemas para Resolver com IA */}
        {problemasResolver.length > 0 && (
          <section>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-primary mb-3 flex items-center gap-2">
              <Lightbulb className="h-4 w-4" />
              Problemas para Resolver com IA
            </h3>
            <div className="space-y-2">
              {problemasResolver.map((problema, i) => (
                <div 
                  key={i} 
                  className="flex items-start gap-3 p-3 bg-amber-50 dark:bg-amber-950/30 rounded-lg border-l-4 border-amber-500"
                >
                  <Lightbulb className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <span className="text-sm text-foreground">{problema}</span>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* ===== BOTÃO EXPANDIR/RECOLHER DETALHES ===== */}
      <div className="flex justify-center mt-6 pt-4 border-t border-border">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => setExpandirDetalhes(!expandirDetalhes)}
          className="gap-2"
        >
          {expandirDetalhes ? (
            <>
              <ChevronUp className="h-4 w-4" />
              Recolher Detalhes
            </>
          ) : (
            <>
              <ChevronDown className="h-4 w-4" />
              Expandir Detalhes
            </>
          )}
        </Button>
      </div>

      {/* ===== SEÇÕES EXPANSÍVEIS (ACCORDIONS) ===== */}
      {expandirDetalhes && (
        <div className="mt-6 space-y-2">
          <Accordion type="multiple" className="w-full space-y-2">
            {/* Análise do Perfil */}
            {insight.analise_perfil && (
              <AccordionItem value="perfil" className="border border-border rounded-lg px-4 bg-card">
                <AccordionTrigger className="hover:no-underline py-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Target className="h-4 w-4 text-primary" />
                    </div>
                    <span className="font-medium text-sm text-foreground">Análise do Perfil</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-2 pb-4">
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {insight.analise_perfil}
                  </p>
                </AccordionContent>
              </AccordionItem>
            )}

            {/* Oportunidades */}
            {insight.oportunidades?.length > 0 && (
              <AccordionItem value="oportunidades" className="border border-border rounded-lg px-4 bg-card">
                <AccordionTrigger className="hover:no-underline py-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Rocket className="h-4 w-4 text-primary" />
                    </div>
                    <span className="font-medium text-sm text-foreground">Oportunidades</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-2 pb-4">
                  <ul className="space-y-2">
                    {insight.oportunidades?.map((op: string, i: number) => (
                      <li key={i} className="flex items-start gap-3 p-3 bg-accent/50 rounded-lg">
                        <span className="text-primary font-bold text-sm shrink-0">{i + 1}.</span>
                        <span className="text-sm text-muted-foreground">{op}</span>
                      </li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>
            )}

            {/* Primeiros Passos */}
            {insight.primeiros_passos?.length > 0 && (
              <AccordionItem value="passos" className="border border-border rounded-lg px-4 bg-card">
                <AccordionTrigger className="hover:no-underline py-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Focus className="h-4 w-4 text-primary" />
                    </div>
                    <span className="font-medium text-sm text-foreground">Primeiros Passos</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-2 pb-4">
                  <ul className="space-y-2">
                    {insight.primeiros_passos?.map((passo: string, i: number) => (
                      <li key={i} className="flex items-start gap-3 p-3 bg-primary/5 rounded-lg border border-primary/20">
                        <span className="text-primary font-bold text-sm shrink-0">{i + 1}.</span>
                        <span className="text-sm font-medium text-foreground">{passo}</span>
                      </li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>
            )}

            {/* Pontos de Atenção */}
            {insight.alerta_desafios && (
              <AccordionItem value="desafios" className="border border-border rounded-lg px-4 bg-card">
                <AccordionTrigger className="hover:no-underline py-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-amber-500/10">
                      <AlertTriangle className="h-4 w-4 text-amber-500" />
                    </div>
                    <span className="font-medium text-sm text-foreground">Pontos de Atenção</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-2 pb-4">
                  <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg">
                    <p className="text-sm text-amber-800 dark:text-amber-200">
                      {insight.alerta_desafios}
                    </p>
                  </div>
                </AccordionContent>
              </AccordionItem>
            )}

            {/* Recomendação de Foco */}
            {insight.recomendacao_foco && (
              <AccordionItem value="foco" className="border border-primary/30 rounded-lg px-4 bg-card">
                <AccordionTrigger className="hover:no-underline py-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Target className="h-4 w-4 text-primary" />
                    </div>
                    <span className="font-medium text-sm text-foreground">Recomendação de Foco</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-2 pb-4">
                  <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
                    <p className="text-sm font-medium text-foreground">
                      {insight.recomendacao_foco}
                    </p>
                  </div>
                </AccordionContent>
              </AccordionItem>
            )}
          </Accordion>

          {/* Etapas de Evolução (se existirem) - SOMENTE PARA BUSINESS */}
          {isBusiness && etapasEvolucao && etapasEvolucao.length > 0 && (
            <div className="mt-6 pt-6 border-t border-border">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-primary mb-4 flex items-center gap-2">
                <Target className="h-4 w-4" />
                Jornada de Evolução
              </h3>
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
            </div>
          )}
        </div>
      )}

      {/* ===== ALERTA DE PLANO CRIADO - SOMENTE BUSINESS ===== */}
      {isBusiness && planoJaCriado && (
        <Alert className="mt-6 border-primary/30 bg-primary/5">
          <CheckCircle2 className="h-4 w-4 text-primary" />
          <AlertDescription className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <strong className="text-primary">Plano de mentoria criado!</strong>
              <p className="text-sm text-muted-foreground mt-0.5">
                Seus objetivos e projetos iniciais estão disponíveis.
              </p>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => navigate('/mentoria')}
              className="shrink-0"
            >
              Ver na Mentoria →
            </Button>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
