import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  LayoutDashboard, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Users,
  TrendingUp,
  CheckSquare,
  XCircle
} from "lucide-react";
import { useSkillsLider } from "@/hooks/useSkillsLider";
import { useSkillsEquipe } from "@/hooks/useSkillsEquipe";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function SkillsLiderDashboard() {
  const navigate = useNavigate();
  const { equipe, isLider, isLoading: equipeLoading } = useSkillsEquipe();
  const { 
    entregasParaValidar, 
    progressoMembros, 
    alertasAtraso, 
    metricas,
    horasEconomizadasTotal,
    entregasConcluidas,
    totalEntregas,
    isLoading,
    aprovarEntrega,
    rejeitarEntrega 
  } = useSkillsLider();

  // Redirecionar se não for líder
  if (!equipeLoading && !isLider) {
    navigate("/skills/equipe");
    return null;
  }

  if (isLoading || equipeLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-primary/10">
            <LayoutDashboard className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Painel do Líder</h1>
            <p className="text-muted-foreground">{equipe?.nome} - {equipe?.empresa_nome}</p>
          </div>
        </div>
        <Badge variant="default" className="bg-primary/20 text-primary border-primary/30">
          Líder
        </Badge>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Para Validar</p>
                <p className="text-2xl font-bold">{metricas?.entregasParaValidar || entregasParaValidar?.length || 0}</p>
              </div>
              <CheckSquare className="h-8 w-8 text-amber-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Aprovadas</p>
                <p className="text-2xl font-bold">{metricas?.entregasAprovadas || entregasConcluidas}/{metricas?.totalEntregas || totalEntregas}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Horas Economizadas</p>
                <p className="text-2xl font-bold">{metricas?.horasEconomizadas || horasEconomizadasTotal}h</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Alertas</p>
                <p className="text-2xl font-bold text-destructive">{alertasAtraso?.length || 0}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-destructive" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Entregas para Validar */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CheckSquare className="h-5 w-5 text-primary" />
            <CardTitle>Entregas Aguardando Validação</CardTitle>
          </div>
          <CardDescription>Aprove ou devolva as entregas da equipe</CardDescription>
        </CardHeader>
        <CardContent>
          {entregasParaValidar && entregasParaValidar.length > 0 ? (
            <div className="space-y-3">
              {entregasParaValidar.map((entrega: any) => (
                <div
                  key={entrega.id}
                  className="flex items-center justify-between p-4 rounded-lg border bg-card"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={entrega.responsavel?.avatar_url} />
                      <AvatarFallback>
                        {entrega.responsavel?.nome?.substring(0, 2).toUpperCase() || "??"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{entrega.titulo}</p>
                      <p className="text-sm text-muted-foreground">
                        {entrega.responsavel?.nome} • {entrega.prazo && format(new Date(entrega.prazo), "dd/MM/yyyy", { locale: ptBR })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => rejeitarEntrega.mutate(entrega.id)}
                      disabled={rejeitarEntrega.isPending}
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      Devolver
                    </Button>
                    <Button 
                      size="sm"
                      onClick={() => aprovarEntrega.mutate(entrega.id)}
                      disabled={aprovarEntrega.isPending}
                    >
                      <CheckCircle2 className="h-4 w-4 mr-1" />
                      Aprovar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <CheckCircle2 className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Nenhuma entrega aguardando validação</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Alertas de Atraso */}
      {alertasAtraso && alertasAtraso.length > 0 && (
        <Card className="border-destructive/50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <CardTitle className="text-destructive">Entregas Atrasadas</CardTitle>
            </div>
            <CardDescription>Entregas que já passaram do prazo</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {alertasAtraso.map((entrega: any) => (
                <div
                  key={entrega.id}
                  className="flex items-center justify-between p-4 rounded-lg border border-destructive/30 bg-destructive/5"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={entrega.responsavel?.avatar_url} />
                      <AvatarFallback>
                        {entrega.responsavel?.nome?.substring(0, 2).toUpperCase() || "??"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{entrega.titulo}</p>
                      <p className="text-sm text-destructive">
                        {entrega.responsavel?.nome} • Prazo: {entrega.prazo && format(new Date(entrega.prazo), "dd/MM/yyyy", { locale: ptBR })}
                      </p>
                    </div>
                  </div>
                  <Badge variant="destructive">Atrasada</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Progresso da Equipe */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            <CardTitle>Progresso da Equipe</CardTitle>
          </div>
          <CardDescription>Acompanhe o desenvolvimento de cada membro</CardDescription>
        </CardHeader>
        <CardContent>
          {progressoMembros && progressoMembros.length > 0 ? (
            <div className="space-y-3">
              {progressoMembros.map((membro: any) => {
                const hasAlert = !membro.diagnostico_completo || 
                  (membro.total_entregas > 0 && membro.entregas_concluidas === 0);
                
                return (
                  <div
                    key={membro.id}
                    className={`flex items-center justify-between p-4 rounded-lg border bg-card ${hasAlert ? 'border-amber-300' : ''}`}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={membro.avatar_url} />
                        <AvatarFallback>
                          {membro.nome?.substring(0, 2).toUpperCase() || "??"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{membro.nome}</p>
                          {membro.papel === "lider" && (
                            <Badge variant="outline" className="text-xs">Líder</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{membro.cargo}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <span className="text-muted-foreground">Diagnóstico:</span>
                        {membro.diagnostico_completo ? (
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        ) : (
                          <Clock className="h-4 w-4 text-amber-500" />
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-muted-foreground">Entregas:</span>
                        <span className={membro.entregas_concluidas > 0 ? "text-green-600" : ""}>
                          {membro.entregas_concluidas}/{membro.total_entregas}
                        </span>
                      </div>
                      {hasAlert && (
                        <AlertTriangle className="h-4 w-4 text-amber-500" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Nenhum membro na equipe</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
