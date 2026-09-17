import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// O que o admin marca é permissão de equipe. aluno_trilha (cliente) é derivado do plano.
type AppRole = "admin" | "equipe" | "aluno_trilha";

export function useUsers() {
  return useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("*, plano_mentoria, email_acesso_enviado, adicionado_grupo_whatsapp")
        .eq("is_visitante", false)
        .order("created_at", { ascending: false });

      if (profilesError) throw profilesError;

      const { data: roles, error: rolesError } = await supabase
        .from("user_roles")
        .select("*");

      if (rolesError) throw rolesError;

      return profiles.map((profile) => ({
        ...profile,
        roles: roles.filter((r) => r.user_id === profile.id).map((r) => r.role),
      }));
    },
  });
}

export function useUserRoles(userId: string) {
  return useQuery({
    queryKey: ["user-roles", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_roles")
        .select("*")
        .eq("user_id", userId);

      if (error) throw error;
      return data.map((r) => r.role);
    },
    enabled: !!userId,
  });
}

export function useUpdateUserRoles() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      roles,
    }: {
      userId: string;
      roles: AppRole[];
    }) => {
      // Primeiro, remove todas as roles existentes
      const { error: deleteError } = await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", userId);

      if (deleteError) throw deleteError;

      // Depois, insere as novas roles
      if (roles.length > 0) {
        const { error: insertError } = await supabase
          .from("user_roles")
          .insert(roles.map((role) => ({ user_id: userId, role })));

        if (insertError) throw insertError;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      queryClient.invalidateQueries({ queryKey: ["user-roles"] });
      toast.success("Roles atualizadas com sucesso!");
    },
    onError: (error) => {
      toast.error("Erro ao atualizar roles: " + error.message);
    },
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      email,
      password,
      nomeCompleto,
      roles,
      planoMentoria,
    }: {
      email: string;
      password: string;
      nomeCompleto: string;
      roles: AppRole[];
      planoMentoria?: string | null;
    }) => {
      const { data, error } = await supabase.functions.invoke("create-user-admin", {
        body: { email, password, nomeCompleto, roles, planoMentoria },
      });
      if (error) {
        // FunctionsHttpError do supabase-js v2 expõe a Response em error.context.
        // Lê o body como texto e tenta extrair { error } JSON — caso contrário
        // usa o texto cru. Sem isso o usuário só via "non-2xx status code".
        let realMessage = error.message;
        const resp = (error as any)?.context as Response | undefined;
        if (resp && typeof resp.text === "function") {
          try {
            const text = await resp.text();
            if (text) {
              try {
                const json = JSON.parse(text);
                if (json?.error) realMessage = json.error;
                else if (json?.message) realMessage = json.message;
              } catch {
                realMessage = text.slice(0, 500);
              }
            }
          } catch {
            // ignora — mantém realMessage default
          }
        }
        throw new Error(realMessage);
      }
      if (data?.error) throw new Error(data.error);

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success("Usuário criado com sucesso!");
    },
    onError: (error: any) => {
      const msg = error?.message || String(error);
      if (msg.includes("already been registered") || msg.includes("email_exists")) {
        toast.error("Este email já está cadastrado no sistema. Use outro email ou edite o usuário existente.");
      } else {
        toast.error("Erro ao criar usuário: " + msg);
      }
    },
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      updates,
    }: {
      userId: string;
      updates: {
        nome_completo?: string;
        email?: string;
        profissao?: string | null;
        idade?: number | null;
        linkedin?: string | null;
        plano_mentoria?: "academy" | "insider_business" | "insider_convidado" | null;
        data_expiracao_acesso?: string | null;
        conta_ativa?: boolean;
        roles?: AppRole[];
        google_login_autorizado?: boolean;
      };
    }) => {
      const { roles, ...profileUpdates } = updates;
      
      // Atualizar profile
      if (Object.keys(profileUpdates).length > 0) {
        // Normalizar plano_mentoria antes de enviar ao banco
        const normalizedUpdates: any = { ...profileUpdates };
        if ('plano_mentoria' in normalizedUpdates) {
          normalizedUpdates.plano_mentoria = normalizedUpdates.plano_mentoria || null;
        }
        
        const { error: profileError } = await supabase
          .from("profiles")
          .update(normalizedUpdates)
          .eq("id", userId);
          
        if (profileError) throw profileError;
      }
      
      // Atualizar roles
      if (roles !== undefined) {
        // Deletar roles antigas
        const { error: deleteError } = await supabase
          .from("user_roles")
          .delete()
          .eq("user_id", userId);
          
        if (deleteError) throw deleteError;
        
        // Inserir novas roles
        if (roles.length > 0) {
          const { error: insertError } = await supabase
            .from("user_roles")
            .insert(roles.map(role => ({ user_id: userId, role })));
            
          if (insertError) throw insertError;
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success("Usuário atualizado com sucesso!");
    },
    onError: (error) => {
      toast.error("Erro ao atualizar usuário: " + error.message);
    },
  });
}

export function useResetUserPassword() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      newPassword,
      forcaAlteracao = false,
    }: {
      userId: string;
      newPassword: string;
      forcaAlteracao?: boolean;
    }) => {
      // Chamar edge function para resetar senha
      const { error: functionError } = await supabase.functions.invoke("reset-user-password", {
        body: { userId, newPassword },
      });

      if (functionError) throw functionError;
      
      // Marcar como senha temporária se forçar
      if (forcaAlteracao) {
        const { error } = await supabase
          .from("profiles")
          .update({
            senha_temporaria: true,
            primeiro_acesso: true,
          })
          .eq("id", userId);
          
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success("Senha resetada com sucesso!");
    },
    onError: (error) => {
      toast.error("Erro ao resetar senha: " + error.message);
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId }: { userId: string }) => {
      // RPC SECURITY DEFINER: evita "Database error deleting user" do
      // auth.admin.deleteUser quando o CASCADE/SET NULL esbarra em RLS.
      const { data, error } = await supabase.rpc("admin_delete_user", {
        p_user_id: userId,
      });

      if (error) throw new Error(error.message);
      if (data && typeof data === "object" && "error" in data && (data as { error?: string }).error) {
        throw new Error(String((data as { error?: string }).error));
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success("Usuário excluído com sucesso!");
    },
    onError: (error: any) => {
      toast.error("Erro ao excluir usuário: " + error.message);
    },
  });
}

export function useUpdateOnboardingStatus() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      userId, 
      field, 
      value 
    }: { 
      userId: string; 
      field: 'email_acesso_enviado' | 'adicionado_grupo_whatsapp'; 
      value: boolean 
    }) => {
      const { error } = await supabase
        .from("profiles")
        .update({ [field]: value })
        .eq("id", userId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success("Status atualizado!");
    },
    onError: (error) => {
      toast.error("Erro ao atualizar status: " + error.message);
    },
  });
}
