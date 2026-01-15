import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { 
  Sparkles, Target, Rocket, AlertTriangle, Focus, Loader2, CheckCircle2, 
  Wrench, PlayCircle, Lightbulb, ChevronDown, ChevronUp, MessageSquare, 
  Bot, Search, Image, FileText, Code, Presentation, Zap, ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { EtapaEvolucao, Etapa } from "./EtapaEvolucao";
import { useUserPlan } from "@/hooks/useUserPlan";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

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

// Mapeamento de ícones para ferramentas
const ferramentaIcons: Record<string, LucideIcon> = {
  'ChatGPT': MessageSquare,
  'GPT-4': MessageSquare,
  'Claude': Bot,
  'Perplexity': Search,
  'Midjourney': Image,
  'DALL-E': Image,
  'Notion AI': FileText,
  'Notion': FileText,
  'Copilot': Code,
  'GitHub Copilot': Code,
  'Gamma': Presentation,
  'Gemini': Sparkles,
  'default': Wrench
};

const getFerramentaIcon = (nome: string): LucideIcon => {
  const normalizedName = nome.toLowerCase();
  for (const [key, icon] of Object.entries(ferramentaIcons)) {
    if (normalizedName.includes(key.toLowerCase())) {
      return icon;
    }
  }
  return ferramentaIcons.default;
};

const getPriorityColor = (priority: number): string => {
  switch (priority) {
    case 1:
      return "bg-primary text-primary-foreground shadow-lg shadow-primary/25";
    case 2:
      return "bg-blue-500 text-white";
    case 3:
      return "bg-purple-500 text-white";
    default:
      return "bg-muted text-muted-foreground";
  }
};

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

  // Extrair oportunidades do insight
  const oportunidades = (insight.oportunidades as string[] | undefined) || [];

  // Extrair primeiros passos do insight
  const primeirosPassos = (insight.primeiros_passos as string[] | undefined) || [];

  // Extrair trilhas recomendadas das etapas
  const trilhasRecomendadas = etapasEvolucao?.flatMap(e => e.trilhas_recomendadas || []).slice(0, 4) || [];

  const oportunidadeIcons = [Rocket, Lightbulb, Target, Zap];
  const problemaIcons = [Zap, Lightbulb, Target];

  return (
    <div className="mt-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 pb-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-primary/20 to-primary/5 rounded-xl">
            <Sparkles className="h-6 w-6 text-primary" />
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

      {/* ===== FERRAMENTAS RECOMENDADAS - CARDS VISUAIS ===== */}
      {ferramentasPrioritarias.length > 0 && (
        <section className="mb-8">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-primary mb-4 flex items-center gap-2">
            <Wrench className="h-4 w-4" />
            Ferramentas Recomendadas
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {ferramentasPrioritarias
              .sort((a, b) => a.nivel_prioridade - b.nivel_prioridade)
              .slice(0, 4)
              .map((ferramenta, i) => {
                const IconComponent = getFerramentaIcon(ferramenta.nome);
                return (
                  <div 
                    key={i} 
                    className={cn(
                      "relative p-5 rounded-xl border-2 transition-all duration-200 hover:scale-[1.02] cursor-default",
                      i === 0 
                        ? "bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-primary/40 shadow-lg shadow-primary/10" 
                        : "bg-card border-border hover:border-primary/30"
                    )}
                  >
                    {/* Badge de Prioridade */}
                    <div className={cn(
                      "absolute -top-2 -right-2 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold",
                      getPriorityColor(ferramenta.nivel_prioridade)
                    )}>
                      #{i + 1}
                    </div>
                    
                    {/* Ícone */}
                    <div className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center mb-3",
                      i === 0 ? "bg-primary/20" : "bg-muted"
                    )}>
                      <IconComponent className={cn(
                        "h-6 w-6",
                        i === 0 ? "text-primary" : "text-muted-foreground"
                      )} />
                    </div>
                    
                    {/* Nome */}
                    <p className="font-bold text-foreground text-sm mb-1">{ferramenta.nome}</p>
                    
                    {/* Categoria */}
                    <p className="text-xs text-muted-foreground mb-3">{ferramenta.categoria}</p>
                    
                    {/* Badge Grátis */}
                    {ferramenta.gratuito && (
                      <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 text-xs">
                        ✓ Grátis
                      </Badge>
                    )}
                  </div>
                );
              })}
          </div>
        </section>
      )}

      {/* ===== OPORTUNIDADES - CARDS COLORIDOS IMPACTANTES ===== */}
      {oportunidades.length > 0 && (
        <section className="mb-8">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-primary mb-4 flex items-center gap-2">
            <Rocket className="h-4 w-4" />
            Suas Oportunidades
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
            {oportunidades.slice(0, 4).map((op, i) => {
              const OpIcon = oportunidadeIcons[i % oportunidadeIcons.length];
              const gradients = [
                "bg-gradient-to-r from-primary/15 via-primary/5 to-transparent border-l-primary",
                "bg-gradient-to-r from-blue-500/15 via-blue-500/5 to-transparent border-l-blue-500",
                "bg-gradient-to-r from-purple-500/15 via-purple-500/5 to-transparent border-l-purple-500",
                "bg-gradient-to-r from-emerald-500/15 via-emerald-500/5 to-transparent border-l-emerald-500",
              ];
              const iconBgs = [
                "bg-primary/20 text-primary",
                "bg-blue-500/20 text-blue-500",
                "bg-purple-500/20 text-purple-500",
                "bg-emerald-500/20 text-emerald-500",
              ];
              return (
                <div 
                  key={i}
                  className={cn(
                    "p-4 rounded-xl border-l-4 transition-all hover:shadow-md",
                    gradients[i % gradients.length]
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className={cn("p-2 rounded-lg shrink-0", iconBgs[i % iconBgs.length])}>
                      <OpIcon className="h-4 w-4" />
                    </div>
                    <div>
                      <span className="text-xs font-semibold uppercase text-muted-foreground">
                        Oportunidade {i + 1}
                      </span>
                      <p className="font-medium text-foreground mt-1 text-sm">{op}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ===== PRIMEIROS PASSOS - TIMELINE VISUAL ===== */}
      {primeirosPassos.length > 0 && (
        <section className="mb-8">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-primary mb-4 flex items-center gap-2">
            <Focus className="h-4 w-4" />
            Primeiros Passos
          </h3>
          <div className="relative space-y-4">
            {/* Linha vertical conectando os passos */}
            <div className="absolute left-6 top-8 bottom-8 w-0.5 bg-gradient-to-b from-primary via-primary/50 to-primary/20" />
            
            {primeirosPassos.slice(0, 5).map((passo, i) => (
              <div key={i} className="relative flex items-start gap-4">
                {/* Círculo numerado */}
                <div className={cn(
                  "relative z-10 flex items-center justify-center w-12 h-12 rounded-full font-bold text-sm shadow-lg shrink-0",
                  i === 0 
                    ? "bg-primary text-primary-foreground shadow-primary/25" 
                    : "bg-card text-foreground border-2 border-primary/30"
                )}>
                  {i + 1}
                </div>
                
                {/* Card do passo */}
                <div className={cn(
                  "flex-1 p-4 rounded-xl border transition-all hover:border-primary/40",
                  i === 0 
                    ? "bg-primary/5 border-primary/30" 
                    : "bg-card border-border"
                )}>
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-medium text-foreground text-sm">{passo}</p>
                    {i === 0 && (
                      <Badge className="bg-primary/10 text-primary border-primary/30 shrink-0 text-xs">
                        Próximo
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ===== PROBLEMAS PARA RESOLVER - CARDS COM ÍCONES ===== */}
      {problemasResolver.length > 0 && (
        <section className="mb-8">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-primary mb-4 flex items-center gap-2">
            <Lightbulb className="h-4 w-4" />
            Desafios para Resolver com IA
          </h3>
          <div className="grid sm:grid-cols-3 gap-3">
            {problemasResolver.map((problema, i) => {
              const ProbIcon = problemaIcons[i % problemaIcons.length];
              return (
                <div 
                  key={i}
                  className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/20 rounded-xl border border-amber-200 dark:border-amber-800/50"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-1.5 rounded-lg bg-amber-100 dark:bg-amber-900/50">
                      <ProbIcon className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                    </div>
                    <span className="text-xs font-bold text-amber-700 dark:text-amber-300 uppercase">
                      Foco #{i + 1}
                    </span>
                  </div>
                  <p className="text-sm text-amber-900 dark:text-amber-100">{problema}</p>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ===== MÓDULOS PRIORITÁRIOS ===== */}
      {trilhasRecomendadas.length > 0 && (
        <section className="mb-6">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-primary mb-3 flex items-center gap-2">
            <PlayCircle className="h-4 w-4" />
            Módulos Prioritários
          </h3>
          <div className="space-y-2">
            {trilhasRecomendadas.map((trilha, i) => (
              <div 
                key={i} 
                className="flex items-center justify-between p-3 bg-primary/5 rounded-lg border border-primary/20 hover:border-primary/40 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="p-1.5 rounded-lg bg-primary/10">
                    <PlayCircle className="h-4 w-4 text-primary" />
                  </div>
                  <span className="font-medium text-foreground text-sm">{trilha.titulo}</span>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-primary hover:text-primary hover:bg-primary/10 gap-1"
                  onClick={() => navigate(`/trilhas/${trilha.trilha_id}`)}
                >
                  Acessar
                  <ArrowRight className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        </section>
      )}

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

            {/* Suas Respostas do Diagnóstico */}
            <AccordionItem value="respostas" className="border border-border rounded-lg px-4 bg-card">
              <AccordionTrigger className="hover:no-underline py-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-muted">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <span className="font-medium text-sm text-foreground">Suas Respostas do Diagnóstico</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-2 pb-4">
                <div className="space-y-4">
                  {/* Perfil */}
                  {(formulario.nome_completo || formulario.profissao || formulario.area_atuacao) && (
                    <div>
                      <span className="text-xs font-semibold uppercase text-muted-foreground mb-2 block">Perfil Profissional</span>
                      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
                        {formulario.nome_completo && (
                          <div className="bg-muted/50 rounded-lg p-2">
                            <span className="text-xs text-muted-foreground">Nome</span>
                            <p className="text-sm font-medium text-foreground">{formulario.nome_completo}</p>
                          </div>
                        )}
                        {formulario.idade && (
                          <div className="bg-muted/50 rounded-lg p-2">
                            <span className="text-xs text-muted-foreground">Idade</span>
                            <p className="text-sm font-medium text-foreground">{formulario.idade} anos</p>
                          </div>
                        )}
                        {formulario.profissao && (
                          <div className="bg-muted/50 rounded-lg p-2">
                            <span className="text-xs text-muted-foreground">Profissão</span>
                            <p className="text-sm font-medium text-foreground">{formulario.profissao}</p>
                          </div>
                        )}
                        {formulario.area_atuacao && (
                          <div className="bg-muted/50 rounded-lg p-2">
                            <span className="text-xs text-muted-foreground">Área</span>
                            <p className="text-sm font-medium text-foreground">{formulario.area_atuacao}</p>
                          </div>
                        )}
                        {formulario.tempo_experiencia && (
                          <div className="bg-muted/50 rounded-lg p-2">
                            <span className="text-xs text-muted-foreground">Experiência</span>
                            <p className="text-sm font-medium text-foreground">{formulario.tempo_experiencia}</p>
                          </div>
                        )}
                        {formulario.tamanho_empresa && (
                          <div className="bg-muted/50 rounded-lg p-2">
                            <span className="text-xs text-muted-foreground">Empresa</span>
                            <p className="text-sm font-medium text-foreground">{formulario.tamanho_empresa}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Experiência IA */}
                  {(formulario.nivel_ia || formulario.frequencia_uso_ia) && (
                    <div>
                      <span className="text-xs font-semibold uppercase text-muted-foreground mb-2 block">Experiência com IA</span>
                      <div className="grid sm:grid-cols-2 gap-2">
                        {formulario.nivel_ia && (
                          <div className="bg-muted/50 rounded-lg p-2">
                            <span className="text-xs text-muted-foreground">Nível</span>
                            <p className="text-sm font-medium text-foreground">{formulario.nivel_ia}</p>
                          </div>
                        )}
                        {formulario.frequencia_uso_ia && (
                          <div className="bg-muted/50 rounded-lg p-2">
                            <span className="text-xs text-muted-foreground">Frequência de Uso</span>
                            <p className="text-sm font-medium text-foreground">{formulario.frequencia_uso_ia}</p>
                          </div>
                        )}
                      </div>
                      {formulario.maior_dificuldade_ia && (
                        <div className="bg-muted/50 rounded-lg p-2 mt-2">
                          <span className="text-xs text-muted-foreground">Maior Dificuldade</span>
                          <p className="text-sm text-foreground">{formulario.maior_dificuldade_ia}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Objetivos */}
                  {(formulario.objetivo_principal || formulario.meta_3_meses || formulario.meta_12_meses) && (
                    <div>
                      <span className="text-xs font-semibold uppercase text-muted-foreground mb-2 block">Objetivos</span>
                      <div className="space-y-2">
                        {formulario.objetivo_principal && (
                          <div className="bg-muted/50 rounded-lg p-2">
                            <span className="text-xs text-muted-foreground">Objetivo Principal</span>
                            <p className="text-sm font-medium text-foreground">{formulario.objetivo_principal}</p>
                          </div>
                        )}
                        <div className="grid sm:grid-cols-2 gap-2">
                          {formulario.meta_3_meses && (
                            <div className="bg-muted/50 rounded-lg p-2">
                              <span className="text-xs text-muted-foreground">Meta 3 meses</span>
                              <p className="text-sm text-foreground">{formulario.meta_3_meses}</p>
                            </div>
                          )}
                          {formulario.meta_12_meses && (
                            <div className="bg-muted/50 rounded-lg p-2">
                              <span className="text-xs text-muted-foreground">Meta 12 meses</span>
                              <p className="text-sm text-foreground">{formulario.meta_12_meses}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Desafios */}
                  {(formulario.desafio_1 || formulario.desafio_2 || formulario.desafio_3) && (
                    <div>
                      <span className="text-xs font-semibold uppercase text-muted-foreground mb-2 block">Desafios</span>
                      <div className="space-y-2">
                        {formulario.desafio_1 && (
                          <div className="flex items-start gap-2 bg-amber-500/10 rounded-lg p-2 border-l-2 border-amber-500">
                            <span className="text-xs font-bold text-amber-600 shrink-0">1</span>
                            <p className="text-sm text-foreground">{formulario.desafio_1}</p>
                          </div>
                        )}
                        {formulario.desafio_2 && (
                          <div className="flex items-start gap-2 bg-amber-500/10 rounded-lg p-2 border-l-2 border-amber-500">
                            <span className="text-xs font-bold text-amber-600 shrink-0">2</span>
                            <p className="text-sm text-foreground">{formulario.desafio_2}</p>
                          </div>
                        )}
                        {formulario.desafio_3 && (
                          <div className="flex items-start gap-2 bg-amber-500/10 rounded-lg p-2 border-l-2 border-amber-500">
                            <span className="text-xs font-bold text-amber-600 shrink-0">3</span>
                            <p className="text-sm text-foreground">{formulario.desafio_3}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Aprendizagem e Comprometimento */}
                  {(formulario.estilo_aprendizagem || formulario.nivel_comprometimento) && (
                    <div>
                      <span className="text-xs font-semibold uppercase text-muted-foreground mb-2 block">Aprendizagem</span>
                      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
                        {formulario.estilo_aprendizagem && (
                          <div className="bg-muted/50 rounded-lg p-2">
                            <span className="text-xs text-muted-foreground">Estilo</span>
                            <p className="text-sm font-medium text-foreground">{formulario.estilo_aprendizagem}</p>
                          </div>
                        )}
                        {formulario.melhor_horario && (
                          <div className="bg-muted/50 rounded-lg p-2">
                            <span className="text-xs text-muted-foreground">Melhor Horário</span>
                            <p className="text-sm font-medium text-foreground">{formulario.melhor_horario}</p>
                          </div>
                        )}
                        {formulario.tempo_disponivel && (
                          <div className="bg-muted/50 rounded-lg p-2">
                            <span className="text-xs text-muted-foreground">Tempo Disponível</span>
                            <p className="text-sm font-medium text-foreground">{formulario.tempo_disponivel}</p>
                          </div>
                        )}
                        {formulario.nivel_comprometimento && (
                          <div className="bg-muted/50 rounded-lg p-2">
                            <span className="text-xs text-muted-foreground">Comprometimento</span>
                            <p className="text-sm font-medium text-foreground">{formulario.nivel_comprometimento}/10</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
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
