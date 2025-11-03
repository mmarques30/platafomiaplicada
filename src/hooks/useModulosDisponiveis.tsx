import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useModulosDisponiveis = () => {
  const { data: trilhas, isLoading: isLoadingTrilhas } = useQuery({
    queryKey: ["trilhas-disponiveis"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("trilhas")
        .select("id, titulo, categoria, imagem_url, ordem")
        .eq("ativo", true)
        .order("ordem");
      
      if (error) throw error;
      return data;
    }
  });

  const fetchModulosPorTrilha = async (trilhaId: string) => {
    const { data, error } = await supabase
      .from("modulos")
      .select("id, titulo, descricao, categoria, ordem")
      .eq("trilha_id", trilhaId)
      .eq("ativo", true)
      .order("ordem");
    
    if (error) throw error;
    return data;
  };

  const fetchVideosPorModulo = async (moduloId: string) => {
    const { data, error } = await supabase
      .from("videos")
      .select("id, titulo, duracao")
      .eq("modulo_id", moduloId)
      .eq("ativo", true)
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
