import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "./useAuth";

export type PublicoAlvo = 'todos' | 'academy' | 'lab' | 'club' | 'skills' | 'usuario_especifico' | 'usuarios_especificos';

export type BonusUsuarioElegivel = {
  id: string;
  bonus_id: string;
  user_id: string;
  liberado: boolean;
  data_liberacao?: string;
  created_at: string;
  // Joined data
  user?: {
    id: string;
    nome_completo: string;
  };
};

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
  // For usuarios_especificos - can be full data or just user_id/liberado
  usuarios_elegiveis?: BonusUsuarioElegivel[] | { user_id: string; liberado: boolean; nome_completo?: string }[];
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
    usuario_especifico: 'Usuário específico',
    usuarios_especificos: 'Usuários específicos'
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
      
      // Buscar perfil do usuário para saber o plano
      const { data: profile } = await supabase
        .from("profiles")
        .select("plano_mentoria")
        .eq("id", targetUserId)
        .single();
      
      const userPlan = profile?.plano_mentoria;

      // Buscar todos os bônus
      const { data: allBonus, error } = await supabase
        .from("bonus_mentoria")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Buscar elegibilidades do usuário
      const { data: eligibilities } = await supabase
        .from("bonus_usuarios_elegiveis")
        .select("*")
        .eq("user_id", targetUserId);

      // Filtrar bônus baseado no público-alvo
      const filteredBonus = (allBonus || []).filter(b => {
        // Se é usuarios_especificos, verificar se usuário está na lista
        if (b.publico_alvo === 'usuarios_especificos') {
          const eligibility = eligibilities?.find(e => e.bonus_id === b.id);
          if (eligibility) {
            // Retorna com status de liberação individual
            return true;
          }
          return false;
        }
        
        // Se é usuario_especifico (legado), verificar user_id
        if (b.publico_alvo === 'usuario_especifico') {
          return b.user_id === targetUserId;
        }
        
        // Se é para todos
        if (b.publico_alvo === 'todos') return true;
        
        // Se é para um plano específico
        return b.publico_alvo === userPlan;
      }).map(b => {
        // Para usuarios_especificos, pegar status de liberação individual
        if (b.publico_alvo === 'usuarios_especificos') {
          const eligibility = eligibilities?.find(e => e.bonus_id === b.id);
          return {
            ...b,
            liberado: eligibility?.liberado || false,
            data_liberacao: eligibility?.data_liberacao || null
          };
        }
        return b;
      });

      return filteredBonus as BonusMentoria[];
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
      const { data: allBonus, error } = await supabase
        .from("bonus_mentoria")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Para cada bônus com usuarios_especificos, buscar os elegíveis
      const bonusWithEligibility = await Promise.all(
        (allBonus || []).map(async (bonus) => {
          if (bonus.publico_alvo === 'usuarios_especificos') {
            const { data: eligibles } = await supabase
              .from("bonus_usuarios_elegiveis")
              .select(`
                id,
                bonus_id,
                user_id,
                liberado,
                data_liberacao,
                created_at,
                profiles:user_id (
                  id,
                  nome_completo
                )
              `)
              .eq("bonus_id", bonus.id);

            return {
              ...bonus,
              usuarios_elegiveis: (eligibles || []).map(e => ({
                ...e,
                user: e.profiles
              }))
            };
          }
          return bonus;
        })
      );

      return bonusWithEligibility as BonusMentoria[];
    },
  });

  const createBonus = useMutation({
    mutationFn: async (bonusData: Partial<BonusMentoria> & { usuarios_elegiveis?: { user_id: string; liberado: boolean }[] }) => {
      const { usuarios_elegiveis, ...rest } = bonusData;
      
      const dataToInsert = {
        ...rest,
        user_id: rest.publico_alvo === 'usuario_especifico' ? rest.user_id : null,
        publico_alvo: rest.publico_alvo || 'todos',
        // Para usuarios_especificos, liberado global é sempre false (gerenciado individualmente)
        liberado: rest.publico_alvo === 'usuarios_especificos' ? false : (rest.liberado || false),
        data_liberacao: rest.liberado && rest.publico_alvo !== 'usuarios_especificos' ? new Date().toISOString() : null
      };

      const { data, error } = await supabase
        .from("bonus_mentoria")
        .insert([dataToInsert as any])
        .select()
        .single();

      if (error) throw error;

      // Se for usuarios_especificos, criar registros de elegibilidade
      if (rest.publico_alvo === 'usuarios_especificos' && usuarios_elegiveis?.length) {
        const eligibilityRecords = usuarios_elegiveis.map(u => ({
          bonus_id: data.id,
          user_id: u.user_id,
          liberado: u.liberado,
          data_liberacao: u.liberado ? new Date().toISOString() : null
        }));

        const { error: eligError } = await supabase
          .from("bonus_usuarios_elegiveis")
          .insert(eligibilityRecords);

        if (eligError) throw eligError;
      }

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
    mutationFn: async ({ id, usuarios_elegiveis, ...updates }: Partial<BonusMentoria> & { id: string; usuarios_elegiveis?: { user_id: string; liberado: boolean }[] }) => {
      const dataToUpdate = {
        ...updates,
        user_id: updates.publico_alvo === 'usuario_especifico' ? updates.user_id : null,
        liberado: updates.publico_alvo === 'usuarios_especificos' ? false : updates.liberado,
        data_liberacao: updates.liberado && updates.publico_alvo !== 'usuarios_especificos' && !bonusGlobais?.find(b => b.id === id)?.liberado 
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

      // Se for usuarios_especificos, atualizar elegibilidades
      if (updates.publico_alvo === 'usuarios_especificos' && usuarios_elegiveis) {
        // Remover elegibilidades antigas
        await supabase
          .from("bonus_usuarios_elegiveis")
          .delete()
          .eq("bonus_id", id);

        // Inserir novas elegibilidades
        if (usuarios_elegiveis.length > 0) {
          const eligibilityRecords = usuarios_elegiveis.map(u => ({
            bonus_id: id,
            user_id: u.user_id,
            liberado: u.liberado,
            data_liberacao: u.liberado ? new Date().toISOString() : null
          }));

          const { error: eligError } = await supabase
            .from("bonus_usuarios_elegiveis")
            .insert(eligibilityRecords);

          if (eligError) throw eligError;
        }
      }

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
      // Elegibilidades serão deletadas automaticamente via CASCADE
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

  // Toggle liberação individual de um usuário
  const toggleUserEligibility = useMutation({
    mutationFn: async ({ bonusId, userId, liberado }: { bonusId: string; userId: string; liberado: boolean }) => {
      const { error } = await supabase
        .from("bonus_usuarios_elegiveis")
        .update({ 
          liberado, 
          data_liberacao: liberado ? new Date().toISOString() : null 
        })
        .eq("bonus_id", bonusId)
        .eq("user_id", userId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bonus-globais"] });
      queryClient.invalidateQueries({ queryKey: ["bonus-mentoria"] });
      toast({
        title: "Status atualizado!",
        description: "A liberação do usuário foi alterada"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao atualizar",
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
    toggleUserEligibility: toggleUserEligibility.mutate,
    isCreating: createBonus.isPending,
    isUpdating: updateBonus.isPending,
    isDeleting: deleteBonus.isPending,
    isTogglingEligibility: toggleUserEligibility.isPending
  };
};
