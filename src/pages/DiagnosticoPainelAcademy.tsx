import { useMentoriaForm } from "@/hooks/useMentoriaForm";
import { useUserRole } from "@/hooks/useUserRole";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { toast } from "sonner";
import { Loader2, ArrowLeft, Brain, Video, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

  if (!formulario && !isAdmin) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-5xl">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/trilhas")}
          className="mb-6 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar para Trilhas
        </Button>

        <header className="flex items-center gap-4 mb-8">
          <div className="p-4 rounded-2xl bg-aplicada-green-700/10 border border-aplicada-green-700/20">
            <Sparkles className="h-8 w-8 text-aplicada-green-700" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Meu Diagnóstico</h1>
            <p className="text-muted-foreground">Complete o formulário para gerar seu painel</p>
          </div>
        </header>

        <div className="border border-border rounded-xl bg-card p-8 text-center">
          <p className="text-muted-foreground mb-6">
            Você ainda não preencheu o diagnóstico. Preencha agora para ver seu painel e o feedback.
          </p>
          <Button onClick={() => navigate("/diagnostico/formulario")}>Preencher diagnóstico</Button>
        </div>
      </div>
    );
  }

  const nomeCompleto = formulario?.nome_completo || "Admin";

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
          <DiagnosticoAcademyPanel diagnostico={formulario} />
        </TabsContent>

        <TabsContent value="feedback" className="mt-6">
          <FeedbackMentora formulario={formulario} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
