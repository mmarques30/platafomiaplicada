import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";

export type DuvidaMentoria = {
  id: string;
  user_id: string;
  titulo: string;
  duvida: string;
  contexto?: string;
  status: "pendente" | "em_analise" | "respondida" | "fechada";
  prioridade: "baixa" | "normal" | "alta" | "urgente";
  resposta_mentor?: string;
  respondida_em?: string;
  respondida_por?: string;
  prazo_sla: string;
  atrasada: boolean;
  horas_para_vencer?: number;
  tags?: string[];
  publicar_qa: boolean;
  categoria_qa_id?: string;
  video_qa_url?: string;
  publicado_qa_em?: string;
  created_at: string;
  updated_at: string;
};

export function useDuvidasMentoria(userId?: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const targetUserId = userId || user?.id;

  const { data: duvidas = [], isLoading } = useQuery({
    queryKey: ["duvidas-mentoria", targetUserId],
    queryFn: async () => {
      if (!targetUserId) return [];

      const { data, error } = await supabase
        .from("duvidas_mentoria")
        .select("*")
        .eq("user_id", targetUserId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as DuvidaMentoria[];
    },
    enabled: !!targetUserId,
  });

  const criarDuvida = useMutation({
    mutationFn: async (dados: Partial<DuvidaMentoria>) => {
      if (!user) throw new Error("Usuário não autenticado");

      const { data, error } = await supabase
        .from("duvidas_mentoria")
        .insert([{ ...dados, user_id: targetUserId }] as any)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["duvidas-mentoria"] });
      toast({ title: "Dúvida enviada com sucesso!" });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao enviar dúvida",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const responderDuvida = useMutation({
    mutationFn: async ({ 
      id, 
      resposta,
      publicar_qa,
      categoria_qa_id,
      video_qa_url
    }: { 
      id: string; 
      resposta: string;
      publicar_qa?: boolean;
      categoria_qa_id?: string;
      video_qa_url?: string;
    }) => {
      if (!user) throw new Error("Usuário não autenticado");

      const updateData: any = {
        resposta_mentor: resposta,
        status: "respondida",
        respondida_em: new Date().toISOString(),
        respondida_por: user.id,
      };

      if (publicar_qa !== undefined) {
        updateData.publicar_qa = publicar_qa;
        updateData.publicado_qa_em = publicar_qa ? new Date().toISOString() : null;
      }
      
      if (categoria_qa_id) updateData.categoria_qa_id = categoria_qa_id;
      if (video_qa_url !== undefined) updateData.video_qa_url = video_qa_url;

      const { error } = await supabase
        .from("duvidas_mentoria")
        .update(updateData)
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["duvidas-mentoria"] });
      toast({ title: "Resposta enviada com sucesso!" });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao responder dúvida",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const atualizarStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from("duvidas_mentoria")
        .update({ status })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["duvidas-mentoria"] });
      toast({ title: "Status atualizado!" });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao atualizar status",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    duvidas,
    isLoading,
    criarDuvida: criarDuvida.mutate,
    responderDuvida: responderDuvida.mutate,
    atualizarStatus: atualizarStatus.mutate,
    isCriando: criarDuvida.isPending,
    isRespondendo: responderDuvida.isPending,
  };
}
