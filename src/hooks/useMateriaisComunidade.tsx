import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface MaterialComunidade {
  id: string;
  titulo: string;
  descricao: string | null;
  tipo: string;
  categoria: string;
  conteudo_texto: string | null;
  arquivos_url: string[] | null;
  criador_id: string | null;
  adicionado_por: string | null;
  ativo: boolean;
  ordem: number;
  total_avaliacoes: number;
  media_avaliacoes: number;
  total_comentarios: number;
  created_at: string;
  updated_at: string;
  criador?: {
    id: string;
    nome_completo: string;
    avatar_url: string | null;
  } | null;
}

interface UseMateriaisComunidadeOptions {
  tipo?: string;
  categoria?: string;
  includeInactive?: boolean;
}

export function useMateriaisComunidade(options: UseMateriaisComunidadeOptions = {}) {
  const { tipo, categoria, includeInactive = false } = options;

  const { data: materiais, isLoading } = useQuery({
    queryKey: ["materiais-comunidade", tipo, categoria, includeInactive],
    queryFn: async () => {
      let query = supabase
        .from("materiais_comunidade")
        .select(`
          *,
          criador:profiles!materiais_comunidade_criador_id_fkey (
            id,
            nome_completo,
            avatar_url
          )
        `)
        .order("ordem", { ascending: true })
        .order("created_at", { ascending: false });

      if (!includeInactive) {
        query = query.eq("ativo", true);
      }

      if (tipo && tipo !== "all") {
        query = query.eq("tipo", tipo);
      }

      if (categoria && categoria !== "all") {
        query = query.eq("categoria", categoria);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as unknown as MaterialComunidade[];
    },
  });

  return {
    materiais: materiais || [],
    isLoading,
  };
}

export function useMateriaisComunidadeAdmin() {
  const queryClient = useQueryClient();

  const { data: materiais, isLoading } = useQuery({
    queryKey: ["materiais-comunidade-admin"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("materiais_comunidade")
        .select(`
          *,
          criador:profiles!materiais_comunidade_criador_id_fkey (
            id,
            nome_completo,
            avatar_url
          )
        `)
        .order("ordem", { ascending: true })
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as unknown as MaterialComunidade[];
    },
  });

  const createMaterial = useMutation({
    mutationFn: async (material: Partial<MaterialComunidade>) => {
      const { data: userData } = await supabase.auth.getUser();
      const { error } = await supabase
        .from("materiais_comunidade")
        .insert({
          titulo: material.titulo!,
          tipo: material.tipo!,
          categoria: material.categoria!,
          descricao: material.descricao,
          conteudo_texto: material.conteudo_texto,
          arquivos_url: material.arquivos_url || [],
          criador_id: material.criador_id,
          ordem: material.ordem,
          ativo: material.ativo,
          adicionado_por: userData.user?.id,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["materiais-comunidade"] });
      queryClient.invalidateQueries({ queryKey: ["materiais-comunidade-admin"] });
      toast.success("Material criado com sucesso");
    },
    onError: () => {
      toast.error("Erro ao criar material");
    },
  });

  const updateMaterial = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<MaterialComunidade> & { id: string }) => {
      const { error } = await supabase
        .from("materiais_comunidade")
        .update(updates)
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["materiais-comunidade"] });
      queryClient.invalidateQueries({ queryKey: ["materiais-comunidade-admin"] });
      toast.success("Material atualizado com sucesso");
    },
    onError: () => {
      toast.error("Erro ao atualizar material");
    },
  });

  const deleteMaterial = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("materiais_comunidade")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["materiais-comunidade"] });
      queryClient.invalidateQueries({ queryKey: ["materiais-comunidade-admin"] });
      toast.success("Material excluido com sucesso");
    },
    onError: () => {
      toast.error("Erro ao excluir material");
    },
  });

  const toggleAtivo = useMutation({
    mutationFn: async ({ id, ativo }: { id: string; ativo: boolean }) => {
      const { error } = await supabase
        .from("materiais_comunidade")
        .update({ ativo })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["materiais-comunidade"] });
      queryClient.invalidateQueries({ queryKey: ["materiais-comunidade-admin"] });
    },
    onError: () => {
      toast.error("Erro ao alterar status");
    },
  });

  return {
    materiais: materiais || [],
    isLoading,
    createMaterial,
    updateMaterial,
    deleteMaterial,
    toggleAtivo,
  };
}
