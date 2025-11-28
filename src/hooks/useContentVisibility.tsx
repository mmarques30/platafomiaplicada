import { useUserRole } from "./useUserRole";

export function useContentVisibility() {
  const { isVisitante, isLoading } = useUserRole();
  
  // Retorna o campo de visibilidade apropriado baseado no tipo de usuário
  const visibilityField = isVisitante ? "visivel_visitantes" : "visivel_mentorados";
  
  return {
    visibilityField,
    isVisitante,
    isLoading
  };
}
