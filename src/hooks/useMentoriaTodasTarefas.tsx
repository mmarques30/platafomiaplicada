import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { TarefaMentoria } from "./useMentoriaTarefas";

export function useMentoriaTodasTarefas() {
  return useQuery({
    queryKey: ["tarefas-todas-mentorados"],
    queryFn: async () => {
      // Buscar TODAS as tarefas de TODOS os mentorados
      const { data: tarefasData, error: tarefasError } = await supabase
        .from("tarefas_mentoria")
        .select("*")
        .order("prazo_entrega", { ascending: true });

      if (tarefasError) throw tarefasError;

      // Buscar perfis de todos os usuários das tarefas
      const userIds = [...new Set(tarefasData?.map(t => t.user_id) || [])];
      
      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("id, nome_completo")
        .in("id", userIds);

      if (profilesError) throw profilesError;

      // Mapear perfis por ID
      const profilesMap = new Map(
        profilesData?.map(p => [p.id, p.nome_completo]) || []
      );

      // Combinar dados
      return (tarefasData || []).map(tarefa => ({
        ...tarefa,
        nome_completo: profilesMap.get(tarefa.user_id) || "Sem nome"
      })) as (TarefaMentoria & { nome_completo: string })[];
    },
  });
}
