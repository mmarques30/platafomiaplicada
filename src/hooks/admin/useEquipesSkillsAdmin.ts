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
