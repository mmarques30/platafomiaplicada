import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { differenceInDays } from "date-fns";

interface ExpirationNotice {
  id: string;
  notice_type: string;
  shown_at: string | null;
  dismissed_at: string | null;
}

interface VisitorExpirationData {
  diasRestantes: number | null;
  cupomEspecial: string;
  isExpired: boolean;
  notificacaoPendente: ExpirationNotice | null;
  isEngajado: boolean;
}

export function useVisitorExpiration() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["visitor-expiration", user?.id],
    queryFn: async (): Promise<VisitorExpirationData | null> => {
      if (!user) return null;

      // Buscar dados do perfil
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("is_visitante, acesso_expira_em, acesso_expirado, cupom_especial, created_at")
        .eq("id", user.id)
        .single();

      if (profileError || !profile?.is_visitante) {
        return null;
      }

      // Calcular dias restantes
      let diasRestantes: number | null = null;
      if (profile.acesso_expira_em) {
        const expiraEm = new Date(profile.acesso_expira_em);
        diasRestantes = differenceInDays(expiraEm, new Date());
      }

      // Buscar notificações pendentes (não dismissed)
      const { data: notices } = await supabase
        .from("visitor_expiration_notices")
        .select("*")
        .eq("user_id", user.id)
        .is("dismissed_at", null)
        .order("created_at", { ascending: false });

      // Verificar engajamento (simplificado - baseado no cupom já atribuído)
      const isEngajado = profile.cupom_especial === "Academy15";

      return {
        diasRestantes,
        cupomEspecial: profile.cupom_especial || "Academy12",
        isExpired: profile.acesso_expirado || false,
        notificacaoPendente: notices?.[0] || null,
        isEngajado,
      };
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });

  const dismissNotice = useMutation({
    mutationFn: async (noticeId: string) => {
      const { error } = await supabase
        .from("visitor_expiration_notices")
        .update({ dismissed_at: new Date().toISOString() })
        .eq("id", noticeId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["visitor-expiration"] });
    },
  });

  return {
    data,
    isLoading,
    dismissNotice,
  };
}
