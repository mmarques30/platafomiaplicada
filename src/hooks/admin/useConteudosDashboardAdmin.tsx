import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type TipoConteudo = 'newsletter' | 'noticia' | 'dica' | 'material' | 'criador';

export type CategoriaConteudo = 'ChatGPT' | 'Claude' | 'Midjourney' | 'Canva' | 'Notion' | 'Excel' | 'Outro';

export const CATEGORIAS_CRIADOR: CategoriaConteudo[] = [
  'ChatGPT',
  'Claude', 
  'Midjourney',
  'Canva',
  'Notion',
  'Excel',
  'Outro'
];

export interface EstiloTexto {
  fontSize: number;
  lineHeight: number;
  fontWeight: 'normal' | 'medium' | 'bold';
  textAlign: 'left' | 'center' | 'justify';
}

export interface ConteudoDashboardAdmin {
  id: string;
  tipo: TipoConteudo;
  titulo: string;
  resumo: string;
  conteudo: string | null;
  link_externo: string | null;
  imagem_url: string | null;
  arquivo_pdf_url: string | null;
  estilo_texto: EstiloTexto;
  galeria_imagens: string[];
  autor: string | null;
  tags: string[];
  destaque: boolean;
  ativo: boolean;
  ordem: number;
  visivel_gratuitos: boolean;
  categoria: CategoriaConteudo | null;
  criador_id: string | null;
  arquivos_url: string[];
  created_at: string;
  updated_at: string;
}

export interface ConteudoFormData {
  tipo: TipoConteudo;
  titulo: string;
  resumo: string;
  conteudo?: string;
  link_externo?: string;
  imagem_url?: string;
  arquivo_pdf_url?: string;
  estilo_texto?: EstiloTexto;
  galeria_imagens?: string[];
  autor?: string;
  tags?: string[];
  destaque?: boolean;
  ativo?: boolean;
  ordem?: number;
  visivel_gratuitos?: boolean;
  categoria?: CategoriaConteudo | null;
  criador_id?: string | null;
  arquivos_url?: string[];
}

export function useConteudosDashboardAdmin() {
  return useQuery({
    queryKey: ['conteudos-dashboard-admin'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('conteudos_dashboard')
        .select('*')
        .order('ordem', { ascending: true })
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      return data.map(item => ({
        ...item,
        estilo_texto: (item.estilo_texto as unknown as EstiloTexto) || {
          fontSize: 16,
          lineHeight: 1.5,
          fontWeight: 'normal',
          textAlign: 'left'
        },
        galeria_imagens: (item.galeria_imagens as unknown as string[]) || [],
        tags: (item.tags as unknown as string[]) || [],
        arquivos_url: (item.arquivos_url as unknown as string[]) || [],
      })) as ConteudoDashboardAdmin[];
    },
  });
}

export function useCreateConteudo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: ConteudoFormData) => {
      const { error } = await supabase
        .from('conteudos_dashboard')
        .insert({
          tipo: data.tipo,
          titulo: data.titulo,
          resumo: data.resumo,
          conteudo: data.conteudo || null,
          link_externo: data.link_externo || null,
          imagem_url: data.imagem_url || null,
          arquivo_pdf_url: data.arquivo_pdf_url || null,
          estilo_texto: data.estilo_texto || { fontSize: 16, lineHeight: 1.5, fontWeight: 'normal', textAlign: 'left' },
          galeria_imagens: data.galeria_imagens || [],
          autor: data.autor || null,
          tags: data.tags || [],
          destaque: data.destaque ?? false,
          ativo: data.ativo ?? true,
          ordem: data.ordem ?? 0,
          visivel_gratuitos: data.visivel_gratuitos ?? false,
          categoria: data.categoria || null,
          criador_id: data.criador_id || null,
          arquivos_url: data.arquivos_url || [],
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conteudos-dashboard-admin'] });
      queryClient.invalidateQueries({ queryKey: ['conteudos-dashboard'] });
      toast.success("Conteúdo criado com sucesso!");
    },
    onError: (error) => {
      console.error('Erro ao criar conteúdo:', error);
      toast.error("Erro ao criar conteúdo");
    },
  });
}

export function useUpdateConteudo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<ConteudoFormData> }) => {
      const updateData: Record<string, unknown> = {
        ...data,
        updated_at: new Date().toISOString(),
      };
      
      const { error } = await supabase
        .from('conteudos_dashboard')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conteudos-dashboard-admin'] });
      queryClient.invalidateQueries({ queryKey: ['conteudos-dashboard'] });
      toast.success("Conteúdo atualizado com sucesso!");
    },
    onError: (error) => {
      console.error('Erro ao atualizar conteúdo:', error);
      toast.error("Erro ao atualizar conteúdo");
    },
  });
}

export function useDeleteConteudo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('conteudos_dashboard')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conteudos-dashboard-admin'] });
      queryClient.invalidateQueries({ queryKey: ['conteudos-dashboard'] });
      toast.success("Conteúdo excluído com sucesso!");
    },
    onError: (error) => {
      console.error('Erro ao excluir conteúdo:', error);
      toast.error("Erro ao excluir conteúdo");
    },
  });
}

export async function uploadMidia(file: File, tipo: 'imagem' | 'pdf' | 'arquivo'): Promise<string> {
  const fileExt = file.name.split('.').pop();
  const fileName = `${tipo}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from('conteudos-dashboard')
    .upload(fileName, file);

  if (uploadError) throw uploadError;

  const { data } = supabase.storage
    .from('conteudos-dashboard')
    .getPublicUrl(fileName);

  return data.publicUrl;
}

export async function formatarTextoComIA(texto: string): Promise<string> {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    throw new Error("Usuário não autenticado");
  }

  const response = await supabase.functions.invoke('formatar-texto-conteudo', {
    body: { texto },
  });

  if (response.error) {
    throw new Error(response.error.message);
  }

  return response.data.textoFormatado;
}
