import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export function useButtonClickLogger() {
  const { user } = useAuth();
  
  const logClick = async (buttonType: string, pageOrigin: string) => {
    try {
      // Registra clique de forma assíncrona (não-bloqueante)
      await supabase.from('button_click_logs').insert({
        user_id: user?.id || null,
        user_email: user?.email || 'anônimo',
        button_type: buttonType,
        page_origin: pageOrigin
      });
    } catch (error) {
      // Silently fail - não queremos bloquear o usuário
      console.error('Erro ao registrar clique:', error);
    }
  };
  
  return { logClick };
}
