

# Corrigir Entregas: Regenerar entregas_skills e vincular entregas_equipe aos projetos

## Problema

1. A tabela `entregas_skills` esta **vazia** -- as entregas foram deletadas na correcao anterior e nunca foram regeneradas. Isso faz com que tanto a aba "Entregas" no admin quanto no painel do lider fiquem sem dados.
2. A tabela `entregas_equipe_skills` tambem esta **vazia** -- essas sao as entregas que a equipe adiciona manualmente como complemento.
3. O modal de "Nova Entrega" (equipe) so permite vincular a `entregas_skills` (via `entrega_id`), mas como essa tabela esta vazia, nao ha nada para vincular. Deveria tambem poder vincular aos **projetos** do backlog.

## Solucao

### 1. Regenerar entregas_skills via IA

Primeiro, as entregas geradas por IA precisam ser regeneradas. O admin deve clicar em "Gerar Entregas com IA" na aba Entregas do admin. Porem, a edge function ja foi corrigida para gerar entregas como tarefas/atividades (nao copias de projetos). Basta clicar o botao.

**Acao necessaria do admin**: Clicar "Gerar Entregas com IA" na aba Entregas.

### 2. Adicionar campo `projeto_id` na tabela `entregas_equipe_skills`

Atualmente a tabela so tem `entrega_id` (FK para entregas_skills). Adicionar `projeto_id` (FK para backlog_skills) para que a equipe possa associar entregas diretamente aos projetos.

**Migration SQL:**
```text
ALTER TABLE entregas_equipe_skills 
ADD COLUMN projeto_id UUID REFERENCES backlog_skills(id) ON DELETE SET NULL;
```

### 3. Atualizar o modal `EntregaEquipeModal`

- Adicionar um campo **"Projeto Vinculado"** (select com os projetos do backlog_skills)
- Adicionar um campo opcional **"Entrega Vinculada"** (select com entregas da entregas_skills, filtrado pelo projeto selecionado)
- Quando o usuario seleciona um projeto, as entregas daquele projeto aparecem como opcao
- Salvar `projeto_id` junto com os dados

### 4. Atualizar o hook `useEntregasEquipe`

- Incluir `projeto_id` no select e no upsert
- Fazer join com `backlog_skills:projeto_id(titulo)` para exibir o titulo do projeto vinculado

### 5. Atualizar as views (cards e tabela)

- `ProjetoSkillsEntregas.tsx` (painel da equipe): mostrar o nome do projeto vinculado em cada card de entrega
- `SkillsEntregasEquipeTab.tsx` (admin): mostrar coluna "Projeto" na tabela

### 6. Atualizar o `ProjetoSkillsPerformance.tsx` (dashboard lider)

- Incluir dados de `entregas_equipe_skills` no hook ou nos componentes, para que entregas da equipe tambem aparecam nos dashboards

## Detalhes Tecnicos

### Migration

```text
ALTER TABLE entregas_equipe_skills 
ADD COLUMN projeto_id UUID REFERENCES backlog_skills(id) ON DELETE SET NULL;
```

### Hook `useEntregasEquipe`

```text
// Adicionar ao select:
backlog_skills:projeto_id (titulo)

// Adicionar ao tipo EntregaEquipe:
projeto_id: string | null;
projeto?: { titulo: string } | null;
```

### Modal `EntregaEquipeModal`

- Nova prop: `projetos: { id: string; titulo: string }[]`
- Novo campo select "Projeto vinculado" que salva `projeto_id`
- Buscar projetos do backlog no componente pai (`ProjetoSkillsEntregas.tsx`)

### Cards e Tabela

- Exibir badge com titulo do projeto em cada entrega da equipe
- Filtro por projeto no painel da equipe

## Arquivos

**Novos:** Nenhum

**Modificados:**
- `src/hooks/useEntregasEquipe.ts` -- adicionar projeto_id, join com backlog_skills
- `src/components/skills/EntregaEquipeModal.tsx` -- campo select de projetos
- `src/components/skills/ProjetoSkillsEntregas.tsx` -- passar projetos ao modal, exibir nome do projeto nos cards
- `src/components/admin/skills/SkillsEntregasEquipeTab.tsx` -- coluna "Projeto" na tabela admin

**Migration:** adicionar coluna `projeto_id` na tabela `entregas_equipe_skills`

## Resultado

- Admin regenera entregas com IA (botao ja existente)
- Equipe pode criar entregas vinculadas a projetos do backlog
- Entregas aparecem corretamente tanto no admin quanto no painel
- Dashboards refletem dados de entregas da equipe
