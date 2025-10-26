import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type AppRole = "admin" | "mentorado" | "aluno_trilha";

export function useUsers() {
  return useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("*, plano_mentoria")
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
      // Chamar edge function ao invés de fazer diretamente
      const { data, error } = await supabase.functions.invoke("create-user-admin", {
        body: { 
          email, 
          password, 
          nomeCompleto, 
          roles,
          planoMentoria 
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success("Usuário criado com sucesso!");
    },
    onError: (error) => {
      toast.error("Erro ao criar usuário: " + error.message);
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
        plano_mentoria?: "club" | "pro" | "" | null;
        data_expiracao_acesso?: string | null;
        conta_ativa?: boolean;
        roles?: AppRole[];
      };
    }) => {
      const { roles, ...profileUpdates } = updates;
      
      // Atualizar profile
      if (Object.keys(profileUpdates).length > 0) {
        // Normalizar plano_mentoria antes de enviar ao banco
        const normalizedUpdates: any = { ...profileUpdates };
        if ('plano_mentoria' in normalizedUpdates) {
          normalizedUpdates.plano_mentoria = normalizedUpdates.plano_mentoria === "" 
            ? null 
            : normalizedUpdates.plano_mentoria;
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
      const { data, error: functionError } = await supabase.functions.invoke("delete-user", {
        body: { userId },
      });

      if (functionError) throw functionError;
      if (data?.error) throw new Error(data.error);
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
