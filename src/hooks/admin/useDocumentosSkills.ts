import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface DocumentoSkills {
  id: string;
  equipe_id: string;
  contrato_id: string | null;
  titulo: string;
  tipo: string;
  arquivo_url: string | null;
  conteudo_texto: string | null;
  para_processamento_ia: boolean;
  processado: boolean;
  resultado_ia: any;
  created_at: string;
}

export function useDocumentosSkills(equipeId?: string | null) {
  const queryClient = useQueryClient();
  const qk = ["documentos-skills", equipeId];

  const { data: documentos = [], isLoading } = useQuery({
    queryKey: qk,
    queryFn: async () => {
      if (!equipeId) return [];
      const { data, error } = await supabase
        .from("documentos_skills")
        .select("*")
        .eq("equipe_id", equipeId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as DocumentoSkills[];
    },
    enabled: !!equipeId,
  });

  const createDocumento = useMutation({
    mutationFn: async (input: Partial<DocumentoSkills> & { equipe_id: string; titulo: string }) => {
      const { data, error } = await supabase.from("documentos_skills").insert(input as any).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: qk }); toast.success("Documento adicionado"); },
    onError: () => toast.error("Erro ao adicionar documento"),
  });

  const deleteDocumento = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("documentos_skills").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: qk }); toast.success("Documento removido"); },
    onError: () => toast.error("Erro ao remover documento"),
  });

  const uploadDocumento = async (file: File, equipeId: string) => {
    const fileName = `${equipeId}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const { error } = await supabase.storage.from("documentos-skills").upload(fileName, file);
    if (error) throw error;
    return fileName;
  };

  return { documentos, isLoading, createDocumento, deleteDocumento, uploadDocumento };
}
