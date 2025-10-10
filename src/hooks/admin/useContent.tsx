import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { extractYouTubeId, getYouTubeThumbnail } from "@/lib/youtube";

// Trilhas
export function useTrilhas() {
  return useQuery({
    queryKey: ["admin-trilhas"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("trilhas")
        .select("*")
        .order("ordem");
      if (error) throw error;
      return data;
    },
  });
}

export function useCreateTrilha() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (trilha: any) => {
      const { error } = await supabase.from("trilhas").insert(trilha);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-trilhas"] });
      toast.success("Trilha criada com sucesso!");
    },
    onError: (error: any) => toast.error("Erro: " + error.message),
  });
}

export function useUpdateTrilha() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...trilha }: any) => {
      const { error } = await supabase.from("trilhas").update(trilha).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-trilhas"] });
      toast.success("Trilha atualizada!");
    },
    onError: (error: any) => toast.error("Erro: " + error.message),
  });
}

export function useDeleteTrilha() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("trilhas").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-trilhas"] });
      toast.success("Trilha deletada!");
    },
    onError: (error: any) => toast.error("Erro: " + error.message),
  });
}

// Cursos
export function useCursos() {
  return useQuery({
    queryKey: ["admin-cursos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cursos")
        .select("*, trilhas(titulo)")
        .order("ordem");
      if (error) throw error;
      return data;
    },
  });
}

export function useCreateCurso() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (curso: any) => {
      const { error } = await supabase.from("cursos").insert(curso);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-cursos"] });
      toast.success("Curso criado!");
    },
    onError: (error: any) => toast.error("Erro: " + error.message),
  });
}

export function useUpdateCurso() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...curso }: any) => {
      const { error } = await supabase.from("cursos").update(curso).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-cursos"] });
      toast.success("Curso atualizado!");
    },
    onError: (error: any) => toast.error("Erro: " + error.message),
  });
}

export function useDeleteCurso() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("cursos").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-cursos"] });
      toast.success("Curso deletado!");
    },
    onError: (error: any) => toast.error("Erro: " + error.message),
  });
}

// Módulos
export function useModulos() {
  return useQuery({
    queryKey: ["admin-modulos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("modulos")
        .select(`
          *,
          trilha:trilhas!inner(
            id,
            titulo
          )
        `)
        .order("ordem");
      if (error) throw error;
      return data;
    },
  });
}

export function useCreateModulo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (modulo: any) => {
      const { error } = await supabase.from("modulos").insert(modulo);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-modulos"] });
      queryClient.invalidateQueries({ queryKey: ["trilhas-stats"] });
      queryClient.invalidateQueries({ queryKey: ["modulos-stats"] });
      toast.success("Módulo criado!");
    },
    onError: (error: any) => toast.error("Erro: " + error.message),
  });
}

export function useUpdateModulo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...modulo }: any) => {
      const { error } = await supabase.from("modulos").update(modulo).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-modulos"] });
      queryClient.invalidateQueries({ queryKey: ["trilhas-stats"] });
      queryClient.invalidateQueries({ queryKey: ["modulos-stats"] });
      toast.success("Módulo atualizado!");
    },
    onError: (error: any) => toast.error("Erro: " + error.message),
  });
}

export function useDeleteModulo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("modulos").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-modulos"] });
      queryClient.invalidateQueries({ queryKey: ["trilhas-stats"] });
      queryClient.invalidateQueries({ queryKey: ["modulos-stats"] });
      toast.success("Módulo deletado!");
    },
    onError: (error: any) => toast.error("Erro: " + error.message),
  });
}

// Vídeos
export function useVideos() {
  return useQuery({
    queryKey: ["admin-videos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("videos")
        .select(`
          *,
          modulo:modulos!inner(
            id,
            titulo,
            trilha:trilhas!inner(
              id,
              titulo
            )
          )
        `)
        .order("ordem");
      if (error) throw error;
      return data;
    },
  });
}

export function useCreateVideo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (video: any) => {
      const youtubeId = extractYouTubeId(video.youtube_url);
      if (!youtubeId) throw new Error("URL do YouTube inválida");

      const videoData = {
        ...video,
        youtube_id: youtubeId,
        thumbnail_url: getYouTubeThumbnail(youtubeId),
      };

      const { error } = await supabase.from("videos").insert(videoData);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-videos"] });
      queryClient.invalidateQueries({ queryKey: ["trilhas-stats"] });
      queryClient.invalidateQueries({ queryKey: ["modulos-stats"] });
      toast.success("Vídeo criado!");
    },
    onError: (error: any) => toast.error("Erro: " + error.message),
  });
}

export function useUpdateVideo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...video }: any) => {
      const videoData = { ...video };
      
      if (video.youtube_url) {
        const youtubeId = extractYouTubeId(video.youtube_url);
        if (!youtubeId) throw new Error("URL do YouTube inválida");
        videoData.youtube_id = youtubeId;
        videoData.thumbnail_url = getYouTubeThumbnail(youtubeId);
      }

      // Remove campo 'modulo' que vem do JOIN - não existe na tabela
      delete videoData.modulo;

      const { error } = await supabase.from("videos").update(videoData).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-videos"] });
      queryClient.invalidateQueries({ queryKey: ["trilhas-stats"] });
      queryClient.invalidateQueries({ queryKey: ["modulos-stats"] });
      toast.success("Vídeo atualizado!");
    },
    onError: (error: any) => toast.error("Erro: " + error.message),
  });
}

export function useDeleteVideo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("videos").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-videos"] });
      queryClient.invalidateQueries({ queryKey: ["trilhas-stats"] });
      queryClient.invalidateQueries({ queryKey: ["modulos-stats"] });
      toast.success("Vídeo deletado!");
    },
    onError: (error: any) => toast.error("Erro: " + error.message),
  });
}

// Estatísticas de trilhas
export function useTrilhasStats() {
  return useQuery({
    queryKey: ["trilhas-stats"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_trilhas_stats");
      if (error) throw error;
      return data;
    },
  });
}

// Estatísticas de módulos
export function useModulosStats() {
  return useQuery({
    queryKey: ["modulos-stats"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_modulos_stats");
      if (error) throw error;
      return data;
    },
  });
}
