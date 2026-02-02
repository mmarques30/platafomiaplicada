import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Map, Calendar, CheckCircle2, Clock, Circle } from "lucide-react";
import { useSkillsRoadmap } from "@/hooks/useSkillsRoadmap";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const STATUS_CONFIG = {
  pendente: { label: "Pendente", icon: Circle, color: "text-muted-foreground" },
  em_andamento: { label: "Em Andamento", icon: Clock, color: "text-amber-600" },
  concluida: { label: "Concluída", icon: CheckCircle2, color: "text-green-600" },
};

export default function SkillsRoadmap() {
  const { fases, isLoading } = useSkillsRoadmap();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const totalFases = fases?.length || 0;
  const fasesConcluidas = fases?.filter(f => f.status === 'concluida').length || 0;
  const progressoGeral = totalFases > 0 ? (fasesConcluidas / totalFases) * 100 : 0;
  const faseAtual = fases?.find(f => f.status === 'em_andamento');
  const semanaAtual = faseAtual ? faseAtual.semana_inicio : 1;

  return (
    <div className="container py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-primary/10">
            <Map className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Roadmap 12 Semanas</h1>
            <p className="text-muted-foreground">
              Timeline do projeto de transformação
            </p>
          </div>
        </div>
        <Badge variant="outline" className="text-lg px-4 py-2">
          Semana {semanaAtual}/12
        </Badge>
      </div>

      {/* Progress Overview */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold">Progresso Geral</h3>
              <p className="text-sm text-muted-foreground">
                {fasesConcluidas} de {totalFases} fases concluídas
              </p>
            </div>
            <span className="text-2xl font-bold text-primary">{Math.round(progressoGeral)}%</span>
          </div>
          <Progress value={progressoGeral} className="h-3" />
          
          {/* Timeline visual */}
          <div className="flex justify-between mt-4 px-2">
            {Array.from({ length: 12 }, (_, i) => i + 1).map((semana) => (
              <div 
                key={semana}
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                  semana < semanaAtual 
                    ? 'bg-primary text-primary-foreground'
                    : semana === semanaAtual
                    ? 'bg-primary/20 text-primary border-2 border-primary'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {semana}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Fases */}
      <div className="space-y-4">
        {fases?.map((fase, index) => {
          const StatusIcon = STATUS_CONFIG[fase.status as keyof typeof STATUS_CONFIG]?.icon || Circle;
          const statusColor = STATUS_CONFIG[fase.status as keyof typeof STATUS_CONFIG]?.color || "text-muted-foreground";
          
          return (
            <Card 
              key={fase.id}
              className={`transition-all ${
                fase.status === 'em_andamento' ? 'ring-2 ring-primary shadow-md' : ''
              }`}
            >
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  {/* Número da fase */}
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold ${
                    fase.status === 'concluida' 
                      ? 'bg-green-100 text-green-700'
                      : fase.status === 'em_andamento'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    {fase.status === 'concluida' ? (
                      <CheckCircle2 className="h-6 w-6" />
                    ) : (
                      fase.numero_fase
                    )}
                  </div>

                  {/* Conteúdo */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-lg">{fase.titulo}</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {fase.descricao}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <StatusIcon className={`h-5 w-5 ${statusColor}`} />
                        <Badge 
                          variant="outline"
                          className={fase.status === 'concluida' ? 'bg-green-50' : ''}
                        >
                          {STATUS_CONFIG[fase.status as keyof typeof STATUS_CONFIG]?.label}
                        </Badge>
                      </div>
                    </div>

                    <div className="flex items-center gap-6 mt-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Semana {fase.semana_inicio} - {fase.semana_fim}
                      </div>
                      {fase.data_prevista && (
                        <span>
                          Previsão: {format(new Date(fase.data_prevista), "dd/MM/yyyy", { locale: ptBR })}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {(!fases || fases.length === 0) && (
          <Card>
            <CardContent className="py-12 text-center">
              <Map className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
              <h3 className="font-semibold mb-2">Roadmap em Construção</h3>
              <p className="text-sm text-muted-foreground">
                O roadmap será definido após a conversa de alinhamento com a IAplicada
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
