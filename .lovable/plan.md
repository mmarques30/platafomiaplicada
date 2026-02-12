
# Melhorar IA para gerar projetos para TODOS os membros + tag "Pendente Avaliacao"

## Problema

Quando um membro tem processos de natureza estrategica/gestao (ex: "Planejamento Estrategico TI", "Gestao Time", "Gestao Fornecedores"), a IA nao gera projetos para ele porque nao identifica tarefas operacionais claras para automatizar. Isso deixa membros sem nenhum projeto atribuido.

## Solucao

1. Ajustar o prompt da IA para que SEMPRE gere pelo menos 1 projeto por membro, mesmo que os processos sejam estrategicos/gestao
2. Adicionar um campo `tags` na tabela `backlog_skills` e `entregas_skills` para marcar projetos que precisam de avaliacao
3. Quando o processo do membro for estrategico/gestao (sem gargalos operacionais claros), a IA marca o projeto com a tag `pendente_avaliacao`
4. Na interface, exibir visualmente os projetos com essa tag para o admin revisar

## Detalhes Tecnicos

### 1. Migration: adicionar coluna `tags` nas tabelas

Adicionar coluna `tags` (tipo `text[]`, default `'{}'`) nas tabelas:
- `backlog_skills`
- `entregas_skills`

Isso permite marcar projetos com tags como `pendente_avaliacao`, `estrategico`, `operacional`, etc.

### 2. Ajustar prompt em `gerar-projetos-skills/index.ts`

Modificar o prompt para:
- Instruir a IA a gerar pelo menos 1 projeto por membro
- Para membros com processos estrategicos/gestao (sem gargalos operacionais), gerar projetos sugeridos mas marcar com `necessita_avaliacao: true`
- Adicionar campo `necessita_avaliacao` (boolean) no schema de retorno da tool call
- No insert, converter `necessita_avaliacao: true` para a tag `pendente_avaliacao` no array `tags`

Exemplo de logica no prompt:
```text
REGRAS:
- Gere pelo menos 1 projeto por membro da equipe
- Se um membro tem processos estrategicos/gestao sem gargalos operacionais claros,
  sugira projetos de apoio a gestao com IA (dashboards, automacao de reports, etc.)
  e marque necessita_avaliacao como true
- Se um membro tem processos operacionais com gargalos claros,
  marque necessita_avaliacao como false
```

### 3. Ajustar prompt em `associar-membros-skills/index.ts`

Mesma logica: quando a IA nao consegue associar com confianca (processos estrategicos sem match direto), marcar com tag `pendente_avaliacao`.

### 4. Ajustar UI em `ProjetosMapeadosTab.tsx`

- Exibir badge amarelo "Pendente Avaliacao" nos projetos que tiverem essa tag
- Permitir que o admin remova a tag ao aprovar o projeto (clicando no badge)

### 5. Ajustar UI em `SkillsEntregasTab.tsx`

- Mesma logica: exibir badge nas entregas com tag `pendente_avaliacao`

## Arquivos

**Modificados:**
- `supabase/functions/gerar-projetos-skills/index.ts` — prompt + logica de tags
- `supabase/functions/associar-membros-skills/index.ts` — prompt + logica de tags
- `src/components/admin/skills/ProjetosMapeadosTab.tsx` — exibir badge + acao de aprovar
- `src/components/admin/skills/SkillsEntregasTab.tsx` — exibir badge nas entregas

**Migration:**
- Adicionar coluna `tags text[] default '{}'` em `backlog_skills` e `entregas_skills`

## Resultado esperado

- Todo membro recebe pelo menos 1 projeto
- Projetos gerados para membros com perfil estrategico vem com badge "Pendente Avaliacao"
- O admin pode revisar e aprovar esses projetos removendo a tag
- Projetos operacionais continuam sendo gerados normalmente sem tag
