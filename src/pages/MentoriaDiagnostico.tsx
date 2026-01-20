import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useMentoriaForm } from "@/hooks/useMentoriaForm";
import { useEffectivePlan } from "@/hooks/useUserPlan";
import { useUserRole } from "@/hooks/useUserRole";
import { FormularioWizard } from "@/components/mentoria/FormularioWizard";
import { InsightIA } from "@/components/mentoria/InsightIA";
import { BusinessDashboard } from "@/components/mentoria/business/BusinessDashboard";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Loader2, Info, Download } from "lucide-react";
import { toast } from "sonner";

export default function MentoriaDiagnostico() {
  const navigate = useNavigate();
  const location = useLocation();
  const { formulario, isLoading, refetch } = useMentoriaForm();
  const { isAdmin, isLoading: roleLoading } = useUserRole();
  const { effectivePlan, isVisitante, isBusiness, isSimulating, isLoading: planLoading } = useEffectivePlan(isAdmin, roleLoading);

  // Check if accessed via /diagnostico route (Academy-specific)
  const isAcademyRoute = location.pathname.startsWith('/diagnostico');
  const isFormularioRoute = location.pathname === '/diagnostico/formulario';
  
  // Verificar se admin quer explicitamente editar (via query param)
  const canEdit = new URLSearchParams(location.search).get("edit") === "1";

  // Redirecionar visitantes - não devem acessar esta página
  useEffect(() => {
    // Aguardar loading completo antes de decidir redirect
    if (planLoading) return;
    
    if (isVisitante) {
      toast.info("Esta funcionalidade requer um plano ativo");
      navigate("/trilhas", { replace: true });
    }
  }, [isVisitante, planLoading, navigate]);

  // GUARD DEFINITIVO: Admin REAL (não simulando) em /diagnostico/formulario SEM ?edit=1 => vai para painel
  useEffect(() => {
    if (planLoading) return;
    const isRealAdmin = isAdmin && !isSimulating;
    if (isRealAdmin && isFormularioRoute && !canEdit) {
      navigate("/diagnostico/painel", { replace: true });
    }
  }, [isAdmin, isSimulating, isFormularioRoute, canEdit, planLoading, navigate]);

  // Admin pode acessar esta rota sem redirecionamento automático.
  // (Evita loop de replaceState entre /diagnostico/formulario e /diagnostico/painel)


  const naoPreencheu = !formulario?.completado;
  const preenchido = formulario?.completado;
  const isRealAdmin = isAdmin && !isSimulating;
  
  const voltarUrl = isRealAdmin 
    ? '/mentoria' 
    : !effectivePlan 
      ? '/comunidade' 
      : (effectivePlan === 'academy' || isAcademyRoute)
        ? '/meu-diagnostico' 
        : '/mentoria';
  
  const voltarLabel = isRealAdmin 
    ? 'Voltar para Mentoria' 
    : !effectivePlan 
      ? 'Voltar para Comunidade' 
      : (effectivePlan === 'academy' || isAcademyRoute)
        ? 'Voltar para Meu Diagnóstico' 
        : 'Voltar para Mentoria';

  const handleFormularioFinalizado = () => {
    refetch();
  };

  // Não renderizar enquanto carrega ou se for visitante
  if (isLoading || planLoading || isVisitante) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-2">
      {/* Botão de voltar */}
      <Button
        variant="ghost"
        onClick={() => navigate(voltarUrl)}
        className="mb-6 -ml-2"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        {voltarLabel}
      </Button>

      {/* Formulário Wizard - quando não preencheu */}
      {naoPreencheu && (
        <FormularioWizard 
          onFinalizado={handleFormularioFinalizado}
        />
      )}

      {/* Business Dashboard - quando já preencheu e é Business */}
      {preenchido && isBusiness && (
        <BusinessDashboard diagnostico={formulario} />
      )}

      {/* Resumo + Insight - quando já preencheu e é Academy */}
      {preenchido && !isBusiness && (
        <div className="w-full space-y-6">
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

          <InsightIA 
            formulario={formulario}
            onInsightGerado={refetch}
          />
        </div>
      )}
    </div>
  );
}