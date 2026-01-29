import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export interface MaterialSubmitData {
  titulo: string;
  descricao: string | null;
  tipo: string;
  categoria: string;
  conteudo_texto: string | null;
  arquivos_url: string[];
}

export function useMaterialComunidadeSubmit() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Buscar materiais do próprio usuário
  const { data: meusMateriais, isLoading: isLoadingMeusMateriais } = useQuery({
    queryKey: ["meus-materiais-comunidade", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from("materiais_comunidade")
        .select("*")
        .eq("criador_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  // Criar material (pendente de aprovação)
  const createMaterial = useMutation({
    mutationFn: async (material: MaterialSubmitData) => {
      if (!user?.id) throw new Error("Usuário não autenticado");

      const { error } = await supabase
        .from("materiais_comunidade")
        .insert({
          titulo: material.titulo,
          descricao: material.descricao,
          tipo: material.tipo,
          categoria: material.categoria,
          conteudo_texto: material.conteudo_texto,
          arquivos_url: material.arquivos_url,
          criador_id: user.id,
          adicionado_por: user.id,
          ativo: false, // Pendente de aprovação
          ordem: 0,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["materiais-comunidade"] });
      queryClient.invalidateQueries({ queryKey: ["meus-materiais-comunidade"] });
      toast.success("Material enviado para aprovação!");
    },
    onError: (error) => {
      console.error("Erro ao criar material:", error);
      toast.error("Erro ao enviar material. Tente novamente.");
    },
  });

  // Upload de arquivo para storage
  const uploadFile = async (file: File): Promise<string | null> => {
    if (!user?.id) return null;

    const fileExt = file.name.split(".").pop()?.toLowerCase();
    const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

    const { error } = await supabase.storage
      .from("materiais-comunidade")
      .upload(fileName, file);

    if (error) {
      console.error("Erro no upload:", error);
      toast.error(`Erro ao enviar arquivo: ${file.name}`);
      return null;
    }

    const { data: urlData } = supabase.storage
      .from("materiais-comunidade")
      .getPublicUrl(fileName);

    return urlData.publicUrl;
  };

  return {
    meusMateriais: meusMateriais || [],
    isLoadingMeusMateriais,
    createMaterial,
    uploadFile,
    isSubmitting: createMaterial.isPending,
  };
}
