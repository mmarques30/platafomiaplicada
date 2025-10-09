import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "./useAuth";
import type { FormularioCustomizado, RespostaFormulario, PerguntasGeradas } from "@/types/formularios-customizados";

export const useFormulariosCustomizados = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: formularios, isLoading } = useQuery({
    queryKey: ["formularios-customizados"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("formularios_customizados")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as FormularioCustomizado[];
    },
    enabled: !!user,
  });

  return {
    formularios: formularios || [],
    isLoading,
  };
};

export const useFormulariosDisponiveis = () => {
  const { user } = useAuth();

  const { data: formularios, isLoading } = useQuery({
    queryKey: ["formularios-disponiveis", user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from("formularios_customizados")
        .select("*")
        .eq("status", "ativo")
        .or(`visibilidade.eq.todos,mentorados_ids.cs.["${user.id}"]`)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as FormularioCustomizado[];
    },
    enabled: !!user,
  });

  return {
    formularios: formularios || [],
    isLoading,
  };
};

export const useGerarPerguntas = () => {
  return useMutation({
    mutationFn: async (texto_original: string) => {
      const { data, error } = await supabase.functions.invoke("gerar-perguntas-formulario", {
        body: { texto_original },
      });

      if (error) throw error;
      return data.perguntas_geradas as PerguntasGeradas;
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao gerar perguntas",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

export const useCreateFormulario = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formulario: Omit<FormularioCustomizado, "id" | "created_at" | "updated_at" | "created_by" | "total_respostas" | "data_criacao">) => {
      if (!user) throw new Error("Usuário não autenticado");

      const { data, error } = await supabase
        .from("formularios_customizados")
        .insert([{
          ...formulario,
          created_by: user.id,
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["formularios-customizados"] });
      toast({
        title: "Formulário criado!",
        description: "O formulário foi publicado com sucesso",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao criar formulário",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

export const useUpdateFormulario = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<FormularioCustomizado> & { id: string }) => {
      const { data, error } = await supabase
        .from("formularios_customizados")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["formularios-customizados"] });
      toast({
        title: "Formulário atualizado!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao atualizar formulário",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

export const useRespostasFormulario = (formularioId: string) => {
  const { data: respostas, isLoading } = useQuery({
    queryKey: ["respostas-formulario", formularioId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("respostas_formularios_customizados")
        .select("*, profiles!inner(nome_completo)")
        .eq("formulario_id", formularioId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!formularioId,
  });

  return {
    respostas: respostas || [],
    isLoading,
  };
};

export const useResponderFormulario = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ formulario_id, respostas, tempo_resposta }: {
      formulario_id: string;
      respostas: Record<string, any>;
      tempo_resposta: number;
    }) => {
      if (!user) throw new Error("Usuário não autenticado");

      const { data, error } = await supabase
        .from("respostas_formularios_customizados")
        .upsert([{
          formulario_id,
          user_id: user.id,
          respostas,
          tempo_resposta,
          completado: true,
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["respostas-formulario"] });
      queryClient.invalidateQueries({ queryKey: ["formularios-disponiveis"] });
      toast({
        title: "Resposta enviada!",
        description: "Seu formulário foi enviado com sucesso",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao enviar resposta",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

export const useAnalisarRespostas = () => {
  return useMutation({
    mutationFn: async (formulario_id: string) => {
      const { data, error } = await supabase.functions.invoke("analisar-respostas-formulario", {
        body: { formulario_id },
      });

      if (error) throw error;
      return data.analise;
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao analisar respostas",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};
