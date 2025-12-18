import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useCallback, useRef } from "react";

export interface Candidatura {
  id: string;
  created_at: string;
  updated_at: string;
  nome_completo: string;
  email: string;
  whatsapp: string;
  linkedin_url?: string;
  cidade_estado?: string;
  empresa_atual?: string;
  cargo_atual?: string;
  cargo_outro?: string;
  tempo_cargo?: string;
  qtd_liderados?: number;
  porte_empresa?: string;
  nivel_ia?: number;
  ferramentas_ia?: string[];
  outras_ferramentas?: string;
  ja_implementou_ia?: boolean;
  descricao_implementacao?: string;
  faixa_renda?: string;
  autonomia_contratacao?: string;
  significado_sucesso_ia: string;
  tres_maiores_desafios: string;
  onde_quer_estar_2_anos?: string;
  por_que_nao_alcancou?: string;
  urgencia_dominar_ia?: number;
  horas_semana_aprendizado?: string;
  ja_investiu_mentoria?: boolean;
  quanto_investiu?: string;
  por_que_escolher_voce: string;
  como_contribuir_grupo?: string;
  impedimento_comecar_hoje?: string;
  tem_4k_10k_investir?: string;
  valor_disponivel?: string;
  maximo_investido_desenvolvimento?: string;
  outro_impedimento?: string;
  status: string;
  notas_admin?: string;
  data_contato?: string;
  admin_responsavel?: string;
  origem_pagina?: string;
  plano_origem?: string;
  is_visitante_origem?: boolean;
}

export const useCandidaturas = () => {
  return useQuery({
    queryKey: ["candidaturas"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("candidaturas_mentoria")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Candidatura[];
    },
  });
};

export const useEnviarCandidatura = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (candidatura: any) => {
      const { data, error } = await supabase
        .from("candidaturas_mentoria")
        .insert([candidatura])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["candidaturas"] });
      toast.success("Candidatura enviada com sucesso!");
    },
    onError: (error) => {
      toast.error("Erro ao enviar candidatura: " + error.message);
    },
  });
};

export const useAtualizarCandidatura = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<Candidatura>;
    }) => {
      const { data, error } = await supabase
        .from("candidaturas_mentoria")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["candidaturas"] });
      toast.success("Candidatura atualizada!");
    },
    onError: (error) => {
      toast.error("Erro ao atualizar: " + error.message);
    },
  });
};

// Hook para salvar rascunho de candidatura no banco
export const useCandidaturaDraft = (email: string | undefined) => {
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Buscar rascunho existente
  const { data: draft, isLoading } = useQuery({
    queryKey: ["candidatura-draft", email],
    queryFn: async () => {
      if (!email) return null;
      
      const { data, error } = await supabase
        .from("candidaturas_mentoria")
        .select("*")
        .eq("email", email)
        .eq("status", "rascunho")
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!email,
  });
  
  // Salvar/atualizar rascunho
  const saveDraft = useCallback(async (data: any, step: number) => {
    if (!data.email) return;
    
    // Limpar timeout anterior
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    // Debounce de 2 segundos
    return new Promise<boolean>((resolve) => {
      saveTimeoutRef.current = setTimeout(async () => {
        try {
          const draftData = {
            ...data,
            status: "rascunho",
          };
          
          // Remover campos undefined/null vazios
          Object.keys(draftData).forEach(key => {
            if (draftData[key] === undefined || draftData[key] === "") {
              delete draftData[key];
            }
          });
          
          // Verificar se já existe um rascunho para este email
          const { data: existing } = await supabase
            .from("candidaturas_mentoria")
            .select("id")
            .eq("email", data.email)
            .eq("status", "rascunho")
            .maybeSingle();
          
          if (existing) {
            // Atualizar rascunho existente
            await supabase
              .from("candidaturas_mentoria")
              .update(draftData)
              .eq("id", existing.id);
          } else {
            // Criar novo rascunho
            await supabase
              .from("candidaturas_mentoria")
              .insert([draftData]);
          }
          
          resolve(true);
        } catch (error) {
          console.error("Erro ao salvar rascunho:", error);
          resolve(false);
        }
      }, 2000);
    });
  }, []);
  
  // Limpar rascunho após envio bem-sucedido
  const clearDraft = useCallback(async (email: string) => {
    if (!email) return;
    
    await supabase
      .from("candidaturas_mentoria")
      .delete()
      .eq("email", email)
      .eq("status", "rascunho");
  }, []);
  
  return { draft, isLoading, saveDraft, clearDraft };
};
