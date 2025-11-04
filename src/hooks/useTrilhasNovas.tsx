import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useTrilhasNovas = () => {
  return useQuery({
    queryKey: ["trilhas-novas"],
    queryFn: async () => {
      const trintaDiasAtras = new Date();
      trintaDiasAtras.setDate(trintaDiasAtras.getDate() - 30);
      
      const { data, error } = await supabase
        .from("trilhas")
        .select(`
          *,
          videos:videos(count)
        `)
        .eq("ativo", true)
        .eq("visivel_mentorados", true)
        .gte("created_at", trintaDiasAtras.toISOString())
        .order("created_at", { ascending: false })
        .limit(10);
      
      if (error) throw error;
      return data || [];
    }
  });
};
