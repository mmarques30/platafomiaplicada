import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useModulosDisponiveis = () => {
  const { data: trilhas, isLoading: isLoadingTrilhas } = useQuery({
    queryKey: ["trilhas-disponiveis"],
    queryFn: async () => {
    const { data, error } = await supabase
      .from("trilhas")
      .select("id, titulo, categoria, imagem_url, ordem, ativo, visivel_mentorados, visivel_apenas_pro")
      .order("ordem");
      
      if (error) throw error;
      return data;
    }
  });

  const fetchModulosPorTrilha = async (trilhaId: string) => {
    const { data, error } = await supabase
      .from("modulos")
      .select("id, titulo, descricao, categoria, ordem, ativo, visivel_mentorados, visivel_apenas_pro")
      .eq("trilha_id", trilhaId)
      .order("ordem");
    
    if (error) throw error;
    return data;
  };

  const fetchVideosPorModulo = async (moduloId: string) => {
    const { data, error } = await supabase
      .from("videos")
      .select("id, titulo, duracao, ativo, visivel_mentorados, visivel_apenas_pro")
      .eq("modulo_id", moduloId)
      .order("ordem");
    
    if (error) throw error;
    return data;
  };

  return { 
    trilhas: trilhas || [], 
    isLoadingTrilhas,
    fetchModulosPorTrilha,
    fetchVideosPorModulo
  };
};
