

# Correcao de RLS na tabela `entregas_equipe_skills`

## Problema
As policies de **INSERT** e **UPDATE** na tabela `entregas_equipe_skills` nao incluem acesso para administradores. Apenas membros da equipe conseguem inserir/atualizar. Quando um admin tenta criar uma entrega, o RLS bloqueia.

## Policies atuais

| Operacao | Regra |
|----------|-------|
| SELECT | Membro da equipe **OU** admin |
| INSERT | Apenas membro da equipe |
| UPDATE | Apenas membro da equipe |
| DELETE | Membro da equipe **OU** admin |

## Correcao
Atualizar as policies de **INSERT** e **UPDATE** para incluir admins, alinhando com SELECT e DELETE:

```sql
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
```

Isso resolve o erro sem alterar nenhum codigo frontend.

