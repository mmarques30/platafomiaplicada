import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useFavoritos = () => {
  return useQuery({
    queryKey: ["favoritos"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("favoritos")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });
};

export const useToggleFavorito = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ tipo, item_id }: { tipo: string; item_id: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data: existing, error: checkError } = await supabase
        .from("favoritos")
        .select()
        .eq("user_id", user.id)
        .eq("tipo", tipo)
        .eq("item_id", item_id)
        .maybeSingle();

      if (checkError) throw checkError;

      if (existing) {
        const { error: deleteError } = await supabase
          .from("favoritos")
          .delete()
          .eq("id", existing.id);

        if (deleteError) throw deleteError;
        return { action: "removed" };
      } else {
        const { error: insertError } = await supabase
          .from("favoritos")
          .insert({
            user_id: user.id,
            tipo,
            item_id,
          });

        if (insertError) throw insertError;
        return { action: "added" };
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["favoritos"] });
      toast.success(
        data.action === "added"
          ? "Adicionado aos favoritos"
          : "Removido dos favoritos"
      );
    },
    onError: () => {
      toast.error("Erro ao atualizar favoritos");
    },
  });
};

export const useIsFavorito = (tipo: string, item_id: string) => {
  const { data: favoritos } = useFavoritos();
  return favoritos?.some((f) => f.tipo === tipo && f.item_id === item_id) ?? false;
};
