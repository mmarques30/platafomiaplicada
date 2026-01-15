import { Card, CardContent } from "@/components/ui/card";
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
  Loader2
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useState } from "react";
import { useMentoriaForm } from "@/hooks/useMentoriaForm";

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
  
  const insight = diagnostico.insight_ia as {
    ferramentas_prioritarias?: Array<{ nome: string; categoria?: string; prioridade?: number }>;
    primeiros_passos?: string[];
    oportunidades?: Array<{ titulo: string; descricao: string }>;
    trilhas_recomendadas?: Array<{ titulo: string; modulo_id?: string }>;
    analise_perfil?: string;
    roadmap?: Array<{ etapa: string; titulo: string; descricao: string }>;
  } | null;

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

  const ferramentas = insight.ferramentas_prioritarias || [];
  const primeirosPassos = insight.primeiros_passos || [];
  const oportunidades = insight.oportunidades || [];
  const trilhasRecomendadas = insight.trilhas_recomendadas || [];
  const roadmap = insight.roadmap || [];

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

      {/* Seção 1: IAs que VOCÊ vai usar */}
      {ferramentas.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-aplicada-green-700 flex items-center gap-2 mb-4">
            <Bot className="h-5 w-5" />
            Ferramentas que Você Vai Dominar
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {ferramentas.slice(0, 8).map((ferramenta, index) => (
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
                  {ferramenta.prioridade && (
                    <Badge variant="outline" className="mt-2 text-xs border-aplicada-green-700/30 text-aplicada-green-700">
                      Prioridade {ferramenta.prioridade}
                    </Badge>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Seção 2: Roadmap de Aprendizado */}
      {roadmap.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-aplicada-green-700 flex items-center gap-2 mb-4">
            <Map className="h-5 w-5" />
            Seu Roadmap de Aprendizado
          </h2>
          <div className="relative pl-8">
            {/* Timeline vertical */}
            <div className="absolute left-3 top-2 bottom-2 w-0.5 bg-gradient-to-b from-aplicada-green-700 via-aplicada-green-700/50 to-aplicada-green-900/30" />
            
            {roadmap.map((etapa, index) => (
              <div key={index} className="relative flex gap-4 mb-6 last:mb-0">
                {/* Círculo numerado */}
                <div className="absolute -left-5 w-8 h-8 rounded-full bg-aplicada-green-700 text-white flex items-center justify-center font-bold text-sm shadow-md">
                  {index + 1}
                </div>
                
                {/* Card da etapa */}
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

      {/* Seção 3: Por Onde Começar */}
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

      {/* Seção 4: Oportunidades Identificadas */}
      {oportunidades.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-aplicada-green-700 flex items-center gap-2 mb-4">
            <Lightbulb className="h-5 w-5" />
            Oportunidades Identificadas
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {oportunidades.map((oportunidade, index) => (
              <Card 
                key={index}
                className="bg-card border border-aplicada-green-800/20"
              >
                <CardContent className="p-4">
                  <h3 className="font-semibold text-foreground mb-1">{oportunidade.titulo}</h3>
                  <p className="text-sm text-muted-foreground">{oportunidade.descricao}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Seção 5: Trilhas Recomendadas */}
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
