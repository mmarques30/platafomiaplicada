import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "./useAuth";

export type BonusMentoria = {
  id: string;
  user_id: string;
  nome: string;
  descricao: string;
  link?: string;
  arquivo_url?: string | string[]; // Pode ser array de URLs
  comando_uso?: string;
  condicao_tipo: 'preenchimento' | 'sorteio';
  condicao_descricao?: string;
  liberado: boolean;
  data_liberacao?: string;
  created_at: string;
  updated_at: string;
};

// Helper para normalizar arquivo_url para array
export const getArquivoUrls = (arquivo_url?: string | string[]): string[] => {
  if (!arquivo_url) return [];
  if (Array.isArray(arquivo_url)) return arquivo_url;
  return [arquivo_url];
};

export const useMentoriaBonus = (userId?: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const targetUserId = userId || user?.id;

  const { data: bonus, isLoading } = useQuery({
    queryKey: ["bonus-mentoria", targetUserId],
    queryFn: async () => {
      if (!targetUserId) return [];
      
      const { data, error } = await supabase
        .from("bonus_mentoria")
        .select("*")
        .eq("user_id", targetUserId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as BonusMentoria[];
    },
    enabled: !!targetUserId,
  });

  const createBonus = useMutation({
    mutationFn: async (bonusData: Partial<BonusMentoria>) => {
      if (!targetUserId) throw new Error("Usuário não identificado");

      const dataToInsert = {
        ...bonusData,
        user_id: targetUserId,
        data_liberacao: bonusData.liberado ? new Date().toISOString() : null
      };

      const { data, error } = await supabase
        .from("bonus_mentoria")
        .insert([dataToInsert as any])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bonus-mentoria"] });
      toast({
        title: "Bônus criado!",
        description: "O bônus foi adicionado com sucesso"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao criar bônus",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const updateBonus = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<BonusMentoria> & { id: string }) => {
      // Se está sendo liberado agora, definir data_liberacao
      const dataToUpdate = {
        ...updates,
        data_liberacao: updates.liberado && !bonus?.find(b => b.id === id)?.liberado 
          ? new Date().toISOString() 
          : updates.data_liberacao
      };

      const { data, error } = await supabase
        .from("bonus_mentoria")
        .update(dataToUpdate)
        .eq("id", id)
        .select()
        .maybeSingle();

      if (error) throw error;
      if (!data) throw new Error("Bônus não encontrado");
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bonus-mentoria"] });
      toast({
        title: "Bônus atualizado!",
        description: "As informações foram salvas"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao atualizar bônus",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const deleteBonus = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("bonus_mentoria")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bonus-mentoria"] });
      toast({
        title: "Bônus removido",
        description: "O bônus foi excluído com sucesso"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao remover bônus",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const uploadArquivo = async (file: File, bonusId: string): Promise<string> => {
    if (!targetUserId) throw new Error("Usuário não identificado");

    const fileExt = file.name.split('.').pop();
    const fileName = `${targetUserId}/${bonusId}/${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('bonus-mentoria')
      .upload(fileName, file);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('bonus-mentoria')
      .getPublicUrl(fileName);

    return publicUrl;
  };

  return {
    bonus: bonus || [],
    isLoading,
    createBonus: createBonus.mutate,
    updateBonus: updateBonus.mutate,
    deleteBonus: deleteBonus.mutate,
    uploadArquivo,
    isCreating: createBonus.isPending,
    isUpdating: updateBonus.isPending,
    isDeleting: deleteBonus.isPending
  };
};
