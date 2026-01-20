import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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

export interface ResultadoProcessamento {
  entregas_sugeridas: EntregaSugerida[];
  instrucoes_sugeridas: InstrucaoSugerida[];
  backlog_sugerido: {
    titulo: string;
    descricao: string;
    justificativa: string;
  }[];
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
