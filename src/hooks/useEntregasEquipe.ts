import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface EntregaEquipe {
  id: string;
  entrega_id: string | null;
  projeto_id: string | null;
  equipe_id: string;
  editado_por: string | null;
  titulo_equipe: string;
  descricao_equipe: string | null;
  status_equipe: string;
  prazo_equipe: string | null;
  responsavel_id: string | null;
  prioridade_equipe: string | null;
  notas: string | null;
  arquivos: { nome: string; url: string; tipo: string; uploaded_at: string }[];
  progresso: number;
  created_at: string;
  updated_at: string;
  entrega_original?: {
    titulo: string;
    descricao: string | null;
    status: string;
    prioridade: string | null;
  } | null;
  projeto?: { titulo: string } | null;
  responsavel?: { nome_completo: string; avatar_url: string | null } | null;
}

export function useEntregasEquipe(equipeId: string | null) {
  const queryClient = useQueryClient();
  const queryKey = ["entregas-equipe-skills", equipeId];

  const { data: entregas, isLoading, isError } = useQuery({
    queryKey,
    queryFn: async () => {
      if (!equipeId) return [];
      const { data, error } = await supabase
        .from("entregas_equipe_skills")
        .select(`
          *,
          entregas_skills:entrega_id (titulo, descricao, status, prioridade),
          backlog_skills:projeto_id (titulo),
          profiles:responsavel_id (nome_completo, avatar_url)
        `)
        .eq("equipe_id", equipeId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data || []).map((d: any) => ({
        ...d,
        arquivos: d.arquivos || [],
        entrega_original: d.entregas_skills || null,
        projeto: d.backlog_skills || null,
        responsavel: d.profiles || null,
      })) as EntregaEquipe[];
    },
    enabled: !!equipeId,
  });

  const upsertMutation = useMutation({
    mutationFn: async (values: Partial<EntregaEquipe> & { equipe_id: string; titulo_equipe: string }) => {
      const userId = (await supabase.auth.getUser()).data.user?.id;
      const payload = { ...values, editado_por: userId };
      // remove joined fields
      delete (payload as any).entrega_original;
      delete (payload as any).projeto;
      delete (payload as any).responsavel;
      delete (payload as any).entregas_skills;
      delete (payload as any).backlog_skills;
      delete (payload as any).profiles;

      if (payload.id) {
        const { error } = await supabase
          .from("entregas_equipe_skills")
          .update(payload as any)
          .eq("id", payload.id);
        if (error) throw error;
        return null;
      } else {
        delete (payload as any).id;
        const { data, error } = await supabase
          .from("entregas_equipe_skills")
          .insert(payload as any)
          .select(`
            *,
            entregas_skills:entrega_id (titulo, descricao, status, prioridade),
            backlog_skills:projeto_id (titulo),
            profiles:responsavel_id (nome_completo, avatar_url)
          `)
          .single();
        if (error) throw error;
        return {
          ...data,
          arquivos: (data.arquivos as any) || [],
          entrega_original: data.entregas_skills || null,
          projeto: data.backlog_skills || null,
          responsavel: data.profiles || null,
        } as unknown as EntregaEquipe;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast.success("Entrega salva com sucesso!");
    },
    onError: (err: any) => toast.error(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("entregas_equipe_skills").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast.success("Entrega removida.");
    },
    onError: (err: any) => toast.error(err.message),
  });

  const uploadFile = async (file: File, equipeId: string) => {
    const path = `${equipeId}/${Date.now()}_${file.name}`;
    const { error } = await supabase.storage.from("entregas-equipe-skills").upload(path, file);
    if (error) throw error;
    const { data: urlData } = supabase.storage.from("entregas-equipe-skills").getPublicUrl(path);
    return { nome: file.name, url: urlData.publicUrl, tipo: file.type, uploaded_at: new Date().toISOString() };
  };

  return { entregas: entregas || [], isLoading, isError, upsertMutation, deleteMutation, uploadFile };
}
