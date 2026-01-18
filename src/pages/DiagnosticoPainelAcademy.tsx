import { useMentoriaForm } from "@/hooks/useMentoriaForm";
import { useUserRole } from "@/hooks/useUserRole";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { toast } from "sonner";
import { Brain, Video, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { DiagnosticoAcademyPanel } from "@/components/mentoria/DiagnosticoAcademyPanel";
import { FeedbackMentora } from "@/components/mentoria/FeedbackMentora";
import { PageTitle } from "@/components/shared/PageTitle";
import { Skeleton } from "@/components/ui/skeleton";

export default function DiagnosticoPainelAcademy() {
  const navigate = useNavigate();
  const { formulario, isLoading } = useMentoriaForm();
  const { isVisitante, isAdmin, isLoading: roleLoading } = useUserRole();

  // Redirecionar visitantes
  useEffect(() => {
    if (!roleLoading && isVisitante) {
      toast.info("Esta funcionalidade requer um plano ativo");
      navigate("/trilhas", { replace: true });
    }
  }, [isVisitante, roleLoading, navigate]);

  const isPageLoading = isLoading || roleLoading;
  const nomeCompleto = formulario?.nome_completo || (isAdmin ? "Admin" : "Mentorado");

  // Não renderiza nada se for visitante (aguarda redirecionamento)
  if (!isPageLoading && isVisitante) {
    return null;
  }

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6 md:space-y-8">
      {/* Header */}
      <div>
        <PageTitle primary="Meu" secondary="Diagnóstico" />
        {isPageLoading ? (
          <Skeleton className="h-5 w-40 mt-2" />
        ) : (
          nomeCompleto && nomeCompleto !== "Admin" && (
            <p className="text-muted-foreground mt-2">{nomeCompleto}</p>
          )
        )}
      </div>

      {/* Sistema de Abas */}
      <Tabs defaultValue="diagnostico" className="w-full">
        <TabsList className="w-full md:w-auto grid grid-cols-2 md:inline-flex gap-0.5 sm:gap-1 bg-primary/20 dark:bg-primary/30 p-1 sm:p-1.5 rounded-lg sm:rounded-xl border border-primary/30 dark:border-primary/40">
          <TabsTrigger 
            value="diagnostico"
            className="flex items-center justify-center gap-1 sm:gap-2 text-foreground/70 data-[state=active]:bg-[#0D0D0D] data-[state=active]:text-white data-[state=active]:shadow-lg rounded-md sm:rounded-lg px-2 sm:px-4 py-1.5 sm:py-2.5 transition-all duration-200 text-xs sm:text-sm"
          >
            <Brain className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            Diagnóstico
          </TabsTrigger>
          <TabsTrigger 
            value="feedback"
            className="flex items-center justify-center gap-1 sm:gap-2 text-foreground/70 data-[state=active]:bg-[#0D0D0D] data-[state=active]:text-white data-[state=active]:shadow-lg rounded-md sm:rounded-lg px-2 sm:px-4 py-1.5 sm:py-2.5 transition-all duration-200 text-xs sm:text-sm"
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
          ) : formulario ? (
            <DiagnosticoAcademyPanel diagnostico={formulario} />
          ) : (
            <Card className="border-dashed border-2">
              <CardContent className="py-12">
                <div className="text-center space-y-4">
                  <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <FileText className="h-8 w-8 text-primary" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-medium">Diagnóstico não preenchido</h3>
                    <p className="text-sm text-muted-foreground max-w-md mx-auto">
                      {isAdmin 
                        ? "Você ainda não preencheu seu diagnóstico pessoal. Preencha para gerar seu plano de desenvolvimento com IA."
                        : "Preencha o diagnóstico para ver seu plano personalizado e receber feedback da mentora."
                      }
                    </p>
                  </div>
                  <Button 
                    onClick={() => navigate(isAdmin ? "/diagnostico/formulario?edit=1" : "/diagnostico/formulario")}
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
    </div>
  );
}