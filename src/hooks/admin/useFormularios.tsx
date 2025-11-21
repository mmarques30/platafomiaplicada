import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useFormularios() {
  return useQuery({
    queryKey: ["admin-formularios"],
    queryFn: async () => {
      console.log("Fetching formularios for admin...");
      
      const { data, error } = await supabase
        .from("formulario_diagnostico")
        .select("*, profiles(nome_completo)")
        .order("created_at", { ascending: false });
      
      if (error) {
        console.error("Error fetching formularios:", error);
        throw error;
      }
      
      console.log("Formularios fetched:", data?.length, "forms");
      return data;
    },
    refetchOnWindowFocus: true,
    refetchOnMount: "always",
    staleTime: 0,
  });
}

export function useFormulario(id: string) {
  return useQuery({
    queryKey: ["formulario", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("formulario_diagnostico")
        .select("*, profiles(nome_completo)")
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
}
