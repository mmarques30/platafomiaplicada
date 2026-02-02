import { useAuth } from "@/hooks/useAuth";
import { useAdminViewContext } from "@/contexts/AdminViewContext";

/**
 * Hook to get the appropriate user ID for Business data fetching.
 * When an admin is simulating as a specific Business user, returns the impersonated user's ID.
 * Otherwise, returns the current authenticated user's ID.
 */
export function useBusinessUserId(): string | undefined {
  const { user } = useAuth();
  const { viewAs, impersonatedUserId } = useAdminViewContext();
  
  // Se admin está visualizando como Business ou Business iAplicada com user específico
  if ((viewAs === 'business' || viewAs === 'business_iaplicada') && impersonatedUserId) {
    return impersonatedUserId;
  }
  
  // Caso contrário, usa o próprio usuário
  return user?.id;
}
