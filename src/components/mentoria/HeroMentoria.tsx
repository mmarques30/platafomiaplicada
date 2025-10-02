import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Target, Sparkles, TrendingUp, Users } from "lucide-react";

interface HeroMentoriaProps {
  onIniciar: () => void;
}

export function HeroMentoria({ onIniciar }: HeroMentoriaProps) {
  return (
    <div className="container mx-auto py-16 px-4 max-w-4xl">
      <div className="text-center space-y-6">
        <div className="space-y-3">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
            Aplicada Mentoria IA
          </h1>
          <p className="text-xl text-muted-foreground">
            Transforme sua carreira com Inteligência Artificial
          </p>
        </div>

        <Card className="mt-12 border-primary/20 bg-gradient-to-br from-card to-card/50">
          <CardContent className="py-10 px-8 space-y-8">
            <div className="space-y-3">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Sparkles className="h-6 w-6 text-accent" />
                <h2 className="text-2xl font-semibold">
                  Complete o Formulário Diagnóstico
                </h2>
              </div>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                O primeiro passo é entender seu perfil, objetivos e desafios. 
                Com base nas suas respostas, nossa IA criará um plano personalizado 
                para você dominar a Inteligência Artificial aplicada ao seu trabalho.
              </p>
            </div>

            {/* Lista de benefícios */}
            <div className="grid gap-6 text-left max-w-lg mx-auto">
              <div className="flex items-start gap-4 p-4 rounded-lg bg-background/50 border border-border/50">
                <div className="mt-1 p-2 rounded-full bg-primary/10">
                  <Target className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold mb-1">Diagnóstico Personalizado</p>
                  <p className="text-sm text-muted-foreground">
                    Análise completa do seu perfil, experiência e objetivos com IA
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-lg bg-background/50 border border-border/50">
                <div className="mt-1 p-2 rounded-full bg-accent/10">
                  <Sparkles className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <p className="font-semibold mb-1">Insight Gerado por IA</p>
                  <p className="text-sm text-muted-foreground">
                    Receba uma análise inteligente com oportunidades e próximos passos
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-lg bg-background/50 border border-border/50">
                <div className="mt-1 p-2 rounded-full bg-primary/10">
                  <TrendingUp className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold mb-1">Plano de Ação Prático</p>
                  <p className="text-sm text-muted-foreground">
                    Quick wins e estratégias específicas para o seu contexto
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-lg bg-background/50 border border-border/50">
                <div className="mt-1 p-2 rounded-full bg-accent/10">
                  <Users className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <p className="font-semibold mb-1">Acompanhamento Contínuo</p>
                  <p className="text-sm text-muted-foreground">
                    Seu progresso fica salvo e visível para suporte personalizado
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-4 space-y-3">
              <Button 
                size="lg" 
                onClick={onIniciar}
                className="w-full sm:w-auto px-8 text-lg"
              >
                <CheckCircle className="mr-2 h-5 w-5" />
                Iniciar Formulário Diagnóstico
              </Button>
              <p className="text-xs text-muted-foreground">
                Leva aproximadamente 10-15 minutos para completar
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
