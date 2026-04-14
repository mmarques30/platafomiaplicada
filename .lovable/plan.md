

## Diagnóstico

O erro **"Database error deleting user"** ocorre porque 6 tabelas referenciam `profiles` com foreign keys configuradas como **NO ACTION** (padrão), o que impede a exclusão quando há dados relacionados.

Tabelas bloqueadoras:
- `backlog_skills.colaborador_id`
- `candidaturas_mentoria.admin_responsavel`
- `duvidas_mentoria.respondida_por`
- `melhorias_plataforma.created_by`
- `premiacoes_comunidade.vencedor_id`
- `subtarefas_entregas_skills.responsavel_id`

## Plano

**Uma migration** para alterar essas 6 foreign keys de `NO ACTION` para `ON DELETE SET NULL` (preserva os registros históricos, apenas remove a referência ao usuário deletado):

```sql
-- backlog_skills.colaborador_id
ALTER TABLE backlog_skills DROP CONSTRAINT ..., ADD CONSTRAINT ... REFERENCES profiles(id) ON DELETE SET NULL;

-- candidaturas_mentoria.admin_responsavel  
-- duvidas_mentoria.respondida_por
-- melhorias_plataforma.created_by
-- premiacoes_comunidade.vencedor_id
-- subtarefas_entregas_skills.responsavel_id
-- (mesmo padrão para todas)
```

Isso segue o mesmo padrão já aplicado anteriormente em `notas_projeto_business` e `webhook_lia_logs` (conforme o memory de integridade de exclusão de usuários).

Nenhuma alteração de código é necessária — apenas a migration no banco.

