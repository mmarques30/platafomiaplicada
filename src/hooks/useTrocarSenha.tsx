import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function useTrocarSenha() {
  const trocarSenha = useMutation({
    mutationFn: async ({ 
      novaSenha, 
      userId 
    }: { 
      novaSenha: string; 
      userId: string;
    }) => {
      // 1. Atualizar senha no Auth
      const { error: authError } = await supabase.auth.updateUser({ 
        password: novaSenha 
      });

      if (authError) throw authError;
      
      // 2. Atualizar flags no perfil
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          senha_temporaria: false,
          senha_alterada_em: new Date().toISOString()
        })
        .eq('id', userId);

      if (profileError) throw profileError;
      
      // 3. Registrar em auditoria
      await supabase.from('auditoria_conteudo').insert({
        tabela: 'auth.users',
        registro_id: userId,
        operacao: 'PASSWORD_CHANGE',
        user_id: userId,
        dados_novos: { senha_alterada_em: new Date().toISOString() }
      });
    },
    onSuccess: () => {
      toast.success("Senha atualizada com sucesso!");
    },
    onError: (error: any) => {
      toast.error("Erro ao atualizar senha: " + error.message);
    }
  });
  
  return {
    trocarSenha: trocarSenha.mutate,
    isLoading: trocarSenha.isPending,
  };
}
