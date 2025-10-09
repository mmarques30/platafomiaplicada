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
      // Criar usuário via Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            nome_completo: nomeCompleto,
          },
        },
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error("Usuário não foi criado");

      // Atualizar profile com plano_mentoria e marcar senha como temporária
      const updateData: any = {
        senha_temporaria: true,
        primeiro_acesso: true
      };
      
      if (planoMentoria) {
        updateData.plano_mentoria = planoMentoria;
      }

      const { error: profileError } = await supabase
        .from("profiles")
        .update(updateData)
        .eq("id", authData.user.id);
      
      if (profileError) throw profileError;

      // Adicionar roles
      if (roles.length > 0) {
        const { error: rolesError } = await supabase
          .from("user_roles")
          .insert(roles.map((role) => ({ user_id: authData.user.id, role })));

        if (rolesError) throw rolesError;
      }

      return authData.user;
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
