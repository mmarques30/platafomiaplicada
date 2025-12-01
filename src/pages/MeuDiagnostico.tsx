import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useMentoriaForm } from "@/hooks/useMentoriaForm";
import { useNavigate } from "react-router-dom";
import { FileText, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ObjetivosGerados } from "@/components/mentoria/ObjetivosGerados";
import { ProjetosSugeridos } from "@/components/mentoria/ProjetosSugeridos";
import { InsightIA } from "@/components/mentoria/InsightIA";
import { useUserPlan } from "@/hooks/useUserPlan";
import { useEffect } from "react";

export default function MeuDiagnostico() {
  const navigate = useNavigate();
  const { formulario, isLoading } = useMentoriaForm();
  const { plan, isLoading: planLoading } = useUserPlan();

  // Redirect Club/Lab para /mentoria (eles têm diagnóstico integrado)
  useEffect(() => {
    if (!planLoading && plan && ['club', 'lab'].includes(plan)) {
      navigate('/mentoria', { replace: true });
    }
  }, [plan, planLoading, navigate]);

  const completo = formulario?.completado || false;
  const preenchidoPorAdmin = formulario?.preenchido_por === "admin";
  const ultimaAnalise = formulario?.updated_at
    ? format(new Date(formulario.updated_at), "dd 'de' MMMM", { locale: ptBR })
    : null;

  return (
    <div className="min-h-screen bg-background">
      <main className="container py-6 space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Meu Diagnóstico</h1>
          <p className="text-muted-foreground mt-1">
            Análise personalizada com IA e objetivos gerados
          </p>
        </div>

        {/* Grid com Diagnóstico */}
        <div className="grid gap-6">
          {/* Card Diagnóstico */}
          {isLoading ? (
            <Skeleton className="h-64 w-full" />
          ) : (
            <Card className={completo ? "border-l-4 border-l-primary" : ""}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <FileText className="h-5 w-5 text-primary" />
                    Diagnóstico IA
                  </CardTitle>
                  <Badge variant={completo ? "default" : "secondary"}>
                    {completo ? "Completo" : "Pendente"}
                  </Badge>
                </div>
                <CardDescription>
                  Formulário de análise personalizada com IA
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {completo ? (
                  <>
                    {preenchidoPorAdmin && (
                      <Badge variant="outline" className="mb-2">
                        Preenchido pelo mentor
                      </Badge>
                    )}
                    <div className="space-y-3">
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-primary mt-0.5" />
                        <div className="text-sm">
                          <p className="font-medium">Perfil analisado</p>
                          <p className="text-muted-foreground">Suas informações foram processadas pela IA</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-primary mt-0.5" />
                        <div className="text-sm">
                          <p className="font-medium">Objetivos definidos</p>
                          <p className="text-muted-foreground">Metas e expectativas registradas</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-primary mt-0.5" />
                        <div className="text-sm">
                          <p className="font-medium">Plano personalizado gerado</p>
                          <p className="text-muted-foreground">Recomendações baseadas no seu perfil</p>
                        </div>
                      </div>
                    </div>
                    {ultimaAnalise && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Última análise em {ultimaAnalise}
                      </p>
                    )}
                    <div className="flex gap-2 pt-2">
                      <Button
                        onClick={() => navigate("/mentoria/painel-diagnostico")}
                        className="flex-1"
                      >
                        Ver Painel Completo
                      </Button>
                      <Button
                        onClick={() => navigate("/mentoria/diagnostico")}
                        variant="outline"
                      >
                        Editar
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-start gap-2 p-4 bg-muted/50 rounded-lg">
                      <AlertCircle className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div className="text-sm">
                        <p className="font-medium mb-1">Diagnóstico pendente</p>
                        <p className="text-muted-foreground">
                          Complete o formulário de diagnóstico para receber recomendações personalizadas da IA sobre sua jornada de aprendizado.
                        </p>
                      </div>
                    </div>
                    <Button
                      onClick={() => navigate("/mentoria/diagnostico")}
                      className="w-full"
                    >
                      Iniciar Diagnóstico
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Objetivos e Projetos Gerados pela IA */}
        {completo && (
          <div className="grid gap-6 md:grid-cols-2">
            <ObjetivosGerados />
            <ProjetosSugeridos />
          </div>
        )}

        {/* Insight IA */}
        {completo && formulario && (
          <InsightIA formulario={formulario} />
        )}
      </main>
    </div>
  );
}