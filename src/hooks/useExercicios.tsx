import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function useExercicios(videoId?: string) {
  return useQuery({
    queryKey: ["exercicios", videoId],
    queryFn: async () => {
      let query = supabase
        .from("exercicios_praticos")
        .select("*")
        .eq("ativo", true);
      
      if (videoId) {
        query = query.eq("video_id", videoId);
      }
      
      const { data, error } = await query.order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!videoId || videoId === undefined,
  });
}

export function useRespostasExercicios(exercicioId?: string) {
  return useQuery({
    queryKey: ["respostas-exercicios", exercicioId],
    queryFn: async () => {
      let query = supabase
        .from("respostas_exercicios")
        .select("*, exercicios_praticos(*)");
      
      if (exercicioId) {
        query = query.eq("exercicio_id", exercicioId);
      }
      
      const { data, error } = await query.order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useMinhasRespostas() {
  return useQuery({
    queryKey: ["minhas-respostas"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("respostas_exercicios")
        .select("*, exercicios_praticos(titulo, video_id)")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });
}

export function useCreateResposta() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (resposta: any) => {
      const { error } = await supabase.from("respostas_exercicios").insert(resposta);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["respostas-exercicios"] });
      queryClient.invalidateQueries({ queryKey: ["minhas-respostas"] });
      toast.success("Resposta enviada com sucesso!");
    },
    onError: (error: any) => toast.error("Erro ao enviar resposta: " + error.message),
  });
}

export function useAvaliarResposta() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, nota, feedback_mentor, status }: any) => {
      const { error } = await supabase
        .from("respostas_exercicios")
        .update({ nota, feedback_mentor, status })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["respostas-exercicios"] });
      toast.success("Avaliação salva com sucesso!");
    },
    onError: (error: any) => toast.error("Erro ao avaliar: " + error.message),
  });
}
