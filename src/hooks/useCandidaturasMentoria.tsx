import { useMutation, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Hook para enviar candidatura (formulário público)
export function useEnviarCandidatura() {
  return useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const { error } = await supabase
        .from("candidaturas_mentoria")
        .insert(data as any);

      if (error) throw error;
    },
    onError: (error: any) => {
      console.error("Erro ao enviar candidatura:", error);
      toast.error("Erro ao enviar candidatura");
    },
  });
}

// Hook para gerenciar rascunho de candidatura
export function useCandidaturaDraft(email: string | undefined) {
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

  const saveDraft = async (data: Record<string, any>, step: number) => {
    if (!data.email) return;

    const draftData = {
      ...data,
      status: "rascunho",
    };

    // Check if draft exists
    const { data: existing } = await supabase
      .from("candidaturas_mentoria")
      .select("id")
      .eq("email", data.email)
      .eq("status", "rascunho")
      .maybeSingle();

    if (existing) {
      await supabase
        .from("candidaturas_mentoria")
        .update(draftData)
        .eq("id", existing.id);
    } else {
      await supabase
        .from("candidaturas_mentoria")
        .insert(draftData as any);
    }
  };

  const clearDraft = async (email: string) => {
    await supabase
      .from("candidaturas_mentoria")
      .delete()
      .eq("email", email)
      .eq("status", "rascunho");
  };

  return {
    draft,
    isLoading,
    saveDraft,
    clearDraft,
  };
}
