import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Map, CheckCircle2, Circle, Clock } from "lucide-react";

export function IAplicadaRoadmap() {
  return (
    <div className="space-y-6">
      {/* Header do Roadmap */}
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Map className="h-5 w-5 text-primary" />
            Roadmap do Projeto
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Acompanhe as fases e entregas do seu projeto de implementação de IA.
          </p>
        </CardContent>
      </Card>

      {/* Timeline Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Fases do Projeto</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Fase 1 - Exemplo */}
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                  <Circle className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="w-0.5 h-full bg-muted flex-1 mt-2" />
              </div>
              <div className="flex-1 pb-8">
                <h4 className="font-medium">Fase 1: Diagnóstico</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Mapeamento de processos e identificação de oportunidades
                </p>
                <div className="mt-2 text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Em breve
                </div>
              </div>
            </div>

            {/* Fase 2 - Exemplo */}
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                  <Circle className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="w-0.5 h-full bg-muted flex-1 mt-2" />
              </div>
              <div className="flex-1 pb-8">
                <h4 className="font-medium">Fase 2: Implementação</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Desenvolvimento e configuração das soluções de IA
                </p>
                <div className="mt-2 text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Em breve
                </div>
              </div>
            </div>

            {/* Fase 3 - Exemplo */}
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                  <Circle className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>
              <div className="flex-1">
                <h4 className="font-medium">Fase 3: Entrega Final</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Validação, documentação e handover
                </p>
                <div className="mt-2 text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Em breve
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Mensagem de construção */}
      <Card className="border-dashed border-2 border-muted-foreground/30">
        <CardContent className="py-12 text-center">
          <div className="text-4xl mb-4">🚧</div>
          <h3 className="text-lg font-semibold mb-2">Roadmap em Construção</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            O roadmap detalhado do seu projeto será exibido aqui assim que 
            as fases forem definidas pela equipe IAplicada.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
