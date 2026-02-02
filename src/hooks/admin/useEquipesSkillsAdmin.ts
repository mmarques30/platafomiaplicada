import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface EquipeSkills {
  id: string;
  nome: string;
  empresa_nome: string | null;
  status: string | null;
  lider_id: string | null;
  membros_count: number;
}

export function useEquipesSkillsAdmin() {
  return useQuery({
    queryKey: ["admin-equipes-skills"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("equipes_skills")
        .select(`
          id,
          nome,
          empresa_nome,
          status,
          lider_id
        `)
        .eq("status", "ativo")
        .order("nome");
      
      if (error) throw error;

      // Get member counts separately
      const { data: membros, error: membrosError } = await supabase
        .from("membros_equipe_skills")
        .select("equipe_id")
        .eq("status", "ativo");

      if (membrosError) throw membrosError;

      // Count members per team
      const countByTeam = membros?.reduce((acc, m) => {
        acc[m.equipe_id] = (acc[m.equipe_id] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      return data.map((eq) => ({
        ...eq,
        membros_count: countByTeam[eq.id] || 0,
      })) as EquipeSkills[];
    },
  });
}

export function useCreateEquipeSkills() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ nome, empresa }: { nome: string; empresa: string }) => {
      const { data, error } = await supabase
        .from("equipes_skills")
        .insert({ nome, empresa_nome: empresa, status: "ativo" })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-equipes-skills"] });
      toast.success("Equipe criada com sucesso!");
    },
    onError: (error) => {
      toast.error("Erro ao criar equipe: " + error.message);
    },
  });
}

// Hook para buscar dados de membro Skills de um usuário específico
export function useUserSkillsMembro(userId: string | undefined) {
  return useQuery({
    queryKey: ["user-skills-membro", userId],
    queryFn: async () => {
      if (!userId) return null;
      const { data, error } = await supabase
        .from("membros_equipe_skills")
        .select("id, equipe_id, papel, cargo, status")
        .eq("user_id", userId)
        .eq("status", "ativo")
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });
}

// Hook para atualizar/criar vínculo de membro Skills
export function useUpdateUserSkillsMembro() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      equipeId,
      novaEquipe,
      papelEquipe,
      cargo,
    }: {
      userId: string;
      equipeId?: string | null;
      novaEquipe?: { nome: string; empresa: string } | null;
      papelEquipe: "lider" | "membro";
      cargo?: string;
    }) => {
      let targetEquipeId = equipeId;

      // Se precisa criar nova equipe
      if (novaEquipe && !equipeId) {
        const { data: newEquipe, error: equipeError } = await supabase
          .from("equipes_skills")
          .insert({
            nome: novaEquipe.nome,
            empresa_nome: novaEquipe.empresa,
            status: "ativo",
            lider_id: papelEquipe === "lider" ? userId : null,
          })
          .select()
          .single();

        if (equipeError) throw equipeError;
        targetEquipeId = newEquipe.id;
      }

      if (!targetEquipeId) {
        throw new Error("Equipe é obrigatória");
      }

      // Verificar se já existe vínculo
      const { data: existing } = await supabase
        .from("membros_equipe_skills")
        .select("id")
        .eq("user_id", userId)
        .eq("status", "ativo")
        .maybeSingle();

      if (existing) {
        // Atualizar vínculo existente
        const { error } = await supabase
          .from("membros_equipe_skills")
          .update({
            equipe_id: targetEquipeId,
            papel: papelEquipe,
            cargo: cargo || null,
          })
          .eq("id", existing.id);

        if (error) throw error;
      } else {
        // Criar novo vínculo
        const { error } = await supabase
          .from("membros_equipe_skills")
          .insert({
            user_id: userId,
            equipe_id: targetEquipeId,
            papel: papelEquipe,
            cargo: cargo || null,
            status: "ativo",
          });

        if (error) throw error;
      }

      // Se for líder, atualizar lider_id na equipe
      if (papelEquipe === "lider") {
        await supabase
          .from("equipes_skills")
          .update({ lider_id: userId })
          .eq("id", targetEquipeId);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-equipes-skills"] });
      queryClient.invalidateQueries({ queryKey: ["user-skills-membro"] });
      toast.success("Vínculo Skills atualizado!");
    },
    onError: (error) => {
      toast.error("Erro ao atualizar vínculo: " + error.message);
    },
  });
}

// Hook para remover vínculo de membro Skills
export function useRemoveUserSkillsMembro() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase
        .from("membros_equipe_skills")
        .update({ status: "inativo" })
        .eq("user_id", userId)
        .eq("status", "ativo");

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-equipes-skills"] });
      queryClient.invalidateQueries({ queryKey: ["user-skills-membro"] });
      toast.success("Vínculo Skills removido!");
    },
    onError: (error) => {
      toast.error("Erro ao remover vínculo: " + error.message);
    },
  });
}
