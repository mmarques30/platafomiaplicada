import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface ContratoParseResult {
  contratante: {
    razao_social: string | null;
    cnpj: string | null;
    endereco: string | null;
    representante_nome: string | null;
    representante_cpf: string | null;
    representante_rg: string | null;
    representante_email: string | null;
  };
  contrato: {
    data_inicio: string | null;
    data_fim: string | null;
    data_assinatura: string | null;
    tempo_consultoria_meses: number | null;
    modulos_contratados: number | null;
    reunioes_mensais: number | null;
    reports_frequencia: string | null;
    suporte_tipo: string | null;
  };
  modulos_selecionados: string[];
  valores: {
    valor_contrato: number | null;
    valor_entrada: number | null;
    numero_parcelas: number | null;
    valor_parcela: number | null;
    creditos_iniciais: number | null;
    valor_credito_adicional: number | null;
    duracao_academy_meses: number | null;
    roi_projetado: number | null;
    multa_rescisao_percentual: number | null;
    valor_hora_tecnica: number | null;
  };
  entregas_esperadas: Array<{
    titulo: string;
    tipo: string;
    prazo: string;
    status: string;
  }>;
}

export const useParseContratoTexto = () => {
  const [isParsing, setIsParsing] = useState(false);

  const parseTexto = async (texto: string): Promise<ContratoParseResult | null> => {
    if (!texto.trim()) {
      toast({
        title: "Texto vazio",
        description: "Cole o texto do contrato para processar",
        variant: "destructive"
      });
      return null;
    }

    setIsParsing(true);
    try {
      const { data, error } = await supabase.functions.invoke('parse-contrato-texto', {
        body: { texto }
      });

      if (error) {
        throw new Error(error.message || 'Erro ao processar texto');
      }

      if (data.error) {
        throw new Error(data.error);
      }

      toast({
        title: "Dados extraídos com sucesso!",
        description: "Revise os campos preenchidos automaticamente"
      });

      return data.dados as ContratoParseResult;

    } catch (error) {
      console.error('Erro ao parsear contrato:', error);
      toast({
        title: "Erro ao processar",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive"
      });
      return null;
    } finally {
      setIsParsing(false);
    }
  };

  return { parseTexto, isParsing };
};
