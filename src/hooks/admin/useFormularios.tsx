import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useFormularios() {
  return useQuery({
    queryKey: ["admin-formularios"],
    queryFn: async () => {
      console.log("Fetching formularios for admin...");
      
      // Buscar diagnósticos sem JOIN (evita erro de FK)
      const { data: formularios, error } = await supabase
        .from("formulario_diagnostico")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) {
        console.error("Error fetching formularios:", error);
        throw error;
      }
      
      // Buscar nomes dos usuários separadamente
      const userIds = formularios?.map(f => f.user_id).filter(Boolean) || [];
      
      let profiles: { id: string; nome_completo: string; plano_mentoria: string | null }[] = [];
      if (userIds.length > 0) {
        const { data: profilesData } = await supabase
          .from("profiles")
          .select("id, nome_completo, plano_mentoria")
          .in("id", userIds);
        
        profiles = profilesData || [];
      }
      
      // Combinar dados
      const result = formularios?.map(f => ({
        ...f,
        profiles: profiles.find(p => p.id === f.user_id) || null
      })) || [];
      
      console.log("Formularios fetched:", result.length, "forms");
      return result;
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
      const { data: formulario, error } = await supabase
        .from("formulario_diagnostico")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      
      if (error) throw error;
      if (!formulario) return null;
      
      // Buscar profile separadamente
      const { data: profile } = await supabase
        .from("profiles")
        .select("id, nome_completo")
        .eq("id", formulario.user_id)
        .maybeSingle();
      
      return {
        ...formulario,
        profiles: profile || null
      };
    },
    enabled: !!id,
  });
}
