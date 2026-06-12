import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Sparkles, 
  Bot, 
  Map, 
  PlayCircle, 
  GraduationCap, 
  ArrowRight,
  Lightbulb,
  Clock,
  Loader2,
  Target,
  AlertTriangle,
  Rocket,
  CheckCircle2,
  User,
  Folder,
  Wrench
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useState } from "react";
import { useMentoriaForm } from "@/hooks/useMentoriaForm";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

// Tipos completos do insight gerado pela IA
interface FerramentaEtapa {
  nome: string;
  foco?: string;
}

interface TrilhaRecomendadaEtapa {
  trilha_id?: string;
  titulo: string;
}

interface EtapaEvolucao {
  numero: number;
  titulo: string;
  objetivo: string;
  duracao_estimada: string;
  ferramentas: FerramentaEtapa[];
  trilhas_recomendadas: TrilhaRecomendadaEtapa[];
  entregavel: string;
}

interface FerramentaPrioritaria {
  nome: string;
  categoria?: string;
  motivo?: string;
  nivel_prioridade?: number;
  prioridade?: number;
  gratuito?: boolean;
}

interface Objetivo {
  objetivo: string;
  tipo: 'curto_prazo' | 'medio_prazo' | 'longo_prazo';
  prioridade?: number;
}

interface FerramentaProjeto {
  nome: string;
  uso_no_projeto?: string;
}

interface Projeto {
  titulo: string;
  descricao: string;
  objetivo_projeto?: string;
  contribuicao_plano?: string;
  ferramentas_projeto?: FerramentaProjeto[];
  trilhas_recomendadas?: TrilhaRecomendadaEtapa[];
}

interface Oportunidade {
  titulo: string;
  descricao: string;
}

interface InsightCompleto {
  etapas_evolucao?: EtapaEvolucao[];
  analise_perfil?: string;
  oportunidades?: Oportunidade[] | string[];
  primeiros_passos?: string[];
  alerta_desafios?: string;
  recomendacao_foco?: string;
  ferramentas_prioritarias?: FerramentaPrioritaria[];
  objetivos?: Objetivo[];
  projetos?: Projeto[];
  trilhas_recomendadas?: Array<{ titulo: string; modulo_id?: string }>;
  roadmap?: Array<{ etapa: string; titulo: string; descricao: string }>;
}

interface DiagnosticoAcademyPanelProps {
  diagnostico: {
    id: string;
    nome_completo?: string | null;
    insight_ia?: unknown;
    insight_gerado_em?: string | null;
    completado?: boolean | null;
    ferramentas_ia?: unknown;
  };
}

