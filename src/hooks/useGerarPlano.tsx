import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export const useGerarPlano = () => {
  const queryClient = useQueryClient();

  const gerarPlano = useMutation({
    mutationFn: async (userId: string) => {
      const { data, error } = await supabase.functions.invoke('gerar-objetivos-diagnostico', {
        body: { userId }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["diagnostico-admin"] });
      queryClient.invalidateQueries({ queryKey: ["objetivos-mentoria"] });
      queryClient.invalidateQueries({ queryKey: ["tarefas-mentoria"] });
      
      toast({
        title: "✨ Plano de mentoria criado!",
        description: `${data.total_objetivos} objetivos e ${data.total_tarefas} tarefas foram adicionados ao plano do mentorado.`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao gerar plano",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  return {
    gerarPlano: gerarPlano.mutate,
    isGerando: gerarPlano.isPending,
  };
};
