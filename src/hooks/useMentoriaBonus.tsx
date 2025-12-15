import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "./useAuth";

export type PublicoAlvo = 'todos' | 'academy' | 'lab' | 'club' | 'skills' | 'usuario_especifico';

export type BonusMentoria = {
  id: string;
  user_id?: string | null;
  nome: string;
  descricao: string;
  link?: string;
  arquivo_url?: string | string[];
  comando_uso?: string;
  condicao_tipo: 'preenchimento' | 'sorteio';
  condicao_descricao?: string;
  liberado: boolean;
  data_liberacao?: string;
  publico_alvo: PublicoAlvo;
  created_at: string;
  updated_at: string;
};

// Helper para normalizar arquivo_url para array
export const getArquivoUrls = (arquivo_url?: string | string[]): string[] => {
  if (!arquivo_url) return [];
  if (Array.isArray(arquivo_url)) return arquivo_url;
  return [arquivo_url];
};

// Helper para label do público-alvo
export const getPublicoAlvoLabel = (publico: PublicoAlvo): string => {
  const labels: Record<PublicoAlvo, string> = {
    todos: 'Todos os mentorados',
    academy: 'Plano Academy',
    lab: 'Plano Lab',
    club: 'Plano Club',
    skills: 'Plano Skills',
    usuario_especifico: 'Usuário específico'
  };
  return labels[publico] || publico;
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
      const dataToInsert = {
        ...bonusData,
        user_id: bonusData.publico_alvo === 'usuario_especifico' ? (bonusData.user_id || targetUserId) : null,
        publico_alvo: bonusData.publico_alvo || 'usuario_especifico',
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
      queryClient.invalidateQueries({ queryKey: ["bonus-globais"] });
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
      const dataToUpdate = {
        ...updates,
        user_id: updates.publico_alvo === 'usuario_especifico' ? updates.user_id : null,
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
      queryClient.invalidateQueries({ queryKey: ["bonus-globais"] });
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
      queryClient.invalidateQueries({ queryKey: ["bonus-globais"] });
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
    const uploadUserId = targetUserId || 'global';

    const fileExt = file.name.split('.').pop();
    const fileName = `${uploadUserId}/${bonusId}/${Date.now()}.${fileExt}`;

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

// Hook separado para bônus globais (admin)
export const useBonusGlobais = () => {
  const queryClient = useQueryClient();

  const { data: bonusGlobais, isLoading } = useQuery({
    queryKey: ["bonus-globais"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bonus_mentoria")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as BonusMentoria[];
    },
  });

  const createBonus = useMutation({
    mutationFn: async (bonusData: Partial<BonusMentoria>) => {
      const dataToInsert = {
        ...bonusData,
        user_id: bonusData.publico_alvo === 'usuario_especifico' ? bonusData.user_id : null,
        publico_alvo: bonusData.publico_alvo || 'todos',
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
      queryClient.invalidateQueries({ queryKey: ["bonus-globais"] });
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
      const dataToUpdate = {
        ...updates,
        user_id: updates.publico_alvo === 'usuario_especifico' ? updates.user_id : null,
        data_liberacao: updates.liberado && !bonusGlobais?.find(b => b.id === id)?.liberado 
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
      queryClient.invalidateQueries({ queryKey: ["bonus-globais"] });
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
      queryClient.invalidateQueries({ queryKey: ["bonus-globais"] });
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

  return {
    bonusGlobais: bonusGlobais || [],
    isLoading,
    createBonus: createBonus.mutate,
    updateBonus: updateBonus.mutate,
    deleteBonus: deleteBonus.mutate,
    isCreating: createBonus.isPending,
    isUpdating: updateBonus.isPending,
    isDeleting: deleteBonus.isPending
  };
};
