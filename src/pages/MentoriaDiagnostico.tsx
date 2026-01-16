import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useMentoriaForm } from "@/hooks/useMentoriaForm";
import { useUserPlan } from "@/hooks/useUserPlan";
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
  const { plan } = useUserPlan();
  const { isAdmin, isVisitante, isLoading: roleLoading } = useUserRole();

  // Check if accessed via /diagnostico route (Academy-specific)
  const isAcademyRoute = location.pathname.startsWith('/diagnostico');
  const isFormularioRoute = location.pathname === '/diagnostico/formulario';
  
  // Verificar se admin quer explicitamente editar (via query param)
  const canEdit = new URLSearchParams(location.search).get("edit") === "1";

  // Redirecionar visitantes - não devem acessar esta página
  useEffect(() => {
    if (!roleLoading && isVisitante) {
      toast.info("Esta funcionalidade requer um plano ativo");
      navigate("/trilhas", { replace: true });
    }
  }, [isVisitante, roleLoading, navigate]);

  // GUARD DEFINITIVO: Admin em /diagnostico/formulario SEM ?edit=1 => vai para painel
  useEffect(() => {
    if (roleLoading) return;
    if (isAdmin && isFormularioRoute && !canEdit) {
      navigate("/diagnostico/painel", { replace: true });
    }
  }, [isAdmin, isFormularioRoute, canEdit, roleLoading, navigate]);

  // Admin pode acessar esta rota sem redirecionamento automático.
  // (Evita loop de replaceState entre /diagnostico/formulario e /diagnostico/painel)


  const naoPreencheu = !formulario?.completado;
  const preenchido = formulario?.completado;
  
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
    refetch();
  };

  // Não renderizar enquanto carrega ou se for visitante
  if (isLoading || roleLoading || isVisitante) {
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
      {preenchido && plan === 'business' && (
        <BusinessDashboard diagnostico={formulario} />
      )}

      {/* Resumo + Insight - quando já preencheu e é Academy */}
      {preenchido && plan !== 'business' && (
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