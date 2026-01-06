import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMentoriaForm } from "@/hooks/useMentoriaForm";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ObjetivosGerados } from "@/components/mentoria/ObjetivosGerados";
import { ProjetosSugeridos } from "@/components/mentoria/ProjetosSugeridos";
import { InsightIA } from "@/components/mentoria/InsightIA";
import { FeedbackMentora } from "@/components/mentoria/FeedbackMentora";
import { useUserPlan } from "@/hooks/useUserPlan";
import { useUserRole } from "@/hooks/useUserRole";
import { useEffect } from "react";
import { toast } from "sonner";
import { PageTitle } from "@/components/shared/PageTitle";

export default function MeuDiagnostico() {
  const navigate = useNavigate();
  const { formulario, isLoading } = useMentoriaForm();
  const { plan, isLoading: planLoading } = useUserPlan();
  const { isVisitante, isLoading: roleLoading } = useUserRole();

  // Redirecionar visitantes - não devem acessar esta página
  useEffect(() => {
    if (!roleLoading && isVisitante) {
      toast.info("Esta funcionalidade requer um plano ativo");
      navigate("/trilhas", { replace: true });
    }
  }, [isVisitante, roleLoading, navigate]);

  // Redirect Club/Lab para /mentoria (eles têm diagnóstico integrado)
  useEffect(() => {
    if (!planLoading && plan && ['club', 'lab'].includes(plan)) {
      navigate('/mentoria', { replace: true });
    }
  }, [plan, planLoading, navigate]);

  // Não renderizar enquanto carrega ou se for visitante
  if (roleLoading || isVisitante) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const completo = formulario?.completado || false;
  const preenchidoPorAdmin = formulario?.preenchido_por === "admin";
  const ultimaAnalise = formulario?.updated_at
    ? format(new Date(formulario.updated_at), "dd 'de' MMMM", { locale: ptBR })
    : null;

  return (
    <div className="min-h-screen bg-background">
      <main className="container py-6 space-y-8">
        {/* Header */}
        <PageTitle primary="Meu" secondary="Diagnóstico" />

        {/* Loading State */}
        {isLoading ? (
          <Skeleton className="h-64 w-full" />
        ) : (
          <Tabs defaultValue="diagnostico-ia" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="diagnostico-ia">
                Diagnóstico IA
              </TabsTrigger>
              <TabsTrigger value="feedback-mentora">
                Feedback Mentora
              </TabsTrigger>
            </TabsList>

            {/* Tab: Diagnóstico IA */}
            <TabsContent value="diagnostico-ia" className="space-y-6">
              {/* Card Diagnóstico */}
              <Card className={completo ? "border-l-4 border-l-primary" : ""}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl">
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
                          onClick={() => navigate("/diagnostico/painel")}
                          className="flex-1"
                        >
                          Ver Painel Completo
                        </Button>
                        <Button
                          onClick={() => navigate("/diagnostico/formulario")}
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
                        onClick={() => navigate("/diagnostico/formulario")}
                        className="w-full"
                      >
                        Iniciar Diagnóstico
                      </Button>
                    </>
                  )}
                </CardContent>
              </Card>

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
            </TabsContent>

            {/* Tab: Feedback Mentora */}
            <TabsContent value="feedback-mentora">
              <FeedbackMentora formulario={formulario} />
            </TabsContent>
          </Tabs>
        )}
      </main>
    </div>
  );
}
