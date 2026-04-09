import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "@/hooks/use-toast";

export interface MetaAcademy {
  id: string;
  user_id: string;
  titulo: string;
  descricao: string | null;
  tipo: string;
  status: string;
  prioridade: string;
  prazo: string | null;
  objetivo_vinculado: string | null;
  etapa_vinculada: number | null;
  created_at: string;
  updated_at: string;
}

export const useMetasAcademy = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: metas = [], isLoading } = useQuery({
    queryKey: ["metas-academy", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("metas_academy")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as MetaAcademy[];
    },
    enabled: !!user,
  });

  const createMeta = useMutation({
    mutationFn: async (meta: Partial<MetaAcademy>) => {
      if (!user) throw new Error("Não autenticado");
      const { error } = await supabase.from("metas_academy").insert({
        user_id: user.id,
        titulo: meta.titulo!,
        descricao: meta.descricao,
        tipo: meta.tipo || "tarefa",
        status: meta.status || "pendente",
        prioridade: meta.prioridade || "media",
        prazo: meta.prazo,
        objetivo_vinculado: meta.objetivo_vinculado,
        etapa_vinculada: meta.etapa_vinculada,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["metas-academy"] });
      toast({ title: "Meta criada com sucesso!" });
    },
    onError: () => toast({ title: "Erro ao criar meta", variant: "destructive" }),
  });

  const updateMeta = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<MetaAcademy> & { id: string }) => {
      const { error } = await supabase.from("metas_academy").update(updates).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["metas-academy"] });
    },
  });

  const deleteMeta = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("metas_academy").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["metas-academy"] });
      toast({ title: "Meta removida" });
    },
  });

  const pendentes = metas.filter((m) => m.status === "pendente");
  const emAndamento = metas.filter((m) => m.status === "em_andamento");
  const concluidas = metas.filter((m) => m.status === "concluida");

  return {
    metas,
    pendentes,
    emAndamento,
    concluidas,
    isLoading,
    createMeta: createMeta.mutate,
    updateMeta: updateMeta.mutate,
    deleteMeta: deleteMeta.mutate,
    isCreating: createMeta.isPending,
  };
};
