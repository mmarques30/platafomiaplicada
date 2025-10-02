import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export const useInsightIA = () => {
  const queryClient = useQueryClient();

  const gerarInsightMutation = useMutation({
    mutationFn: async (formularioId: string) => {
      const { data, error } = await supabase.functions.invoke('gerar-insight-mentoria', {
        body: { formulario_id: formularioId }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["formulario-diagnostico"] });
      toast({
        title: "Insight gerado com sucesso! ✨",
        description: "Sua análise personalizada está pronta"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao gerar insight",
        description: error.message || "Tente novamente mais tarde",
        variant: "destructive"
      });
    }
  });

  return {
    gerarInsight: gerarInsightMutation.mutate,
    isGenerating: gerarInsightMutation.isPending
  };
};
