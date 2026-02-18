
-- INSERT: adicionar admin
DROP POLICY "Members can insert team entregas" ON entregas_equipe_skills;
CREATE POLICY "Members can insert team entregas"
  ON entregas_equipe_skills FOR INSERT
  WITH CHECK (is_member_of_skills_team(equipe_id) OR has_role(auth.uid(), 'admin'));

-- UPDATE: adicionar admin
DROP POLICY "Members can update team entregas" ON entregas_equipe_skills;
CREATE POLICY "Members can update team entregas"
  ON entregas_equipe_skills FOR UPDATE
  USING (is_member_of_skills_team(equipe_id) OR has_role(auth.uid(), 'admin'));
