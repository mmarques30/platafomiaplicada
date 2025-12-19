import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "./useAuth";

export type SessaoMentoria = {
  id: string;
  user_id: string;
  titulo: string;
  data_sessao: string;
  duracao?: number;
  transcricao?: string;
  transcricao_url?: string;
  video_url?: string;
  notas?: string;
  feedback_entregas?: string;
  status: "agendada" | "realizada" | "cancelada";
  created_at: string;
  updated_at: string;
};

export const useMentoriaSessoes = (userId?: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const targetUserId = userId || user?.id;

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

  const getAccessTokenOrThrow = async () => {
    let { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      const refreshed = await supabase.auth.refreshSession();
      session = refreshed.data.session ?? null;
    }

    if (!session?.access_token) {
      throw new Error("Sessão expirada. Faça login novamente.");
    }

    return session.access_token;
  };

  const authedFetchJson = async <T,>(path: string, init: RequestInit) => {
    const token = await getAccessTokenOrThrow();

    const res = await fetch(`${supabaseUrl}${path}`, {
      ...init,
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${token}`,
        ...(init.headers || {}),
      },
    });

    const json = await res.json().catch(() => null);

    if (!res.ok) {
      const message = json?.message || json?.error_description || json?.error || `Erro (${res.status})`;
      throw new Error(message);
    }

    return json as T;
  };

  const { data: sessoes, isLoading } = useQuery({
    queryKey: ["sessoes-mentoria", targetUserId],
    queryFn: async () => {
      if (!targetUserId) return [];
      
      const { data, error } = await supabase
        .from("sessoes_mentoria")
        .select("*")
        .eq("user_id", targetUserId)
        .order("data_sessao", { ascending: false });

      if (error) throw error;
      return data as SessaoMentoria[];
    },
    enabled: !!targetUserId,
  });

  const createSessao = useMutation({
    mutationFn: async (sessao: Partial<SessaoMentoria>) => {
      const payload = {
        ...sessao,
        user_id: sessao.user_id ?? targetUserId,
      };

      if (!payload.user_id) {
        throw new Error("Selecione um mentorado para criar a sessão");
      }

      const data = await authedFetchJson<SessaoMentoria>(
        "/rest/v1/sessoes_mentoria?select=*",
        {
          method: "POST",
          headers: {
            Accept: "application/vnd.pgrst.object+json",
            "Content-Type": "application/json",
            Prefer: "return=representation",
          },
          body: JSON.stringify([payload]),
        }
      );

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sessoes-mentoria"] });
      toast({
        title: "Sessão criada com sucesso!",
        description: "A sessão foi adicionada ao seu histórico"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao criar sessão",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const updateSessao = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<SessaoMentoria> & { id: string }) => {
      const data = await authedFetchJson<SessaoMentoria>(
        `/rest/v1/sessoes_mentoria?id=eq.${id}&select=*`,
        {
          method: "PATCH",
          headers: {
            Accept: "application/vnd.pgrst.object+json",
            "Content-Type": "application/json",
            Prefer: "return=representation",
          },
          body: JSON.stringify(updates),
        }
      );

      if (!data) throw new Error("Sessão não encontrada");
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sessoes-mentoria"] });
      toast({
        title: "Sessão atualizada!",
        description: "As informações foram salvas com sucesso"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao atualizar sessão",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  return {
    sessoes: sessoes || [],
    isLoading,
    createSessao: createSessao.mutate,
    updateSessao: updateSessao.mutate,
    isCreating: createSessao.isPending,
    isUpdating: updateSessao.isPending
  };
};
