import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useFormularios() {
  return useQuery({
    queryKey: ["admin-formularios"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("formulario_diagnostico")
        .select("*, profiles(nome_completo)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useFormulario(id: string) {
  return useQuery({
    queryKey: ["formulario", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("formulario_diagnostico")
        .select("*, profiles(nome_completo, email)")
        .eq("id", id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
}
