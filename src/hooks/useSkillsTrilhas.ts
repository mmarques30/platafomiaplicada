import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface ConteudoLiberado {
  id: string;
  equipe_id: string;
  trilha_id: string | null;
  modulo_id: string | null;
  motivo: string | null;
  fase_roadmap_id: string | null;
  ordem: number;
  created_at: string;
  trilha?: {
    id: string;
    titulo: string;
    descricao: string | null;
    imagem_url: string | null;
    ativo: boolean;
  };
  modulo?: {
    id: string;
    titulo: string;
    descricao: string | null;
    imagem_url: string | null;
    trilha_id: string;
    trilha?: {
      titulo: string;
    };
  };
  fase_roadmap?: {
    id: string;
    titulo: string;
    semana_inicio: number;
    semana_fim: number;
  };
}

export function useSkillsTrilhas() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["skills-trilhas", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      // Primeiro, buscar a equipe do usuário
      const { data: membro, error: membroError } = await supabase
        .from("membros_equipe_skills")
        .select("equipe_id")
        .eq("user_id", user.id)
        .eq("status", "ativo")
        .maybeSingle();

      if (membroError) throw membroError;
      if (!membro) return [];

      // Buscar conteúdos liberados para a equipe
      const { data, error } = await supabase
        .from("conteudos_liberados_skills")
        .select(`
          id,
          equipe_id,
          trilha_id,
          modulo_id,
          motivo,
          fase_roadmap_id,
          ordem,
          created_at
        `)
        .eq("equipe_id", membro.equipe_id)
        .order("ordem", { ascending: true });

      if (error) throw error;

      // Buscar detalhes das trilhas e módulos
      const trilhaIds = data.filter(c => c.trilha_id).map(c => c.trilha_id);
      const moduloIds = data.filter(c => c.modulo_id).map(c => c.modulo_id);
      const faseIds = data.filter(c => c.fase_roadmap_id).map(c => c.fase_roadmap_id);

      const [trilhasRes, modulosRes, fasesRes] = await Promise.all([
        trilhaIds.length > 0
          ? supabase.from("trilhas").select("id, titulo, descricao, imagem_url, ativo").in("id", trilhaIds)
          : { data: [] },
        moduloIds.length > 0
          ? supabase.from("modulos").select("id, titulo, descricao, imagem_url, trilha_id, trilhas(titulo)").in("id", moduloIds)
          : { data: [] },
        faseIds.length > 0
          ? supabase.from("roadmap_skills").select("id, titulo, semana_inicio, semana_fim").in("id", faseIds)
          : { data: [] },
      ]);

      const trilhasMap = new Map((trilhasRes.data || []).map(t => [t.id, t]));
      const modulosMap = new Map((modulosRes.data || []).map(m => [m.id, m]));
      const fasesMap = new Map((fasesRes.data || []).map(f => [f.id, f]));

      return data.map(conteudo => ({
        ...conteudo,
        trilha: conteudo.trilha_id ? trilhasMap.get(conteudo.trilha_id) : undefined,
        modulo: conteudo.modulo_id ? modulosMap.get(conteudo.modulo_id) : undefined,
        fase_roadmap: conteudo.fase_roadmap_id ? fasesMap.get(conteudo.fase_roadmap_id) : undefined,
      })) as ConteudoLiberado[];
    },
    enabled: !!user?.id,
  });
}