export function DiagnosticoAcademyPanel({ diagnostico }: DiagnosticoAcademyPanelProps) {
  const navigate = useNavigate();
  const { refetch } = useMentoriaForm();
  const [isGenerating, setIsGenerating] = useState(false);
  
  const insight = diagnostico.insight_ia as InsightCompleto | null;

  const dataGeracao = diagnostico.insight_gerado_em
    ? format(new Date(diagnostico.insight_gerado_em), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
    : null;

  // Função para gerar insight via IA
  const gerarInsight = async () => {
    setIsGenerating(true);
    try {
      const { error } = await supabase.functions.invoke('gerar-insight-mentoria', {
        body: { formulario_id: diagnostico.id }
      });

      if (error) throw error;

      toast.success("Diagnóstico gerado com sucesso!");
      refetch();
    } catch (error) {
      console.error('Erro ao gerar insight:', error);
      toast.error("Erro ao gerar diagnóstico. Tente novamente.");
    } finally {
      setIsGenerating(false);
    }
  };

  // Se ainda não tem insight gerado
  if (!insight) {
    return (
      <Card className="border border-aplicada-green-800/20">
        <CardContent className="py-12">
          <div className="text-center space-y-6">
            <div className="mx-auto w-20 h-20 rounded-full bg-aplicada-green-700/10 flex items-center justify-center">
              <Sparkles className="h-10 w-10 text-aplicada-green-700" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-semibold text-foreground">
                Gere Seu Plano de Desenvolvimento
              </h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Com base nas informações que você compartilhou, nossa IA irá criar um plano personalizado de aprendizado em IA.
              </p>
            </div>
            <Button 
              size="lg"
              onClick={gerarInsight}
              disabled={isGenerating}
              className="bg-aplicada-green-700 hover:bg-aplicada-green-800 text-white"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Gerando diagnóstico...
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5 mr-2" />
                  Gerar Meu Diagnóstico com IA
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Extrair dados do insight
  const etapasEvolucao = insight.etapas_evolucao || [];
  const analisePerfil = insight.analise_perfil;
  const ferramentas = insight.ferramentas_prioritarias || [];
  const primeirosPassos = insight.primeiros_passos || [];
  const objetivos = insight.objetivos || [];
  const projetos = insight.projetos || [];
  const alertaDesafios = insight.alerta_desafios;
  const recomendacaoFoco = insight.recomendacao_foco;
  const trilhasRecomendadas = insight.trilhas_recomendadas || [];
  const roadmap = insight.roadmap || [];
  
  // Oportunidades podem vir como array de strings ou objetos
  const oportunidades = insight.oportunidades || [];

  // Agrupar objetivos por tipo
  const objetivosCurtoPrazo = objetivos.filter(o => o.tipo === 'curto_prazo');
  const objetivosMedioPrazo = objetivos.filter(o => o.tipo === 'medio_prazo');
  const objetivosLongoPrazo = objetivos.filter(o => o.tipo === 'longo_prazo');

  return (
    <div className="space-y-8">
      {/* Header Premium */}
      <header className="flex items-center gap-4 pb-6 border-b border-aplicada-green-800/20">
        <div className="p-4 rounded-2xl bg-aplicada-green-700/10 border border-aplicada-green-700/20">
          <Sparkles className="h-8 w-8 text-aplicada-green-700" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Seu Plano de Desenvolvimento IA
          </h1>
          {dataGeracao && (
            <p className="text-muted-foreground">
              Gerado em {dataGeracao}
            </p>
          )}
        </div>
      </header>

      {/* Seção: Análise do Perfil */}
      {analisePerfil && (
        <section>
          <Card className="bg-gradient-to-r from-aplicada-green-700/10 to-aplicada-green-900/5 border border-aplicada-green-700/30">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-aplicada-green-700/20">
                  <User className="h-6 w-6 text-aplicada-green-700" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-aplicada-green-700 mb-2">
                    Análise do Seu Perfil
                  </h2>
                  <p className="text-foreground leading-relaxed">{analisePerfil}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      )}

      {/* Seção: Foco dos Próximos 30 Dias */}
      {recomendacaoFoco && (
        <section>
          <Card className="bg-gradient-to-r from-amber-500/10 to-orange-500/5 border border-amber-500/30">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-amber-500/20">
                  <Rocket className="h-6 w-6 text-amber-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-amber-600 mb-2">
                    Foco dos Próximos 30 Dias
                  </h2>
                  <p className="text-foreground leading-relaxed font-medium">{recomendacaoFoco}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      )}

      {/* Seção: Alerta de Desafios */}
      {alertaDesafios && (
        <section>
          <Card className="bg-gradient-to-r from-red-500/10 to-red-900/5 border border-red-500/30">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-red-500/20">
                  <AlertTriangle className="h-6 w-6 text-red-500" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-red-500 mb-2">
                    Alerta de Desafios
                  </h2>
                  <p className="text-foreground leading-relaxed">{alertaDesafios}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      )}

      {/* Seção: Ferramentas Prioritárias - Movida para cima */}
      {ferramentas.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-aplicada-green-700 flex items-center gap-2 mb-4">
            <Bot className="h-5 w-5" />
            Ferramentas que Você Vai Dominar
          </h2>
          {/* Limita a 5 ferramentas e usa 5 colunas em desktop pra todas
              ficarem na mesma linha (Mari pediu: "no máximo 5, mas que não
              ficassem embaixo, numa mesma linha"). Em telas menores quebra
              naturalmente porque 5 cards não cabem horizontalmente. */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {ferramentas.slice(0, 5).map((ferramenta, index) => (
              <Card 
                key={index}
                className="bg-card border border-aplicada-green-800/20 hover:border-aplicada-green-700/40 transition-colors"
              >
                <CardContent className="p-4 text-center">
                  <div className="w-12 h-12 mx-auto rounded-xl bg-aplicada-green-700/10 flex items-center justify-center mb-3">
                    <Bot className="h-6 w-6 text-aplicada-green-700" />
                  </div>
                  <p className="font-semibold text-foreground text-sm">{ferramenta.nome}</p>
                  {ferramenta.categoria && (
                    <p className="text-xs text-muted-foreground mt-1">{ferramenta.categoria}</p>
                  )}
                  {(ferramenta.prioridade || ferramenta.nivel_prioridade) && (
                    <Badge variant="outline" className="mt-2 text-xs border-aplicada-green-700/30 text-aplicada-green-700">
                      Prioridade {ferramenta.prioridade || ferramenta.nivel_prioridade}
                    </Badge>
                  )}
                  {ferramenta.motivo && (
                    <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{ferramenta.motivo}</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Seção: Etapas de Evolução */}
      {etapasEvolucao.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-aplicada-green-700 flex items-center gap-2 mb-4">
            <Map className="h-5 w-5" />
            Suas Etapas de Evolução
          </h2>
          <div className="relative pl-8">
            {/* Timeline vertical */}
            <div className="absolute left-3 top-2 bottom-2 w-0.5 bg-gradient-to-b from-aplicada-green-700 via-aplicada-green-700/50 to-aplicada-green-900/30" />
            
            {etapasEvolucao.map((etapa, index) => (
              <div key={index} className="relative flex gap-4 mb-6 last:mb-0">
                {/* Círculo numerado */}
                <div className="absolute -left-5 w-8 h-8 rounded-full bg-aplicada-green-700 text-white flex items-center justify-center font-bold text-sm shadow-md">
                  {etapa.numero || index + 1}
                </div>
                
                {/* Card da etapa */}
                <Card className="flex-1 bg-card border border-aplicada-green-800/20">
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-foreground text-lg">{etapa.titulo}</h3>
                      <Badge variant="outline" className="border-aplicada-green-700/30 text-aplicada-green-700">
                        <Clock className="h-3 w-3 mr-1" />
                        {etapa.duracao_estimada}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground mb-4">{etapa.objetivo}</p>
                    
                    {/* Ferramentas da etapa */}
                    {etapa.ferramentas && etapa.ferramentas.length > 0 && (
                      <div className="mb-3">
                        <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Ferramentas:</p>
                        <div className="flex flex-wrap gap-2">
                          {etapa.ferramentas.map((ferramenta, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              <Bot className="h-3 w-3 mr-1" />
                              {ferramenta.nome}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Trilhas da etapa */}
                    {etapa.trilhas_recomendadas && etapa.trilhas_recomendadas.length > 0 && (
                      <div className="mb-3">
                        <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Trilhas:</p>
                        <div className="flex flex-wrap gap-2">
                          {etapa.trilhas_recomendadas.map((trilha, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              <GraduationCap className="h-3 w-3 mr-1" />
                              {trilha.titulo}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Entregável */}
                    {etapa.entregavel && (
                      <div className="bg-aplicada-green-700/10 rounded-lg p-3 mt-3">
                        <p className="text-xs text-aplicada-green-700 uppercase tracking-wide mb-1">
                          <CheckCircle2 className="h-3 w-3 inline mr-1" />
                          Entregável:
                        </p>
                        <p className="text-sm text-foreground font-medium">{etapa.entregavel}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Fallback: Roadmap antigo (se não tiver etapas_evolucao) */}
      {etapasEvolucao.length === 0 && roadmap.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-aplicada-green-700 flex items-center gap-2 mb-4">
            <Map className="h-5 w-5" />
            Seu Roadmap de Aprendizado
          </h2>
          <div className="relative pl-8">
            <div className="absolute left-3 top-2 bottom-2 w-0.5 bg-gradient-to-b from-aplicada-green-700 via-aplicada-green-700/50 to-aplicada-green-900/30" />
            
            {roadmap.map((etapa, index) => (
              <div key={index} className="relative flex gap-4 mb-6 last:mb-0">
                <div className="absolute -left-5 w-8 h-8 rounded-full bg-aplicada-green-700 text-white flex items-center justify-center font-bold text-sm shadow-md">
                  {index + 1}
                </div>
                
                <Card className="flex-1 bg-card border border-aplicada-green-800/20">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">{etapa.etapa}</span>
                    </div>
                    <h3 className="font-semibold text-foreground">{etapa.titulo}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{etapa.descricao}</p>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Seção: Objetivos Estratégicos */}
      {objetivos.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-aplicada-green-700 flex items-center gap-2 mb-4">
            <Target className="h-5 w-5" />
            Seus Objetivos Estratégicos
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            {/* Curto Prazo */}
            <Card className="border border-emerald-500/30 bg-emerald-500/5">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-emerald-600 flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Curto Prazo
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {objetivosCurtoPrazo.length > 0 ? (
                  objetivosCurtoPrazo.map((obj, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                      <p className="text-sm text-foreground">{obj.objetivo}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">Nenhum objetivo definido</p>
                )}
              </CardContent>
            </Card>

            {/* Médio Prazo */}
            <Card className="border border-blue-500/30 bg-blue-500/5">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-blue-600 flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Médio Prazo
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {objetivosMedioPrazo.length > 0 ? (
                  objetivosMedioPrazo.map((obj, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                      <p className="text-sm text-foreground">{obj.objetivo}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">Nenhum objetivo definido</p>
                )}
              </CardContent>
            </Card>

            {/* Longo Prazo */}
            <Card className="border border-purple-500/30 bg-purple-500/5">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-purple-600 flex items-center gap-2">
                  <Rocket className="h-4 w-4" />
                  Longo Prazo
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {objetivosLongoPrazo.length > 0 ? (
                  objetivosLongoPrazo.map((obj, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-purple-500 mt-0.5 shrink-0" />
                      <p className="text-sm text-foreground">{obj.objetivo}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">Nenhum objetivo definido</p>
                )}
              </CardContent>
            </Card>
          </div>
        </section>
      )}

      {/* Seção: Projetos Práticos */}
      {projetos.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-aplicada-green-700 flex items-center gap-2 mb-4">
            <Folder className="h-5 w-5" />
            Projetos Práticos Sugeridos
          </h2>
          <Accordion type="single" collapsible className="space-y-3">
            {projetos.map((projeto, index) => (
              <AccordionItem key={index} value={`projeto-${index}`} className="border border-aplicada-green-800/20 rounded-xl px-4">
                <AccordionTrigger className="hover:no-underline py-4">
                  <div className="flex items-center gap-3 text-left">
                    <div className="p-2 rounded-lg bg-aplicada-green-700/10">
                      <Folder className="h-5 w-5 text-aplicada-green-700" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{projeto.titulo}</p>
                      <p className="text-sm text-muted-foreground">{projeto.descricao}</p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-4">
                  <div className="space-y-4 pt-2 pl-12">
                    {projeto.objetivo_projeto && (
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Objetivo:</p>
                        <p className="text-sm text-foreground">{projeto.objetivo_projeto}</p>
                      </div>
                    )}
                    {projeto.contribuicao_plano && (
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Contribuição para seu plano:</p>
                        <p className="text-sm text-foreground">{projeto.contribuicao_plano}</p>
                      </div>
                    )}
                    {projeto.ferramentas_projeto && projeto.ferramentas_projeto.length > 0 && (
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Ferramentas a usar:</p>
                        <div className="space-y-2">
                          {projeto.ferramentas_projeto.map((ferramenta, idx) => (
                            <div key={idx} className="flex items-start gap-2 bg-muted/50 rounded-lg p-2">
                              <Wrench className="h-4 w-4 text-aplicada-green-700 mt-0.5" />
                              <div>
                                <p className="font-medium text-sm">{ferramenta.nome}</p>
                                {ferramenta.uso_no_projeto && (
                                  <p className="text-xs text-muted-foreground">{ferramenta.uso_no_projeto}</p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>
      )}

      {/* Seção: Por Onde Começar */}
      {primeirosPassos.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-aplicada-green-700 flex items-center gap-2 mb-4">
            <PlayCircle className="h-5 w-5" />
            Por Onde Começar
          </h2>
          <div className="space-y-3">
            {primeirosPassos.map((passo, index) => (
              <div 
                key={index}
                className="flex items-start gap-3 p-4 rounded-xl bg-card border border-aplicada-green-800/20"
              >
                <div className="w-7 h-7 rounded-full bg-aplicada-green-700 text-white flex items-center justify-center text-sm font-bold shrink-0">
                  {index + 1}
                </div>
                <p className="text-foreground pt-0.5">{passo}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Seção: Oportunidades Identificadas */}
      {oportunidades.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-aplicada-green-700 flex items-center gap-2 mb-4">
            <Lightbulb className="h-5 w-5" />
            Oportunidades Identificadas
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {oportunidades.map((oportunidade, index) => {
              // Pode ser string ou objeto
              const isString = typeof oportunidade === 'string';
              return (
                <Card 
                  key={index}
                  className="bg-card border border-aplicada-green-800/20"
                >
                  <CardContent className="p-4">
                    {isString ? (
                      <p className="text-foreground">{oportunidade}</p>
                    ) : (
                      <>
                        <h3 className="font-semibold text-foreground mb-1">{(oportunidade as Oportunidade).titulo}</h3>
                        <p className="text-sm text-muted-foreground">{(oportunidade as Oportunidade).descricao}</p>
                      </>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>
      )}

      {/* Seção: Trilhas Recomendadas */}
      {trilhasRecomendadas.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-aplicada-green-700 flex items-center gap-2 mb-4">
            <GraduationCap className="h-5 w-5" />
            Trilhas Recomendadas
          </h2>
          <div className="space-y-3">
            {trilhasRecomendadas.map((trilha, index) => (
              <Card 
                key={index}
                className="bg-card border border-aplicada-green-800/20 hover:border-aplicada-green-700/40 transition-colors"
              >
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-aplicada-green-700/10 flex items-center justify-center">
                      <PlayCircle className="h-5 w-5 text-aplicada-green-700" />
                    </div>
                    <span className="font-medium text-foreground">{trilha.titulo}</span>
                  </div>
                  <Button 
                    size="sm" 
                    onClick={() => navigate(trilha.modulo_id ? `/trilhas/${trilha.modulo_id}` : '/trilhas')}
                    className="bg-aplicada-green-700 hover:bg-aplicada-green-800 text-white"
                  >
                    Acessar
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Botão para Refazer Diagnóstico */}
      <div className="pt-6 border-t border-aplicada-green-800/20 flex justify-center">
        <Button 
          variant="outline"
          onClick={gerarInsight}
          disabled={isGenerating}
          className="border-aplicada-green-700/30 text-aplicada-green-700 hover:bg-aplicada-green-700/10"
        >
          {isGenerating ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Atualizando...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 mr-2" />
              Atualizar Diagnóstico
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
