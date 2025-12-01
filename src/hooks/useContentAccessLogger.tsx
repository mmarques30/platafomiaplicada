import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export function useContentAccessLogger() {
  const { user } = useAuth();

  const logAccess = async (
    contentType: 'video' | 'material',
    contentId: string,
    contentTitle: string
  ) => {
    const userEmail = user?.email || 'anônimo';

    // Log de forma assíncrona sem bloquear a navegação
    supabase.from('content_access_logs').insert({
      user_id: user?.id || null,
      user_email: userEmail,
      content_type: contentType,
      content_id: contentId,
      content_title: contentTitle,
    }).then(({ error }) => {
      if (error) console.error('Error logging content access:', error);
    });
  };

  return { logAccess };
}
