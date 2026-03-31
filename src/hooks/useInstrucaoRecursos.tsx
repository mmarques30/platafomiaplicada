import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface RecursoItem {
  id: string;
  tipo: 'link' | 'video' | 'pdf' | 'imagem' | 'documento';
  url: string;
  titulo: string;
  descricao?: string;
}

export interface PassoInstrucao {
  numero: number;
  titulo: string;
  descricao?: string;
  recursos: RecursoItem[];
}

export interface RecursosInstrucao {
  passos: PassoInstrucao[];
  texto_orientativo?: string;
  instrucao_personalizada?: string;
}

export function useUploadRecurso() {
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const uploadRecurso = async (file: File, etapaId: string, passoNumero: number): Promise<string | null> => {
    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${etapaId}/${passoNumero}/${crypto.randomUUID()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('instrucoes-recursos')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('instrucoes-recursos')
        .getPublicUrl(fileName);

      return publicUrl;
    } catch (error: any) {
      toast({
        title: 'Erro no upload',
        description: error.message,
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const deleteRecurso = async (url: string): Promise<boolean> => {
    try {
      // Extrair o path do arquivo da URL
      const urlParts = url.split('/instrucoes-recursos/');
      if (urlParts.length < 2) return true;
      
      const filePath = urlParts[1];
      const { error } = await supabase.storage
        .from('instrucoes-recursos')
        .remove([filePath]);

      if (error) throw error;
      return true;
    } catch (error: any) {
      console.error('Erro ao deletar recurso:', error);
      return false;
    }
  };

  return { uploadRecurso, deleteRecurso, isUploading };
}

export function usePersonalizarInstrucaoIA() {
  const [isPersonalizing, setIsPersonalizing] = useState(false);
  const { toast } = useToast();

  const personalizarInstrucao = async (
    textoOrientativo: string,
    passos: PassoInstrucao[],
    contexto?: {
      etapaTitulo?: string;
      contratoNomeEmpresa?: string;
      instrucaoTitulo?: string;
    }
  ): Promise<string | null> => {
    setIsPersonalizing(true);
    try {
      const { data, error } = await supabase.functions.invoke('personalizar-instrucao', {
        body: {
          texto_orientativo: textoOrientativo,
          passos,
          contexto,
        },
      });

      if (error) throw error;
      return data?.descricao_personalizada || null;
    } catch (error: any) {
      toast({
        title: 'Erro ao personalizar',
        description: error.message,
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsPersonalizing(false);
    }
  };

  return { personalizarInstrucao, isPersonalizing };
}

export function getTipoRecurso(url: string, mimeType?: string): RecursoItem['tipo'] {
  const lowerUrl = url.toLowerCase();
  
  // Verificar por extensão
  if (lowerUrl.endsWith('.pdf')) return 'pdf';
  if (lowerUrl.match(/\.(jpg|jpeg|png|gif|webp|svg)$/)) return 'imagem';
  if (lowerUrl.match(/\.(doc|docx|xls|xlsx|ppt|pptx|txt|csv)$/)) return 'documento';
  
  // Verificar por domínios de vídeo
  if (lowerUrl.includes('youtube.com') || lowerUrl.includes('youtu.be') || 
      lowerUrl.includes('vimeo.com') || lowerUrl.includes('loom.com')) {
    return 'video';
  }
  
  // Verificar por MIME type
  if (mimeType) {
    if (mimeType.startsWith('image/')) return 'imagem';
    if (mimeType === 'application/pdf') return 'pdf';
    if (mimeType.startsWith('video/')) return 'video';
  }
  
  return 'link';
}

export function getRecursoIcon(tipo: RecursoItem['tipo']): string {
  switch (tipo) {
    case 'pdf': return 'PDF';
    case 'imagem': return 'IMG';
    case 'video': return 'VID';
    case 'documento': return 'DOC';
    case 'link': return 'LINK';
    default: return 'FILE';
  }
}
