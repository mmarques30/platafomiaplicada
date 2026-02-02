import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Users, CheckCircle2, Clock, Brain, ArrowRight } from "lucide-react";
import { useSkillsEquipe } from "@/hooks/useSkillsEquipe";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function SkillsEquipe() {
  const { equipe, membros, consolidado, isLoading } = useSkillsEquipe();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const diagnosticosCompletos = membros?.filter(m => m.diagnostico_completo).length || 0;
  const totalMembros = membros?.length || 0;
  const progressoDiagnosticos = totalMembros > 0 ? (diagnosticosCompletos / totalMembros) * 100 : 0;

  return (
    <div className="container py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-primary/10">
            <Users className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{equipe?.nome || "Minha Equipe"}</h1>
            <p className="text-muted-foreground">{equipe?.empresa_nome}</p>
          </div>
        </div>
        <Badge variant={equipe?.status === 'ativo' ? 'default' : 'secondary'}>
          {equipe?.status || 'ativo'}
        </Badge>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Membros</p>
                <p className="text-2xl font-bold">{totalMembros}</p>
              </div>
              <Users className="h-8 w-8 text-muted-foreground/50" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Diagnósticos</p>
                <p className="text-2xl font-bold">{diagnosticosCompletos}/{totalMembros}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-muted-foreground/50" />
            </div>
            <Progress value={progressoDiagnosticos} className="h-2 mt-3" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Horas/semana manuais</p>
                <p className="text-2xl font-bold">{consolidado?.total_horas_manuais_semana || 0}h</p>
              </div>
              <Clock className="h-8 w-8 text-muted-foreground/50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Membros da Equipe */}
      <Card>
        <CardHeader>
          <CardTitle>Membros da Equipe</CardTitle>
          <CardDescription>Status do diagnóstico de cada membro</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {membros?.map((membro) => (
              <div
                key={membro.id}
                className="flex items-center justify-between p-4 rounded-lg border bg-card"
              >
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={membro.avatar_url} />
                    <AvatarFallback>
                      {membro.nome?.substring(0, 2).toUpperCase() || "??"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{membro.nome}</p>
                    <p className="text-sm text-muted-foreground">{membro.cargo}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={membro.papel === 'lider' ? 'default' : 'outline'}>
                    {membro.papel === 'lider' ? 'Líder' : 'Membro'}
                  </Badge>
                  {membro.diagnostico_completo ? (
                    <Badge variant="default" className="bg-primary/20 text-primary border-primary/30">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Completo
                    </Badge>
                  ) : (
                    <Badge variant="secondary">
                      <Clock className="h-3 w-3 mr-1" />
                      Pendente
                    </Badge>
                  )}
                </div>
              </div>
            ))}

            {(!membros || membros.length === 0) && (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Nenhum membro cadastrado ainda</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Diagnóstico Consolidado */}
      {consolidado && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              <CardTitle>Diagnóstico Consolidado</CardTitle>
            </div>
            <CardDescription>
              Análise gerada por IA com base nos diagnósticos individuais
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {consolidado.insights_ia && (
              <div className="p-4 rounded-lg bg-muted/50">
                <h4 className="font-medium mb-2">Insights</h4>
                <p className="text-sm text-muted-foreground">{consolidado.insights_ia}</p>
              </div>
            )}

            {consolidado.processos_maior_potencial && Array.isArray(consolidado.processos_maior_potencial) && consolidado.processos_maior_potencial.length > 0 && (
              <div>
                <h4 className="font-medium mb-3">Processos com Maior Potencial</h4>
                <div className="space-y-2">
                  {(consolidado.processos_maior_potencial as any[]).map((processo: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between p-3 rounded-lg border">
                      <span>{processo.processo}</span>
                      <Badge variant="outline">{processo.horas_estimadas_economia}h/semana</Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end pt-4">
              <Button>
                Ver Backlog Priorizado
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
