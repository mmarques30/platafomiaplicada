import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, MessageSquare, TrendingUp, Sparkles } from "lucide-react";

export default function Comunidade() {
  return (
    <div className="container max-w-6xl mx-auto p-8 space-y-8">
      {/* Hero */}
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="bg-primary/10 p-4 rounded-full">
            <Users className="h-12 w-12 text-primary" />
          </div>
        </div>
        <h1 className="text-4xl font-bold text-foreground">Comunidade IAplicada</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Conecte-se com profissionais que estão aplicando IA no mundo real
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Membros Ativos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1.247</div>
            <p className="text-xs text-muted-foreground">+180 este mês</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Discussões</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3.421</div>
            <p className="text-xs text-muted-foreground">+52 esta semana</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Projetos Aplicados</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">892</div>
            <p className="text-xs text-muted-foreground">IA aplicada na prática</p>
          </CardContent>
        </Card>
      </div>

      {/* Conteúdo Principal */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Destaques da Comunidade */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Destaques da Semana
            </CardTitle>
            <CardDescription>
              Veja o que os Aplicados estão compartilhando
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border-l-4 border-primary pl-4 py-2">
              <h4 className="font-semibold text-foreground">Automatizei 40% do meu workflow com Claude</h4>
              <p className="text-sm text-muted-foreground">por Marina Silva • 2 dias atrás</p>
            </div>
            <div className="border-l-4 border-primary pl-4 py-2">
              <h4 className="font-semibold text-foreground">Dashboard de BI com análise automática por IA</h4>
              <p className="text-sm text-muted-foreground">por Carlos Eduardo • 3 dias atrás</p>
            </div>
            <div className="border-l-4 border-primary pl-4 py-2">
              <h4 className="font-semibold text-foreground">Sistema de atendimento inteligente implementado</h4>
              <p className="text-sm text-muted-foreground">por Ana Paula • 5 dias atrás</p>
            </div>
          </CardContent>
        </Card>

        {/* Tópicos em Alta */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Tópicos em Alta
            </CardTitle>
            <CardDescription>
              Discussões mais populares agora
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3 p-3 border rounded-lg hover:bg-accent/50 transition-colors">
              <MessageSquare className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-foreground">Qual ferramenta IA vocês recomendam para análise de dados?</h4>
                <p className="text-sm text-muted-foreground">45 respostas</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 border rounded-lg hover:bg-accent/50 transition-colors">
              <MessageSquare className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-foreground">Como convencer a gestão a investir em IA?</h4>
                <p className="text-sm text-muted-foreground">38 respostas</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 border rounded-lg hover:bg-accent/50 transition-colors">
              <MessageSquare className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-foreground">Prompts que mudaram meu fluxo de trabalho</h4>
                <p className="text-sm text-muted-foreground">67 respostas</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* CTA para Visitantes */}
      <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/30">
        <CardHeader>
          <CardTitle className="text-2xl">Participe das discussões</CardTitle>
          <CardDescription className="text-base">
            Para interagir, comentar e compartilhar seus projetos, torne-se um membro Aplicado.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
