import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export function usePromptCopyLogger() {
  const { user } = useAuth();

  const logPromptCopy = async (promptId: string, promptTitulo: string) => {
    if (!user) return;
    
    try {
      await (supabase.from('prompt_copy_logs' as any) as any).insert({
        user_id: user.id,
        user_email: user.email || 'anônimo',
        prompt_id: promptId,
        prompt_titulo: promptTitulo,
      });
    } catch (error) {
      console.error('Error logging prompt copy:', error);
    }
  };

  return { logPromptCopy };
}
