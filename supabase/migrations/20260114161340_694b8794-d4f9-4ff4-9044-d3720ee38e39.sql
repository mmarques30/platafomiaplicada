-- ===============================================
-- MIGRAÇÃO PARTE 2: Atualizar produtos e usuários
-- ===============================================

-- 1. Excluir produtos Lab e Club da tabela produtos
DELETE FROM produtos WHERE slug IN ('lab', 'club');

-- 2. Atualizar produto Consult para Business
UPDATE produtos 
SET 
  slug = 'business',
  nome = 'IAplicada Business',
  ativo = true,
  tipo = 'b2b',
  formato = 'Consultoria + Implementação Personalizada',
  descricao_curta = 'Solução de gestão personalizada que utiliza IA para automatizar processos operacionais e dar visibilidade aos problemas que impedem o crescimento da sua empresa.',
  descricao_completa = 'O Business da IAplicada é uma plataforma de gestão e automação inteligente, construída sob medida para PMEs. Ele substitui processos manuais e planilhas desorganizadas por um sistema centralizado que utiliza Inteligência Artificial para automatizar tarefas, gerar insights e dar visibilidade completa da operação.',
  valor = 9997.00,
  valor_minimo = 9997.00,
  valor_maximo = 70000.00,
  periodicidade = 'projeto',
  duracao = '10 semanas',
  is_consultoria = true,
  beneficios = '[
    "Diagnóstico completo de maturidade digital",
    "Mapeamento de processos atuais",
    "Identificação de oportunidades com IA",
    "Roadmap de transformação digital personalizado",
    "Implementação de automações e dashboards",
    "Capacitação hands-on da equipe",
    "1 ferramenta com IA personalizada",
    "Estrutura organizacional padronizada",
    "Manual técnico completo + Workbook",
    "1 Academy vitalício incluso (gestor)",
    "Suporte durante todo o projeto"
  ]'::jsonb,
  updated_at = now()
WHERE slug = 'consult';

-- 3. Atualizar produto Academy com valores corretos
UPDATE produtos 
SET 
  valor = 1497.00,
  valor_com_desconto = 979.00,
  periodicidade = 'anual',
  duracao = '12 meses',
  descricao_curta = 'Comunidade para treinamento de profissionais que querem aumentar produtividade e resultados com as melhores ferramentas de IA.',
  descricao_completa = 'Uma comunidade para treinamento de profissionais que querem aumentar sua produtividade e resultados, que utiliza as melhores ferramentas de IA para te deixar mais produtivo. Ideal para profissionais que querem se destacar no trabalho, se tornar mais produtivos e ter relevância na sua empresa.',
  beneficios = '[
    "Metodologia APLICA exclusiva",
    "Trilhas por objetivo (do iniciante ao avançado)",
    "Prompts prontos para cada situação",
    "Ferramentas IA testadas e avaliadas",
    "Templates de automação prontos",
    "Atualizações constantes (IA muda todo mês)",
    "Q&A ao vivo semanal (19h30)",
    "Assistente IA 24/7 (Mari)",
    "Diagnóstico personalizado por IA",
    "Dashboard com horas economizadas e ROI",
    "Liberação gradual: 4 vídeos/semana"
  ]'::jsonb,
  updated_at = now()
WHERE slug = 'academy';

-- 4. Atualizar produto Skills
UPDATE produtos 
SET 
  ativo = true,
  valor = 4497.00,
  valor_com_desconto = 3997.00,
  periodicidade = 'anual',
  duracao = '12 meses',
  formato = 'Plataforma recorrente + Personalização',
  licencas_minimas = 3,
  descricao_curta = 'Plataforma de conteúdo com treinamentos das melhores ferramentas de IA, focada em aumentar a produtividade da sua equipe.',
  descricao_completa = 'Para pequenas e médias empresas, com faturamento entre R$ 5 milhões e R$ 50 milhões, que possuem equipes com pelo menos 3 contribuidores individuais. Diagnosticamos as dores e obstáculos da sua área e desenvolvemos planos personalizados para elevar a maturidade da equipe.',
  beneficios = '[
    "Trilha de desenvolvimento personalizada",
    "Mapeamento de pontos individuais de evolução",
    "Plataforma de acompanhamento e gestão",
    "Visibilidade do progresso e resultados",
    "Projetos com impacto direto no negócio",
    "Diagnóstico de dores e obstáculos da área",
    "Aumento de maturidade em tomada de decisão",
    "Automação de atividades manuais",
    "Mínimo 3 licenças por empresa"
  ]'::jsonb,
  updated_at = now()
WHERE slug = 'skills';

-- 5. Migrar usuários de club, boost e legacy para business
UPDATE profiles 
SET 
  plano_mentoria = 'business',
  updated_at = now()
WHERE plano_mentoria IN ('club', 'boost', 'legacy');

-- 6. Atualizar trilhas com nivel_minimo_acesso = 'club' para 'business'
UPDATE trilhas
SET nivel_minimo_acesso = 'business'
WHERE nivel_minimo_acesso = 'club';

-- 7. Atualizar módulos com nivel_minimo_acesso = 'club' para 'business'
UPDATE modulos
SET nivel_minimo_acesso = 'business'
WHERE nivel_minimo_acesso = 'club';