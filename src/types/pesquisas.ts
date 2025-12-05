export interface Pergunta {
  id: string;
  texto: string;
  tipo: 'texto_curto' | 'texto_longo' | 'multipla_escolha' | 'multipla_escolha_outro';
  opcoes?: string[];
  obrigatorio: boolean;
  placeholder?: string;
  condicional?: {
    campo: string;
    valor: string;
  };
}

export interface Secao {
  secao: number;
  titulo: string;
  objetivo: string;
  perguntas: Pergunta[];
}

export interface Pesquisa {
  id: string;
  slug: string;
  titulo: string;
  descricao: string | null;
  recompensas: string | null;
  perguntas: Secao[];
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export interface RespostaPesquisa {
  id: string;
  pesquisa_id: string;
  user_id: string;
  respostas: Record<string, string>;
  tempo_resposta: number | null;
  completado: boolean;
  secao_atual: number;
  created_at: string;
  updated_at: string;
}
