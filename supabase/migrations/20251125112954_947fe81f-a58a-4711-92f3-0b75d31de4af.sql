-- Add consultoria-specific fields to produtos table
ALTER TABLE produtos 
ADD COLUMN IF NOT EXISTS valor_minimo numeric,
ADD COLUMN IF NOT EXISTS valor_maximo numeric,
ADD COLUMN IF NOT EXISTS produtos_inclusos jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS licencas_minimas integer,
ADD COLUMN IF NOT EXISTS is_consultoria boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS fases jsonb DEFAULT '[]'::jsonb;

-- Insert IAplicada Consult product
INSERT INTO produtos (
  slug,
  nome,
  tipo,
  formato,
  valor,
  valor_minimo,
  valor_maximo,
  valor_com_desconto,
  periodicidade,
  duracao,
  is_consultoria,
  licencas_minimas,
  ordem,
  ativo,
  descricao_curta,
  descricao_completa,
  beneficios,
  produtos_inclusos,
  fases
) VALUES (
  'consult',
  'IAplicada Consult',
  'b2b',
  'Consultoria + Plataforma',
  15000,
  15000,
  50000,
  NULL,
  'Projeto + Mensal',
  '3-6 meses projeto + recorrência',
  true,
  3,
  5,
  true,
  'Transformação digital implementada do zero ao resultado. Consultoria completa + plataforma recorrente.',
  'Transformação digital implementada do zero ao resultado. Consultoria completa de mapeamento, automação e capacitação + plataforma recorrente para manter equipe atualizada. Você não aprende, nós implementamos com você.',
  jsonb_build_array(
    'Diagnóstico completo de maturidade digital',
    'Mapeamento de processos atuais',
    'Identificação de oportunidades com IA',
    'Roadmap de transformação digital personalizado',
    'Implementação de automações e dashboards',
    'Capacitação hands-on da equipe',
    '1 ferramenta com IA personalizada para empresa',
    'Estrutura organizacional padronizada',
    'Manual técnico completo + Workbook',
    '1 Academy vitalício incluso (gestor)',
    'Suporte durante todo o projeto',
    'Licenças Skills: R$297/pessoa/mês',
    'Trilha personalizada mantida e atualizada',
    'Suporte contínuo pós-implementação',
    'Relatórios mensais de progresso e ROI'
  ),
  jsonb_build_array(
    jsonb_build_object(
      'produto_slug', 'academy',
      'quantidade', 1,
      'descricao', '1 Academy vitalício para gestor'
    )
  ),
  jsonb_build_array(
    jsonb_build_object(
      'nome', 'Projeto de Consultoria',
      'tipo', 'unico',
      'valor_descricao', 'R$15.000 - R$50.000+',
      'duracao', '3-6 meses',
      'inclui', jsonb_build_array('Diagnóstico', 'Implementação', 'Capacitação', '1 Academy')
    ),
    jsonb_build_object(
      'nome', 'Recorrência Pós-Projeto',
      'tipo', 'recorrente',
      'valor_descricao', 'R$297/pessoa/mês (mín. 3 pessoas)',
      'produto_ref', 'skills',
      'inclui', jsonb_build_array('Licenças Skills', 'Trilha personalizada', 'Suporte contínuo', 'Relatórios mensais')
    )
  )
) ON CONFLICT (slug) DO UPDATE SET
  nome = EXCLUDED.nome,
  tipo = EXCLUDED.tipo,
  formato = EXCLUDED.formato,
  valor = EXCLUDED.valor,
  valor_minimo = EXCLUDED.valor_minimo,
  valor_maximo = EXCLUDED.valor_maximo,
  periodicidade = EXCLUDED.periodicidade,
  duracao = EXCLUDED.duracao,
  is_consultoria = EXCLUDED.is_consultoria,
  licencas_minimas = EXCLUDED.licencas_minimas,
  descricao_curta = EXCLUDED.descricao_curta,
  descricao_completa = EXCLUDED.descricao_completa,
  beneficios = EXCLUDED.beneficios,
  produtos_inclusos = EXCLUDED.produtos_inclusos,
  fases = EXCLUDED.fases,
  updated_at = now();