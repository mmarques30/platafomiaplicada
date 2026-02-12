
# Submenu "Entregas" no Projeto Skills + Aba "Entregas Equipe" no Admin

## Resumo

Criar uma nova pagina "Entregas" acessivel como submenu de "Projeto Skills" no sidebar, onde todos os membros da equipe podem visualizar, criar, editar entregas, definir prazos e fazer upload de arquivos. Simultaneamente, adicionar uma aba "Entregas Equipe" no hub admin de Skills para o administrador acompanhar todas as alteracoes feitas pela equipe.

## O que muda para o usuario

1. No menu lateral, dentro de "Projeto Skills", aparece um novo item **"Entregas"** (abaixo de "Projetos")
2. Ao clicar, abre uma pagina com lista de entregas da equipe em formato de tabela/cards editaveis
3. Cada membro pode:
   - Ver todas as entregas da equipe (incluindo as geradas por IA)
   - Criar novas entregas manualmente
   - Editar titulo, descricao, prazo, status, responsavel
   - Fazer upload de arquivos/evidencias vinculados a cada entrega
   - Adicionar notas/comentarios
4. O admin ve uma nova aba "Entregas Equipe" ao lado de "Entregas" no Mentoria Skills, com visao somente-leitura de tudo que a equipe preencheu/alterou

## Detalhes Tecnicos

### 1. Nova tabela: `entregas_equipe_skills`

Tabela para armazenar os dados preenchidos/editados pela equipe, separados dos dados gerados pelo admin/IA em `entregas_skills`.

Campos:
- `id` (uuid, PK)
- `entrega_id` (uuid, FK -> entregas_skills) -- vinculo com a entrega original
- `equipe_id` (uuid, FK -> equipes_skills)
- `editado_por` (uuid) -- quem fez a ultima edicao
- `titulo_equipe` (text) -- titulo customizado pela equipe (pode diferir do original)
- `descricao_equipe` (text) -- descricao/notas da equipe
- `status_equipe` (text) -- status gerenciado pela equipe (pendente, em_andamento, concluido, bloqueado)
- `prazo_equipe` (date) -- prazo definido pela equipe
- `responsavel_id` (uuid) -- membro responsavel
- `prioridade_equipe` (text) -- P1, P2, P3
- `notas` (text) -- anotacoes/comentarios livres
- `arquivos` (jsonb) -- array de URLs de arquivos uploadados [{nome, url, tipo, uploaded_at}]
- `progresso` (integer, default 0) -- 0-100
- `created_at` (timestamptz)
- `updated_at` (timestamptz)

RLS: membros ativos da equipe podem ler e escrever; admin pode ler tudo.

### 2. Storage bucket: `entregas-equipe-skills`

Bucket privado para uploads de arquivos/evidencias das entregas da equipe.

### 3. Nova rota: `/skills/projeto/entregas`

**Arquivo novo:** `src/pages/skills/ProjetoSkillsEntregasPage.tsx`

Pagina com:
- Lista de entregas (lidas de `entregas_skills` + join com `entregas_equipe_skills`)
- Botao "Nova Entrega" para criar entregas manuais da equipe
- Cada card/linha e clicavel para abrir modal de edicao
- Modal com campos: titulo, descricao, responsavel, prazo, status, prioridade, notas, upload de arquivos

### 4. Componente principal: `ProjetoSkillsEntregas.tsx`

**Arquivo novo:** `src/components/skills/ProjetoSkillsEntregas.tsx`

Componente que exibe as entregas em formato de lista/cards com:
- Filtros por status, responsavel, prioridade
- Cards mostrando titulo, responsavel (avatar), status badge, prazo, progresso
- Acao de clique para abrir edicao
- Botao "+" para nova entrega

### 5. Modal de edicao: `EntregaEquipeModal.tsx`

**Arquivo novo:** `src/components/skills/EntregaEquipeModal.tsx`

Dialog com formulario:
- Titulo, descricao, notas (textareas)
- Responsavel (select com membros da equipe)
- Status (select: pendente, em_andamento, concluido, bloqueado)
- Prioridade (P1, P2, P3)
- Prazo (date input)
- Progresso (slider 0-100)
- Upload de arquivos (multiplos, salvos no bucket)
- Botao salvar que grava em `entregas_equipe_skills`

### 6. Hook: `useEntregasEquipe.ts`

**Arquivo novo:** `src/hooks/useEntregasEquipe.ts`

- Busca entregas da equipe (join `entregas_skills` com `entregas_equipe_skills`)
- Mutations para criar, atualizar e deletar registros em `entregas_equipe_skills`
- Upload de arquivos para o bucket

### 7. Menu sidebar: inserir `projeto_skills_entregas`

Inserir novo registro na tabela `menu_config`:
- `menu_key`: `projeto_skills_entregas`
- `label`: "Entregas"
- `parent_key`: `projeto_skills`
- `url`: `/skills/projeto/entregas`
- `icon`: `Package`
- `ordem`: 5 (apos Projetos que e 4)
- `planos_permitidos`: `["skills"]`

Atualizar `useMenuConfig.tsx` para incluir `projeto_skills_entregas` nas listas de menus ocultos por ambiente (business, academy, gratuito, business_iaplicada).

### 8. Rota no App.tsx

Adicionar:
```
<Route path="/skills/projeto/entregas" element={<SkillsAdminTeamProvider><ProjetoSkillsEntregasPage /></SkillsAdminTeamProvider>} />
```

### 9. Aba "Entregas Equipe" no Admin

**Arquivo novo:** `src/components/admin/skills/SkillsEntregasEquipeTab.tsx`

Componente read-only que exibe tudo que a equipe preencheu em `entregas_equipe_skills`:
- Tabela com titulo, responsavel, status, prazo, progresso, notas, arquivos
- Badges de status e prioridade
- Links para download de arquivos
- Sem edicao (somente visualizacao para o admin)

Atualizar `MentoriaSkillsPage.tsx` para adicionar a nova aba ao lado de "Entregas".

## Arquivos

**Novos:**
- `src/pages/skills/ProjetoSkillsEntregasPage.tsx` -- pagina da rota
- `src/components/skills/ProjetoSkillsEntregas.tsx` -- componente principal
- `src/components/skills/EntregaEquipeModal.tsx` -- modal de edicao
- `src/hooks/useEntregasEquipe.ts` -- hook de dados
- `src/components/admin/skills/SkillsEntregasEquipeTab.tsx` -- aba admin

**Modificados:**
- `src/App.tsx` -- nova rota
- `src/hooks/useMenuConfig.tsx` -- incluir novo menu nas listas de ocultos
- `src/pages/admin/mentoria/MentoriaSkillsPage.tsx` -- adicionar aba "Entregas Equipe"

**Migracao SQL:**
- Criar tabela `entregas_equipe_skills` com RLS
- Criar bucket `entregas-equipe-skills`
- Inserir registro em `menu_config` para o submenu
