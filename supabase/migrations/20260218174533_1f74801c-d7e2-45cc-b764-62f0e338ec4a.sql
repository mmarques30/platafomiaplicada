
-- Adicionar status nao_aprovado ao check constraint
ALTER TABLE backlog_skills DROP CONSTRAINT IF EXISTS backlog_skills_status_check;
ALTER TABLE backlog_skills ADD CONSTRAINT backlog_skills_status_check
  CHECK (status IN ('levantado', 'priorizado', 'em_execucao', 'entregue', 'nao_aprovado'));

-- Atualizar RLS para todos os membros
DROP POLICY IF EXISTS "Lider e admin podem gerenciar backlog" ON backlog_skills;
DROP POLICY IF EXISTS "Membros podem gerenciar backlog" ON backlog_skills;
CREATE POLICY "Membros podem gerenciar backlog"
  ON backlog_skills FOR ALL
  USING (is_member_of_skills_team(equipe_id) OR has_role(auth.uid(), 'admin'))
  WITH CHECK (is_member_of_skills_team(equipe_id) OR has_role(auth.uid(), 'admin'));
