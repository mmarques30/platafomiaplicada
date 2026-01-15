import { useMentoriaForm } from "@/hooks/useMentoriaForm";
import { useNavigate } from "react-router-dom";
import { useUserPlan } from "@/hooks/useUserPlan";
import { useUserRole } from "@/hooks/useUserRole";
import { useEffect } from "react";
import { toast } from "sonner";

export default function MeuDiagnostico() {
  const navigate = useNavigate();
  const { formulario, isLoading } = useMentoriaForm();
  const { plan, isLoading: planLoading } = useUserPlan();
  const { isVisitante, isAdmin, isLoading: roleLoading } = useUserRole();

  // Redirecionar visitantes - não devem acessar esta página
  useEffect(() => {
    if (!roleLoading && isVisitante) {
      toast.info("Esta funcionalidade requer um plano ativo");
      navigate("/trilhas", { replace: true });
    }
  }, [isVisitante, roleLoading, navigate]);

  // Redirect Business para /mentoria/diagnostico (dashboard robusto)
  useEffect(() => {
    if (!planLoading && plan === 'business') {
      navigate('/mentoria/diagnostico', { replace: true });
    }
  }, [plan, planLoading, navigate]);

  // Redirecionar automaticamente para formulário ou painel
  useEffect(() => {
    if (!isLoading && !roleLoading && !planLoading && !isVisitante && plan !== 'business') {
      // Admin sempre vai para o painel, nunca para o formulário
      if (isAdmin || formulario?.completado) {
        navigate('/diagnostico/painel', { replace: true });
      } else {
        navigate('/diagnostico/formulario', { replace: true });
      }
    }
  }, [formulario, isLoading, roleLoading, planLoading, isVisitante, plan, isAdmin, navigate]);

  // Tela de loading enquanto redireciona
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  );
}
