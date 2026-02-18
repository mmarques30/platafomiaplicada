ALTER TABLE backlog_skills DROP CONSTRAINT IF EXISTS backlog_skills_status_check;
ALTER TABLE backlog_skills ADD CONSTRAINT backlog_skills_status_check
  CHECK (status IN (
    'levantado', 'aprovado', 'nao_aprovado', 'backlog',
    'priorizado', 'em_execucao', 'entregue'
  ));