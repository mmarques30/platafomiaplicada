
# Conectar Projetos Mapeados ao Kanban do Skills

## Problema

Existem dois desconectamentos no fluxo atual:

1. **Projetos gerados pela IA ficam apenas no `backlog_skills`** (tabela de projetos mapeados), mas o Kanban na pagina "Projetos" do usuario le apenas da tabela `entregas_skills` (que esta vazia).

2. **Nao ha pipeline automatico**: gerar projetos com IA popula `backlog_skills`, mas nada cria automaticamente as entradas em `entregas_skills` que alimentam o Kanban.

3. **Filtro de visibilidade**: o hook `useSkillsEntregas` filtra por `responsavel_id` para membros comuns. Entregas geradas por IA nao tem responsavel, entao ficariam invisiveis.

## Dados Atuais

- `backlog_skills`: 7 projetos gerados (status "levantado")
- `entregas_skills`: 0 registros (vazio)
- Kanban: vazio porque le de `entregas_skills`

## Solucao

### 1. Kanban deve exibir AMBAS as fontes de dados

O Kanban do "Projeto Skills > Projetos" passara a exibir os itens do `backlog_skills` integrados com as `entregas_skills`. Projetos do backlog aparecerao na coluna BACKLOG automaticamente, e entregas vinculadas aparecerao nas demais colunas.

**Arquivo:** `src/hooks/useSkillsEntregas.ts`

- Alem de buscar `entregas_skills`, buscar tambem `backlog_skills` da equipe
- Projetos do backlog que ainda nao tem entregas vinculadas aparecem na coluna BACKLOG como cards
- Quando um projeto tem entregas, as entregas sao exibidas normalmente nas colunas correspondentes
- Para admin/lider: ver todos os itens da equipe
- Para membro: ver itens onde e responsavel OU itens sem responsavel (para poder "pegar" tarefas)

### 2. Atualizar o Kanban para suportar itens do backlog

**Arquivo:** `src/components/skills/ProjetoSkillsKanban.tsx`

- Incluir na coluna BACKLOG os projetos do `backlog_skills` que ainda nao tem entregas
- Diferenciar visualmente projetos (backlog) de entregas com um badge "Projeto" vs "Entrega"
- Ao arrastar um projeto do BACKLOG para EM ANDAMENTO, converter automaticamente em entrega no `entregas_skills`

### 3. Corrigir visibilidade para admin sem equipe

**Arquivo:** `src/hooks/useSkillsEntregas.ts`

- Admin com `equipeId` do contexto (seletor de equipe) deve ver todas as entregas da equipe, assim como o lider
- Remover a restricao de `responsavel_id` quando o usuario e admin ou lider

### 4. Automatizar geracao de entregas apos gerar projetos

**Arquivo:** `supabase/functions/gerar-projetos-skills/index.ts`

- Apos gerar e salvar os projetos no `backlog_skills`, chamar automaticamente a funcao `gerar-entregas-skills` para criar as entregas correspondentes
- Isso cria o pipeline completo: diagnostico -> projetos -> entregas, tudo em um clique

### 5. Alternativa simplificada (recomendada)

Em vez de manter duas tabelas paralelas no Kanban, a abordagem mais limpa e:

- Ao gerar projetos com IA, criar automaticamente uma entrega basica para cada projeto na `entregas_skills` com `backlog_item_id` preenchido
- O Kanban continua lendo apenas de `entregas_skills`
- Cada entrega ja aparece na coluna BACKLOG (status "pendente")
- Isso elimina a necessidade de ler de duas tabelas

**Isso sera feito adicionando ao final da funcao `gerar-projetos-skills`** uma chamada para gerar entregas, ou inserindo entregas basicas diretamente.

## Plano de Implementacao

### Passo 1 — Atualizar `gerar-projetos-skills` para criar entregas automaticamente

Apos inserir os projetos no `backlog_skills`, inserir tambem uma entrega basica em `entregas_skills` para cada projeto:

```text
Para cada projeto gerado:
  -> Inserir em backlog_skills (como hoje)
  -> Inserir em entregas_skills com:
     - equipe_id
     - backlog_item_id = projeto.id
     - titulo = projeto.titulo
     - descricao = projeto.descricao
     - status = "pendente"
     - prioridade = mapear alta->P1, media->P2, baixa->P3
     - economia_horas_semana = projeto.horas_estimadas_economia
```

### Passo 2 — Corrigir `useSkillsEntregas` para admin

Quando o usuario e admin com `equipeId` selecionado via contexto, buscar todas as entregas da equipe (mesmo comportamento do lider).

### Passo 3 — Criar entregas para projetos ja existentes

Como ja existem 7 projetos no backlog sem entregas correspondentes, o botao "Gerar Entregas com IA" na aba Entregas do admin ja resolve isso. Porem, tambem adicionarei um botao direto no Kanban para o admin/lider poder regenerar.

## Arquivos Modificados

- `supabase/functions/gerar-projetos-skills/index.ts` — adicionar criacao automatica de entregas apos gerar projetos
- `src/hooks/useSkillsEntregas.ts` — corrigir query para admin com equipe selecionada
- `src/components/skills/ProjetoSkillsKanban.tsx` — adicionar botao "Gerar Entregas" quando Kanban vazio e existem projetos no backlog

## Resultado Esperado

- Ao gerar projetos com IA, as entregas ja aparecem automaticamente no Kanban
- Admin vendo uma equipe consegue ver todas as entregas no Kanban
- Projetos existentes podem ser convertidos em entregas pelo botao "Gerar Entregas com IA"
