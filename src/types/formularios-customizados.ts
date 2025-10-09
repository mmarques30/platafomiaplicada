export type TipoPergunta = 'texto_curto' | 'texto_longo' | 'multipla_escolha' | 'escala' | 'data';

export type Pergunta = {
  id: string;
  tipo: TipoPergunta;
  pergunta: string;
  obrigatoria: boolean;
  opcoes?: string[];
  escala_min?: number;
  escala_max?: number;
};

export type PerguntasGeradas = {
  perguntas: Pergunta[];
  categoria: string;
  tempo_estimado: string;
};

export type FormularioCustomizado = {
  id: string;
  created_by: string;
  titulo: string;
  descricao?: string;
  visibilidade: 'todos' | 'especificos';
  mentorados_ids: string[];
  data_criacao: string;
  data_expiracao?: string;
  texto_original: string;
  perguntas_geradas: PerguntasGeradas;
  status: 'ativo' | 'expirado' | 'arquivado';
  total_respostas: number;
  created_at: string;
  updated_at: string;
};

export type RespostaFormulario = {
  id: string;
  formulario_id: string;
  user_id: string;
  respostas: Record<string, {
    resposta: string | number | string[];
    respondido_em: string;
  }>;
  tempo_resposta?: number;
  completado: boolean;
  created_at: string;
  updated_at: string;
};

export type AnaliseFormulario = {
  resumo: string;
  padrao_geral: string;
  mentorados_atencao: Array<{
    nome: string;
    motivo: string;
  }>;
  insights: string[];
  recomendacoes: string[];
};
