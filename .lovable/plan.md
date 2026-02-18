
# Adicionar campo de Observacoes nos Projetos do Backlog

## Objetivo
Permitir que os membros registrem observacoes/notas nos projetos, especialmente ao aprovar ou mudar de status.

## Alteracoes

### 1. Migracao no banco de dados

Adicionar uma coluna `observacoes` (tipo `text`, nullable) na tabela `backlog_skills`:

```sql
ALTER TABLE backlog_skills ADD COLUMN observacoes text;
```

### 2. Hook `useSkillsBacklog.ts`

Incluir `observacoes` no tipo `BacklogItem` para que o campo fique disponivel no frontend.

### 3. Modal de detalhes `ProjetoDetailModal.tsx`

- Adicionar um campo `Textarea` editavel para observacoes, visivel para todos os status
- O campo sera salvo automaticamente ao sair do foco (onBlur), chamando `onUpdate(item.id, { observacoes: valor })`
- Ficar posicionado logo abaixo da descricao, com label "Observacoes"

### 4. Card `BacklogCard.tsx`

Nenhuma alteracao - observacoes sao informacao de detalhe, aparecem apenas no modal.

## Resumo de arquivos

| Arquivo | Alteracao |
|---|---|
| Migracao SQL | Nova coluna `observacoes` (text) |
| `useSkillsBacklog.ts` | Adicionar `observacoes` ao tipo `BacklogItem` |
| `ProjetoDetailModal.tsx` | Campo Textarea editavel para observacoes |
