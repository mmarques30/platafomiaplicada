
# Backlog Skills: Adicionar projetos manuais + Classificacao de status

## Problemas identificados

1. **Sem botao para adicionar projetos**: Nao existe formulario para criar projetos manuais no backlog - apenas os gerados pelo diagnostico/IA aparecem.
2. **Sem controle de status no detalhe**: O modal de detalhe do projeto e somente leitura, sem opcao de mudar status ou classificar como aprovado/nao aprovado.
3. **RLS restritiva**: A policy atual so permite lideres e admins gerenciarem o backlog. Para que todos os membros possam adicionar e classificar, precisa ser ajustada.
4. **Labels de status desatualizadas**: O modal e a tabela ainda usam labels antigas (`em_andamento`, `concluido`, `descartado`) que nao correspondem aos valores do banco (`levantado`, `priorizado`, `em_execucao`, `entregue`).
5. **Kanban com 3 colunas vs 4 status no banco**: O status `priorizado` existe no banco mas nao aparece no Kanban.

## Solucao

### 1. Migracao no banco de dados

- Adicionar status `nao_aprovado` ao check constraint para permitir classificar projetos rejeitados
- Atualizar RLS: trocar a policy "ALL" de `is_leader_of_skills_team` para `is_member_of_skills_team`, permitindo que qualquer membro ativo gerencie o backlog

```sql
-- Adicionar status nao_aprovado
ALTER TABLE backlog_skills DROP CONSTRAINT backlog_skills_status_check;
ALTER TABLE backlog_skills ADD CONSTRAINT backlog_skills_status_check
  CHECK (status IN ('levantado', 'priorizado', 'em_execucao', 'entregue', 'nao_aprovado'));

-- Atualizar RLS para todos os membros
DROP POLICY "Lider e admin podem gerenciar backlog" ON backlog_skills;
CREATE POLICY "Membros podem gerenciar backlog"
  ON backlog_skills FOR ALL
  USING (is_member_of_skills_team(equipe_id) OR has_role(auth.uid(), 'admin'))
  WITH CHECK (is_member_of_skills_team(equipe_id) OR has_role(auth.uid(), 'admin'));
```

### 2. Hook useSkillsBacklog - adicionar mutacoes

Adicionar ao hook existente:
- `addItem`: mutacao INSERT para criar projetos manuais (com `origem: 'manual'`)
- `updateItem`: mutacao UPDATE para editar campos como status, prioridade, responsavel
- `deleteItem`: mutacao DELETE para remover projetos

### 3. Novo componente: AddProjetoModal

Formulario simples com campos:
- Titulo (obrigatorio)
- Descricao
- Area impactada
- Prioridade (alta/media/baixa)
- Horas estimadas de economia

### 4. Atualizar BacklogView

- Adicionar botao "+ Novo Projeto" ao lado do toggle de visualizacao
- Integrar o AddProjetoModal

### 5. Atualizar Kanban para 4 colunas + nao aprovado

Colunas:
- LEVANTADO (novos projetos)
- PRIORIZADO (aprovados para execucao)
- EM EXECUCAO
- ENTREGUE

Projetos com status `nao_aprovado` aparecem em uma secao separada abaixo do kanban ou com badge visual na coluna "Levantado".

### 6. Atualizar ProjetoDetailModal

- Adicionar controles de status (select ou botoes)
- Botao "Aprovar" (muda para `priorizado`) e "Nao Aprovar" (muda para `nao_aprovado`)
- Corrigir labels de status para os valores corretos do banco

### 7. Atualizar BacklogTable

- Corrigir labels de status para valores do banco
- Adicionar coluna ou acao rapida para mudar status

## Resumo de arquivos alterados

| Arquivo | Alteracao |
|---|---|
| Migracao SQL | Novo check constraint + nova policy RLS |
| `src/hooks/useSkillsBacklog.ts` | Adicionar mutacoes addItem, updateItem, deleteItem |
| `src/components/skills/backlog/BacklogView.tsx` | Botao "+ Novo Projeto" + modal |
| `src/components/skills/backlog/AddProjetoModal.tsx` | **Novo** - formulario de criacao |
| `src/components/skills/backlog/BacklogKanban.tsx` | 4 colunas + secao nao aprovados |
| `src/components/skills/backlog/ProjetoDetailModal.tsx` | Controles de status + labels corrigidas |
| `src/components/skills/backlog/BacklogTable.tsx` | Labels corrigidas |
