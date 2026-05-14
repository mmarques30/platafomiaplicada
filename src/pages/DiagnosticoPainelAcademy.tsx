import { useMentoriaForm } from "@/hooks/useMentoriaForm";
import { useUserRole } from "@/hooks/useUserRole";
import { useEffectivePlan } from "@/hooks/useUserPlan";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { toast } from "sonner";
import { Brain, Video, FileText, UserCog, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { DiagnosticoAcademyPanel } from "@/components/mentoria/DiagnosticoAcademyPanel";
import { FeedbackMentora } from "@/components/mentoria/FeedbackMentora";
import { PageTitle } from "@/components/shared/PageTitle";
import { PageContainer } from "@/components/shared/PageContainer";
import { Skeleton } from "@/components/ui/skeleton";

export default function DiagnosticoPainelAcademy() {
  const navigate = useNavigate();
  const { formulario, isLoading } = useMentoriaForm();
  const { isAdmin, isLoading: roleLoading } = useUserRole();
  const { effectivePlan, isVisitante, isSimulating, isLoading: planLoading } = useEffectivePlan(isAdmin, roleLoading);

  // Redirecionar visitantes e Skills
  useEffect(() => {
    if (planLoading) return;
    
    if (isVisitante) {
      toast.info("Esta funcionalidade requer um plano ativo");
      navigate("/trilhas", { replace: true });
      return;
    }

    if (effectivePlan === 'skills') {
      navigate('/skills/projeto/diagnostico', { replace: true });
    }
  }, [isVisitante, effectivePlan, planLoading, navigate]);

  const isPageLoading = isLoading || planLoading;
  const isRealAdmin = isAdmin && !isSimulating;
  const nomeCompleto = formulario?.nome_completo || (isAdmin ? "Admin" : "Mentorado");

  // Não renderiza nada se for visitante (aguarda redirecionamento)
  if (!isPageLoading && isVisitante) {
    return null;
  }

  return (
    <PageContainer>
      <PageTitle
        primary="Meu"
        secondary="diagnóstico"
        eyebrow="Academy"
        description={
          isPageLoading
            ? undefined
            : nomeCompleto && (nomeCompleto !== "Admin" || isSimulating)
              ? nomeCompleto
              : undefined
        }
      />

      {/* Sistema de Abas */}
      <Tabs defaultValue="diagnostico" className="w-full">
        <TabsList className="w-full md:w-auto grid grid-cols-2 md:inline-flex gap-0.5 sm:gap-1 bg-primary/20 dark:bg-primary/30 p-1 sm:p-1.5 rounded-lg sm:rounded-xl border border-primary/30 dark:border-primary/40">
          <TabsTrigger 
            value="diagnostico"
            className="flex items-center justify-center gap-1 sm:gap-2 text-foreground/70 data-[state=active]:bg-brand-strong data-[state=active]:text-brand-strong-foreground data-[state=active]:shadow-lg rounded-md sm:rounded-lg px-2 sm:px-4 py-1.5 sm:py-2.5 transition-all duration-200 text-xs sm:text-sm"
          >
            <Brain className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            Diagnóstico
          </TabsTrigger>
          <TabsTrigger 
            value="feedback"
            className="flex items-center justify-center gap-1 sm:gap-2 text-foreground/70 data-[state=active]:bg-brand-strong data-[state=active]:text-brand-strong-foreground data-[state=active]:shadow-lg rounded-md sm:rounded-lg px-2 sm:px-4 py-1.5 sm:py-2.5 transition-all duration-200 text-xs sm:text-sm"
          >
            <Video className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            Feedback
          </TabsTrigger>
        </TabsList>

        <TabsContent value="diagnostico" className="space-y-6 mt-6">
          {isPageLoading ? (
            <Card>
              <CardContent className="py-8 space-y-4">
                <Skeleton className="h-8 w-1/3" />
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-32 w-full mt-4" />
              </CardContent>
            </Card>
          ) : formulario && (formulario.preenchido_por !== 'admin' || formulario.insight_ia) ? (
            // Diagnóstico completo: preenchido pelo próprio usuário OU já tem insight IA
            <DiagnosticoAcademyPanel diagnostico={formulario} />
          ) : formulario && formulario.preenchido_por === 'admin' && !formulario.insight_ia ? (
            // Admin preencheu mas ainda não tem insight IA - usuário pode preencher o próprio
            <Card className="border-dashed border-2 border-primary/30">
              <CardContent className="py-12">
                <div className="text-center space-y-4">
                  <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <UserCog className="h-8 w-8 text-primary" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-medium">Diagnóstico Iniciado pelo Mentor</h3>
                    <p className="text-sm text-muted-foreground max-w-md mx-auto">
                      Seu mentor iniciou seu diagnóstico. Complete o formulário para gerar seu plano de desenvolvimento personalizado com IA.
                    </p>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button 
                      onClick={() => navigate("/diagnostico/formulario")}
                      className="bg-primary hover:bg-primary/90"
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Preencher Meu Diagnóstico
                    </Button>
                    
                    {formulario.arquivo_diagnostico_url && (
                      <Button 
                        variant="outline"
                        onClick={() => window.open(formulario.arquivo_diagnostico_url as string, '_blank')}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Ver Arquivo do Mentor
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            // Sem formulário nenhum
            <Card className="border-dashed border-2">
              <CardContent className="py-12">
                <div className="text-center space-y-4">
                  <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <FileText className="h-8 w-8 text-primary" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-medium">Diagnóstico não preenchido</h3>
                    <p className="text-sm text-muted-foreground max-w-md mx-auto">
                      {isRealAdmin 
                        ? "Você ainda não preencheu seu diagnóstico pessoal. Preencha para gerar seu plano de desenvolvimento com IA."
                        : "Preencha o diagnóstico para ver seu plano personalizado e receber feedback da mentora."
                      }
                    </p>
                  </div>
                  <Button 
                    onClick={() => navigate(isRealAdmin ? "/diagnostico/formulario?edit=1" : "/diagnostico/formulario")}
                    className="bg-primary hover:bg-primary/90"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Preencher diagnóstico
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="feedback" className="space-y-6 mt-6">
          {isPageLoading ? (
            <Card>
              <CardContent className="py-8 space-y-4">
                <Skeleton className="h-8 w-1/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-24 w-full mt-4" />
              </CardContent>
            </Card>
          ) : (
            <FeedbackMentora formulario={formulario} />
          )}
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
}