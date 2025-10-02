import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Sparkles, Target, Rocket, AlertTriangle, Focus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface InsightIAProps {
  formulario: any;
  onInsightGerado?: () => void;
}

export function InsightIA({ formulario, onInsightGerado }: InsightIAProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const insight = formulario?.insight_ia;

  const gerarInsight = async () => {
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('gerar-insight-mentoria', {
        body: { formulario_id: formulario.id }
      });

      if (error) throw error;
      
      toast({
        title: "Insight gerado com sucesso! ✨",
        description: "Confira abaixo a análise personalizada"
      });

      // Callback para recarregar dados
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

  if (!insight) {
    return (
      <Card className="mt-6 border-accent/30 bg-gradient-to-br from-accent/5 to-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="text-accent h-6 w-6" />
            Análise Personalizada por IA
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Gere uma análise personalizada com insights e recomendações estratégicas baseadas no seu diagnóstico.
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
                Gerando análise...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-5 w-5" />
                Gerar Análise com IA
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mt-6 border-accent/30 bg-gradient-to-br from-accent/5 via-primary/5 to-background">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="text-accent h-6 w-6" />
          Sua Análise Personalizada por IA
        </CardTitle>
        <p className="text-sm text-muted-foreground mt-2">
          Baseada nas informações do seu formulário diagnóstico
        </p>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full space-y-2">
          {/* Análise do Perfil */}
          <AccordionItem value="perfil" className="border border-border/50 rounded-lg px-4 bg-card">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-primary/10">
                  <Target className="h-5 w-5 text-primary" />
                </div>
                <span className="font-semibold text-left">Análise do Seu Perfil</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-4 pb-2">
              <p className="text-sm leading-relaxed text-foreground/90">
                {insight.analise_perfil}
              </p>
            </AccordionContent>
          </AccordionItem>

          {/* Principais Oportunidades */}
          <AccordionItem value="oportunidades" className="border border-border/50 rounded-lg px-4 bg-card">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-accent/10">
                  <Rocket className="h-5 w-5 text-accent" />
                </div>
                <span className="font-semibold text-left">Principais Oportunidades</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-4 pb-2">
              <ul className="space-y-3">
                {insight.oportunidades?.map((op: string, i: number) => (
                  <li key={i} className="flex items-start gap-3 p-3 bg-background/50 rounded-lg border border-border/30">
                    <span className="text-accent font-bold text-lg flex-shrink-0">{i + 1}.</span>
                    <span className="text-sm leading-relaxed">{op}</span>
                  </li>
                ))}
              </ul>
            </AccordionContent>
          </AccordionItem>

          {/* Primeiros Passos */}
          <AccordionItem value="passos" className="border border-border/50 rounded-lg px-4 bg-card">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-primary/10">
                  <Focus className="h-5 w-5 text-primary" />
                </div>
                <span className="font-semibold text-left">Seus Primeiros Passos</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-4 pb-2">
              <ul className="space-y-3">
                {insight.primeiros_passos?.map((passo: string, i: number) => (
                  <li key={i} className="flex items-start gap-3 p-4 bg-primary/5 rounded-lg border border-primary/20">
                    <span className="text-primary font-bold text-lg flex-shrink-0">{i + 1}.</span>
                    <span className="text-sm leading-relaxed font-medium">{passo}</span>
                  </li>
                ))}
              </ul>
            </AccordionContent>
          </AccordionItem>

          {/* Alerta de Desafios */}
          <AccordionItem value="desafios" className="border border-border/50 rounded-lg px-4 bg-card">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-yellow-500/10">
                  <AlertTriangle className="h-5 w-5 text-yellow-500" />
                </div>
                <span className="font-semibold text-left">Fique Atento</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-4 pb-2">
              <div className="p-4 bg-yellow-500/5 border border-yellow-500/20 rounded-lg">
                <p className="text-sm leading-relaxed text-foreground/90">
                  {insight.alerta_desafios}
                </p>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Recomendação de Foco */}
          <AccordionItem value="foco" className="border border-accent/50 rounded-lg px-4 bg-card">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-accent/10">
                  <Target className="h-5 w-5 text-accent" />
                </div>
                <span className="font-semibold text-left">Recomendação de Foco</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-4 pb-2">
              <div className="p-4 bg-accent/10 border-2 border-accent/30 rounded-lg">
                <p className="text-sm font-medium leading-relaxed">
                  {insight.recomendacao_foco}
                </p>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <div className="mt-6 pt-4 border-t border-border/50">
          <p className="text-xs text-muted-foreground text-center">
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
