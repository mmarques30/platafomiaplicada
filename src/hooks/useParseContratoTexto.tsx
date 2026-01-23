import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Interface atualizada - SEM entregas_esperadas (etapas são padrão, não extraídas do contrato)
export interface ContratoParseResult {
  contratante?: {
    razao_social?: string;
    cnpj?: string;
    endereco?: string;
    representante_nome?: string;
    representante_cpf?: string;
    representante_rg?: string;
    representante_email?: string;
  };
  contrato?: {
    modulos_contratados?: number;
    tempo_consultoria_meses?: number;
    reunioes_mensais?: number;
    reports_frequencia?: string;
    suporte_tipo?: string;
    data_inicio?: string;
    data_fim?: string;
    data_assinatura?: string;
  };
  modulos_selecionados?: string[];
  valores?: {
    valor_contrato?: number;
    valor_entrada?: number;
    numero_parcelas?: number;
    valor_parcela?: number;
    creditos_iniciais?: number;
    valor_credito_adicional?: number;
    duracao_academy_meses?: number;
    roi_projetado?: number;
    multa_rescisao_percentual?: number;
    valor_hora_tecnica?: number;
  };
  observacoes?: string;
}

export const useParseContratoTexto = () => {
  const [isParsing, setIsParsing] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);

  const parseTexto = async (texto: string): Promise<ContratoParseResult | null> => {
    if (!texto || texto.length < 50) {
      toast.error('Texto muito curto para processamento');
      return null;
    }

    setIsParsing(true);
    try {
      const { data, error } = await supabase.functions.invoke('parse-contrato-texto', {
        body: { texto }
      });

      if (error) throw error;

      if (data.error) {
        toast.error(data.error);
        return null;
      }

      toast.success('Contrato processado com sucesso!');
      // Edge function returns { success: true, dados: {...} }
      return (data.dados || data) as ContratoParseResult;
    } catch (error: unknown) {
      console.error('Erro ao processar contrato:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro ao processar contrato';
      toast.error(errorMessage);
      return null;
    } finally {
      setIsParsing(false);
    }
  };

  const extractTextFromFile = async (file: File): Promise<string | null> => {
    setIsExtracting(true);
    try {
      // Read file as base64
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          // Remove data URL prefix
          const base64Data = result.split(',')[1];
          resolve(base64Data);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const { data, error } = await supabase.functions.invoke('parse-documento-contrato', {
        body: {
          fileBase64: base64,
          fileName: file.name,
          fileType: file.type
        }
      });

      if (error) throw error;

      if (data.error) {
        toast.error(data.error);
        return null;
      }

      toast.success('Texto extraído do documento!');
      return data.texto;
    } catch (error: unknown) {
      console.error('Erro ao extrair texto:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro ao extrair texto do documento';
      toast.error(errorMessage);
      return null;
    } finally {
      setIsExtracting(false);
    }
  };

  return { parseTexto, extractTextFromFile, isParsing, isExtracting };
};
