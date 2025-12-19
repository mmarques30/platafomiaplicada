import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useAtualizarConteudosProjeto = () => {
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();

  const atualizarConteudos = async (projetoId: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("atualizar-conteudos-projeto", {
        body: { projeto_id: projetoId },
      });

      if (error) {
        console.error("Erro ao atualizar conteúdos:", error);
        toast.error("Erro ao atualizar conteúdos do projeto");
        return false;
      }

      if (data?.success) {
        toast.success(
          `Conteúdos atualizados: ${data.trilhas_recomendadas} trilha(s) e ${data.modulos_obrigatorios} módulo(s)`
        );
        // Invalidar queries relacionadas
        queryClient.invalidateQueries({ queryKey: ["projeto-preparacao", projetoId] });
        queryClient.invalidateQueries({ queryKey: ["painel-diagnostico"] });
        queryClient.invalidateQueries({ queryKey: ["projetos-mentoria"] });
        return true;
      }

      toast.error(data?.error || "Erro desconhecido");
      return false;
    } catch (err) {
      console.error("Erro ao chamar função:", err);
      toast.error("Erro ao conectar com o servidor");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return { atualizarConteudos, isLoading };
};
