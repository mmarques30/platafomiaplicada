import { useMentoriaForm } from "@/hooks/useMentoriaForm";
import { useUserRole } from "@/hooks/useUserRole";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { toast } from "sonner";
import { Loader2, ArrowLeft, Brain, Video, Sparkles, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { DiagnosticoAcademyPanel } from "@/components/mentoria/DiagnosticoAcademyPanel";
import { FeedbackMentora } from "@/components/mentoria/FeedbackMentora";

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

  // Não redirecionar automaticamente daqui (evita loop de replaceState).
  // Se o diagnóstico não estiver preenchido, mostramos um estado vazio com CTA abaixo.


  if (isLoading || roleLoading || isVisitante) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-aplicada-green-700" />
      </div>
    );
  }

  // Removido: condição que impedia admin de ver a página com abas
  // Agora sempre mostra a estrutura completa com abas, mesmo sem diagnóstico

  const nomeCompleto = formulario?.nome_completo || (isAdmin ? "Admin" : "Mentorado");

  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl">
      {/* Botão Voltar */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate("/trilhas")}
        className="mb-6 text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Voltar para Trilhas
      </Button>

      {/* Header clean */}
      <header className="flex items-center gap-4 mb-8">
        <div className="p-4 rounded-2xl bg-aplicada-green-700/10 border border-aplicada-green-700/20">
          <Sparkles className="h-8 w-8 text-aplicada-green-700" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Meu Diagnóstico</h1>
          <p className="text-muted-foreground">{nomeCompleto}</p>
        </div>
      </header>

      {/* Sistema de Abas */}
      <Tabs defaultValue="diagnostico" className="space-y-6">
        <TabsList className="bg-muted/50 border border-border p-1">
          <TabsTrigger 
            value="diagnostico" 
            className="data-[state=active]:bg-aplicada-green-700 data-[state=active]:text-white gap-2"
          >
            <Brain className="h-4 w-4" />
            Meu Diagnóstico
          </TabsTrigger>
          <TabsTrigger 
            value="feedback" 
            className="data-[state=active]:bg-aplicada-green-700 data-[state=active]:text-white gap-2"
          >
            <Video className="h-4 w-4" />
            Feedback Mentora
          </TabsTrigger>
        </TabsList>

        <TabsContent value="diagnostico" className="mt-6">
          {formulario ? (
            <DiagnosticoAcademyPanel diagnostico={formulario} />
          ) : (
            <Card className="border-dashed border-2">
              <CardContent className="py-12">
                <div className="text-center space-y-4">
                  <div className="mx-auto w-16 h-16 rounded-full bg-aplicada-green-700/10 flex items-center justify-center">
                    <FileText className="h-8 w-8 text-aplicada-green-700" />
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
                    className="bg-aplicada-green-700 hover:bg-aplicada-green-800"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Preencher diagnóstico
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="feedback" className="mt-6">
          <FeedbackMentora formulario={formulario} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
