import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Nova estrutura hierárquica
export interface EtapaSugerida {
  numero: number;
  titulo: string;
  objetivo?: string;
}

export interface EntregaSugeridaV2 {
  etapa_numero: number;
  numero_entrega: number;
  titulo: string;
  descricao: string;
  tipo: 'ativa' | 'backlog';
  prioridade: 'baixa' | 'media' | 'alta' | 'urgente';
  modulo_relacionado?: string;
  responsavel?: 'voce' | 'mentor' | 'conjunto';
  status?: 'pendente' | 'concluida';
}

export interface InstrucaoSugeridaV2 {
  entrega_numero: number;
  titulo: string;
  descricao?: string;
  responsavel: 'voce' | 'mentor' | 'conjunto';
  ferramenta?: string;
  dicas?: string;
  ordem: number;
}

export interface TaskSugerida {
  entrega_numero: number;
  titulo: string;
  tipo: 'validacao' | 'aprovacao' | 'revisao' | 'homologacao' | 'assinatura' | 'feedback';
  prioridade: 'baixa' | 'media' | 'alta' | 'urgente';
  instrucoes_validacao?: string;
}

export interface BacklogItem {
  titulo: string;
  descricao: string;
  justificativa: string;
}

// Interface principal do resultado
export interface ResultadoProcessamentoV2 {
  etapas: EtapaSugerida[];
  entregas: EntregaSugeridaV2[];
  instrucoes: InstrucaoSugeridaV2[];
  tasks: TaskSugerida[];
  backlog: BacklogItem[];
}

// Manter compatibilidade com formato antigo
export interface EntregaSugerida {
  titulo: string;
  descricao: string;
  modulo_relacionado?: string;
  tipo: 'ativa' | 'backlog';
  prioridade: 'baixa' | 'media' | 'alta';
  tarefas: {
    titulo: string;
    descricao?: string;
    prioridade: 'baixa' | 'media' | 'alta';
  }[];
}

export interface InstrucaoSugerida {
  entrega_titulo: string;
  instrucoes: {
    titulo: string;
    descricao?: string;
    responsavel: 'voce' | 'mentor' | 'conjunto';
    ferramenta?: string;
    prompt_sugerido?: string;
    tarefas: {
      titulo: string;
      prioridade: 'baixa' | 'media' | 'alta';
    }[];
  }[];
}

export interface ResultadoProcessamento extends ResultadoProcessamentoV2 {
  // Campos antigos para compatibilidade
  entregas_sugeridas: EntregaSugerida[];
  instrucoes_sugeridas: InstrucaoSugerida[];
  backlog_sugerido: BacklogItem[];
}

export function useProcessarDocumentos() {
  const [isProcessing, setIsProcessing] = useState(false);

  const processarDocumento = async (
    texto: string,
    modulosContratados: string[],
    contextoCliente?: string
  ): Promise<ResultadoProcessamento | null> => {
    setIsProcessing(true);

    try {
      const { data, error } = await supabase.functions.invoke("processar-documentos-business", {
        body: {
          texto,
          modulos_contratados: modulosContratados,
          contexto_cliente: contextoCliente,
        },
      });

      if (error) throw error;

      toast.success("Documento processado com sucesso!");
      return data as ResultadoProcessamento;
    } catch (error) {
      console.error("Erro ao processar documento:", error);
      toast.error("Erro ao processar documento com IA");
      return null;
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    processarDocumento,
    isProcessing,
  };
}
