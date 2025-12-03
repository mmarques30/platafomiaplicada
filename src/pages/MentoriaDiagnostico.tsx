import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useMentoriaForm } from "@/hooks/useMentoriaForm";
import { useUserPlan } from "@/hooks/useUserPlan";
import { useUserRole } from "@/hooks/useUserRole";
import { FormularioWizard } from "@/components/mentoria/FormularioWizard";
import { ResumoDiagnostico } from "@/components/mentoria/ResumoDiagnostico";
import { HeroMentoria } from "@/components/mentoria/HeroMentoria";
import { InsightIA } from "@/components/mentoria/InsightIA";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ArrowLeft, Loader2, Info, Download } from "lucide-react";

export default function MentoriaDiagnostico() {
  const navigate = useNavigate();
  const location = useLocation();
  const { formulario, isLoading, refetch } = useMentoriaForm();
  const { plan } = useUserPlan();
  const { isAdmin } = useUserRole();
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [modoEdicao, setModoEdicao] = useState(false);
  const [criandoNovo, setCriandoNovo] = useState(false);
  const [confirmarNovoOpen, setConfirmarNovoOpen] = useState(false);

  const naoPreencheu = !formulario?.completado;
  const preenchido = formulario?.completado && !modoEdicao && !criandoNovo;
  const preenchidoPorAdmin = formulario?.preenchido_por === 'admin';
  
  // Check if accessed via /diagnostico route (Academy-specific)
  const isAcademyRoute = location.pathname.startsWith('/diagnostico');
  
  const voltarUrl = isAdmin 
    ? '/mentoria' 
    : !plan 
      ? '/comunidade' 
      : (plan === 'academy' || isAcademyRoute)
        ? '/meu-diagnostico' 
        : '/mentoria';
  
  const voltarLabel = isAdmin 
    ? 'Voltar para Mentoria' 
    : !plan 
      ? 'Voltar para Comunidade' 
      : (plan === 'academy' || isAcademyRoute)
        ? 'Voltar para Meu Diagnóstico' 
        : 'Voltar para Mentoria';

  const handleFormularioFinalizado = () => {
    setMostrarFormulario(false);
    setModoEdicao(false);
    setCriandoNovo(false);
    refetch();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      {/* Botão de voltar */}
      <Button
        variant="ghost"
        onClick={() => navigate(voltarUrl)}
        className="mb-6 -ml-2"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        {voltarLabel}
      </Button>

      {/* Hero Section - quando não preencheu */}
      {naoPreencheu && !mostrarFormulario && (
        <HeroMentoria onIniciar={() => setMostrarFormulario(true)} />
      )}

      {/* Formulário Wizard - quando está preenchendo ou editando */}
      {(mostrarFormulario || modoEdicao || criandoNovo) && (
        <FormularioWizard 
          onCancelar={() => {
            setMostrarFormulario(false);
            setModoEdicao(false);
            setCriandoNovo(false);
          }}
          onFinalizado={handleFormularioFinalizado}
        />
      )}

      {/* Resumo + Insight - quando já preencheu */}
      {preenchido && (
        <div className="max-w-5xl mx-auto space-y-6">
          {formulario.preenchido_por === 'admin' && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertTitle className="flex items-center gap-2">
                Diagnóstico realizado em conjunto
                <Badge variant="secondary">Preenchido pelo mentor</Badge>
              </AlertTitle>
              <AlertDescription className="mt-2">
                Seu diagnóstico foi preenchido durante a sessão com seu mentor.
                {formulario.arquivo_diagnostico_url && (
                  <Button 
                    variant="link" 
                    className="h-auto p-0 ml-2"
                    onClick={() => window.open(formulario.arquivo_diagnostico_url, '_blank')}
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Baixar documento original
                  </Button>
                )}
              </AlertDescription>
            </Alert>
          )}
          
          {!preenchidoPorAdmin && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertTitle>Deseja atualizar seu diagnóstico?</AlertTitle>
              <AlertDescription className="mt-2 flex items-center gap-3 flex-wrap">
                <span>Você pode editar o diagnóstico atual ou preencher um novo do zero.</span>
                <Button 
                  variant="outline" 
                  onClick={() => setConfirmarNovoOpen(true)}
                >
                  Preencher Novo Diagnóstico
                </Button>
              </AlertDescription>
            </Alert>
          )}

          <ResumoDiagnostico 
            formulario={formulario} 
            onEditar={preenchidoPorAdmin ? undefined : () => setModoEdicao(true)}
          />
          <InsightIA 
            formulario={formulario}
            onInsightGerado={refetch}
          />
        </div>
      )}

      {/* AlertDialog de confirmação para criar novo diagnóstico */}
      <AlertDialog open={confirmarNovoOpen} onOpenChange={setConfirmarNovoOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Criar novo diagnóstico?</AlertDialogTitle>
            <AlertDialogDescription>
              Você já possui um diagnóstico preenchido. Ao criar um novo, o diagnóstico atual será substituído. 
              Seus insights e plano de ação atual serão perdidos. Deseja continuar?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => {
              setCriandoNovo(true);
              setConfirmarNovoOpen(false);
            }}>
              Criar Novo Diagnóstico
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
