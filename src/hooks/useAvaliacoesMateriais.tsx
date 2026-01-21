import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "./useAuth";

export interface AvaliacaoMaterial {
  id: string;
  material_id: string;
  user_id: string;
  nota: number;
  comentario: string | null;
  created_at: string;
  updated_at: string;
  user?: {
    id: string;
    nome_completo: string;
    avatar_url: string | null;
  } | null;
}

export function useAvaliacoesMateriais(materialId: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: avaliacoes, isLoading } = useQuery({
    queryKey: ["avaliacoes-material", materialId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("avaliacoes_materiais_comunidade")
        .select(`
          *,
          user:user_id (
            id,
            nome_completo,
            avatar_url
          )
        `)
        .eq("material_id", materialId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as AvaliacaoMaterial[];
    },
    enabled: !!materialId,
  });

  const { data: minhaAvaliacao } = useQuery({
    queryKey: ["minha-avaliacao", materialId, user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const { data, error } = await supabase
        .from("avaliacoes_materiais_comunidade")
        .select("*")
        .eq("material_id", materialId)
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;
      return data as AvaliacaoMaterial | null;
    },
    enabled: !!materialId && !!user?.id,
  });

  const submitAvaliacao = useMutation({
    mutationFn: async ({ nota, comentario }: { nota: number; comentario?: string }) => {
      if (!user?.id) throw new Error("Usuario nao autenticado");

      const { error } = await supabase
        .from("avaliacoes_materiais_comunidade")
        .upsert({
          material_id: materialId,
          user_id: user.id,
          nota,
          comentario: comentario || null,
        }, {
          onConflict: "material_id,user_id",
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["avaliacoes-material", materialId] });
      queryClient.invalidateQueries({ queryKey: ["minha-avaliacao", materialId] });
      queryClient.invalidateQueries({ queryKey: ["materiais-comunidade"] });
      toast.success("Avaliacao enviada com sucesso! +2 pontos");
    },
    onError: () => {
      toast.error("Erro ao enviar avaliacao");
    },
  });

  return {
    avaliacoes: avaliacoes || [],
    minhaAvaliacao,
    isLoading,
    submitAvaliacao,
  };
}
