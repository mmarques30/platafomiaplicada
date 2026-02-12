
ALTER TABLE backlog_skills
  ADD COLUMN trilhas_recomendadas JSONB DEFAULT '[]';

ALTER TABLE entregas_skills
  ADD COLUMN conteudo_suporte JSONB DEFAULT '[]';
