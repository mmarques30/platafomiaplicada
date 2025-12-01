-- Criar tabela de candidaturas à mentoria
CREATE TABLE candidaturas_mentoria (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- INFORMAÇÕES BÁSICAS
  nome_completo TEXT NOT NULL,
  email TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  linkedin_url TEXT,
  cidade_estado TEXT,
  
  -- SITUAÇÃO PROFISSIONAL
  empresa_atual TEXT,
  cargo_atual TEXT,
  cargo_outro TEXT,
  tempo_cargo TEXT,
  qtd_liderados INTEGER,
  porte_empresa TEXT,
  
  -- CONHECIMENTO EM IA
  nivel_ia INTEGER CHECK (nivel_ia >= 0 AND nivel_ia <= 10),
  ferramentas_ia TEXT[],
  outras_ferramentas TEXT,
  ja_implementou_ia BOOLEAN,
  descricao_implementacao TEXT,
  
  -- SITUAÇÃO FINANCEIRA
  faixa_renda TEXT,
  autonomia_contratacao TEXT,
  
  -- MOTIVAÇÕES E OBJETIVOS
  significado_sucesso_ia TEXT NOT NULL,
  tres_maiores_desafios TEXT NOT NULL,
  onde_quer_estar_2_anos TEXT,
  por_que_nao_alcancou TEXT,
  
  -- URGÊNCIA E COMPROMETIMENTO
  urgencia_dominar_ia INTEGER CHECK (urgencia_dominar_ia >= 0 AND urgencia_dominar_ia <= 10),
  horas_semana_aprendizado TEXT,
  ja_investiu_mentoria BOOLEAN,
  quanto_investiu TEXT,
  
  -- PERGUNTAS DE INVERSÃO
  por_que_escolher_voce TEXT NOT NULL,
  como_contribuir_grupo TEXT,
  impedimento_comecar_hoje TEXT,
  
  -- QUALIFICAÇÃO FINANCEIRA (R$4k a R$10k)
  tem_4k_10k_investir TEXT,
  valor_disponivel TEXT,
  maximo_investido_desenvolvimento TEXT,
  outro_impedimento TEXT,
  
  -- STATUS E CONTROLE
  status TEXT DEFAULT 'nova',
  notas_admin TEXT,
  data_contato TIMESTAMPTZ,
  admin_responsavel UUID REFERENCES profiles(id)
);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_candidaturas_mentoria_updated_at
  BEFORE UPDATE ON candidaturas_mentoria
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies
ALTER TABLE candidaturas_mentoria ENABLE ROW LEVEL SECURITY;

-- Política para INSERT público (formulário aberto)
CREATE POLICY "Qualquer pessoa pode enviar candidatura"
ON candidaturas_mentoria FOR INSERT
WITH CHECK (true);

-- Política para SELECT/UPDATE apenas admins
CREATE POLICY "Admins podem visualizar candidaturas"
ON candidaturas_mentoria FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins podem atualizar candidaturas"
ON candidaturas_mentoria FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));