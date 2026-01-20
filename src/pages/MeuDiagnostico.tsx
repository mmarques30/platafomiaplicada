import { useMentoriaForm } from "@/hooks/useMentoriaForm";
import { useNavigate } from "react-router-dom";
import { useEffectivePlan } from "@/hooks/useUserPlan";
import { useUserRole } from "@/hooks/useUserRole";
import { useEffect, useRef } from "react";
import { toast } from "sonner";

export default function MeuDiagnostico() {
  const navigate = useNavigate();
  const { formulario, isLoading } = useMentoriaForm();
  const { isAdmin, isLoading: roleLoading } = useUserRole();
  const { effectivePlan, isVisitante, isBusiness, isSimulating, isLoading: planLoading } = useEffectivePlan(isAdmin, roleLoading);
  
  // Ref para garantir que o redirect aconteça apenas UMA vez
  const hasRedirected = useRef(false);

  // Lógica de redirecionamento UNIFICADA - aguarda TODOS os loadings
  useEffect(() => {
    // Aguardar TUDO carregar antes de tomar qualquer decisão
    // roleLoading já está incluído em planLoading via useEffectivePlan
    if (isLoading || planLoading) return;
    
    // Evitar múltiplos redirects
    if (hasRedirected.current) return;

    // Visitante -> trilhas
    if (isVisitante) {
      hasRedirected.current = true;
      toast.info("Esta funcionalidade requer um plano ativo");
      navigate("/trilhas", { replace: true });
      return;
    }

    // Business -> mentoria/diagnostico (dashboard robusto)
    if (isBusiness) {
      hasRedirected.current = true;
      navigate('/mentoria/diagnostico', { replace: true });
      return;
    }

    // Academy: admin real (não simulando) ou completado -> painel, senão -> formulário
    hasRedirected.current = true;
    const isRealAdmin = isAdmin && !isSimulating;
    if (isRealAdmin || formulario?.completado) {
      navigate('/diagnostico/painel', { replace: true });
    } else {
      navigate('/diagnostico/formulario', { replace: true });
    }
  }, [isLoading, planLoading, isVisitante, isBusiness, isAdmin, formulario, navigate]);

  // Tela de loading enquanto redireciona
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  );
}
