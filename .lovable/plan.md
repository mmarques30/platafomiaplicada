
# Associar Projetos e Entregas aos Membros via IA

## Problema Atual

As edge functions `gerar-projetos-skills` e `gerar-entregas-skills` geram projetos e entregas sem associar nenhum membro como responsavel. Ambas as tabelas (`backlog_skills` e `entregas_skills`) possuem o campo `responsavel_id`, mas ele nunca e preenchido.

O resultado: todos os projetos e entregas ficam "orfaos", sem dono, e os membros nao sabem o que e deles.

## Dados da Equipe Engelmig (para correcao retroativa)

- **4 membros** com diagnosticos completos:
  - Livia Pesso (Financeiro) - user_id: 7d61d3bb
  - Antonio (TI) - user_id: 338e43eb
  - Erich (TI) - user_id: 8cc7e7fa
  - Lucio Torres (Operacoes) - user_id: d068fff0

- **7 projetos** no backlog, todos sem responsavel
- **14 entregas** na entregas_skills, todas sem responsavel

## Solucao

### 1. Atualizar `gerar-entregas-skills` para associar membros

A edge function `gerar-entregas-skills` ja recebe membros da equipe mas nao pede a IA para atribuir responsaveis. A mudanca:

- Incluir os diagnosticos individuais de cada membro no prompt da IA
- Pedir a IA que associe cada entrega ao membro mais adequado, baseado na area de atuacao e nos gargalos/processos do diagnostico individual
- Adicionar `responsavel_nome` no schema de retorno da IA
- Mapear o nome do responsavel para o `user_id` e preencher `responsavel_id` ao inserir

**Arquivo:** `supabase/functions/gerar-entregas-skills/index.ts`

Mudancas no prompt:
```text
MEMBROS DA EQUIPE COM SEUS DIAGNOSTICOS:
- Livia Pesso (Financeiro): processos X, Y; gargalos A, B
- Antonio (TI): processos W, Z; gargalos C, D
...

Para cada entrega, indique o membro mais adequado como responsavel 
baseado na area de atuacao e nos processos/gargalos do diagnostico individual.
```

Mudanca no schema de tool calling:
- Adicionar campo `responsavel_nome` (string) nas propriedades da entrega

Mudanca no insert:
- Mapear `responsavel_nome` para `user_id` e preencher `responsavel_id`

### 2. Atualizar `gerar-projetos-skills` para associar membros

Mesma logica: incluir dados dos diagnosticos individuais no prompt e pedir que a IA associe cada projeto ao membro mais relevante.

**Arquivo:** `supabase/functions/gerar-projetos-skills/index.ts`

- Buscar membros e profiles alem dos diagnosticos
- Incluir no prompt quem e cada membro e sua area
- Adicionar `responsavel_nome` no schema de retorno
- Mapear para `user_id` e preencher `responsavel_id` no insert do `backlog_skills`
- Preencher tambem `responsavel_id` no insert automatico do `entregas_skills`

### 3. Correcao retroativa para a equipe Engelmig

Criar uma nova edge function `associar-membros-skills` que:
- Recebe `equipe_id`
- Le todos os projetos e entregas sem responsavel
- Le os diagnosticos individuais dos membros
- Envia tudo para a IA pedindo a associacao
- Atualiza `responsavel_id` nos registros existentes de `backlog_skills` e `entregas_skills`

**Arquivo novo:** `supabase/functions/associar-membros-skills/index.ts`

### 4. Adicionar botao no painel admin para executar a associacao

No `SkillsEntregasTab.tsx`, adicionar um botao "Associar Membros com IA" que chama a nova edge function para equipes que ja tem projetos/entregas sem responsavel.

**Arquivo:** `src/components/admin/skills/SkillsEntregasTab.tsx`

## Plano de Implementacao

### Passo 1 - Edge function `associar-membros-skills` (nova)
- Busca projetos (backlog_skills) e entregas (entregas_skills) sem responsavel
- Busca diagnosticos individuais com nome, area, processos
- Envia para IA com prompt pedindo associacao membro-projeto e membro-entrega
- Atualiza os registros com o `responsavel_id` correto

### Passo 2 - Atualizar `gerar-entregas-skills`
- Incluir diagnosticos individuais no prompt
- Adicionar `responsavel_nome` no schema
- Preencher `responsavel_id` no insert

### Passo 3 - Atualizar `gerar-projetos-skills`
- Incluir membros com diagnosticos no prompt
- Adicionar `responsavel_nome` no schema
- Preencher `responsavel_id` em `backlog_skills` e `entregas_skills`

### Passo 4 - Botao no admin
- Adicionar botao "Associar Membros com IA" no SkillsEntregasTab
- Chamar edge function e invalidar cache apos sucesso

### Passo 5 - Executar para Engelmig
- Chamar a edge function para a equipe `412b0ddd-a38a-4354-86e0-274e892ea9be`
- Validar que os 14 registros de entregas e 7 projetos foram associados

## Arquivos

**Novos:**
- `supabase/functions/associar-membros-skills/index.ts`

**Modificados:**
- `supabase/functions/gerar-entregas-skills/index.ts`
- `supabase/functions/gerar-projetos-skills/index.ts`
- `src/components/admin/skills/SkillsEntregasTab.tsx`
- `supabase/config.toml` (adicionar nova function)

## Resultado Esperado

- Ao gerar projetos/entregas com IA, cada item ja sai com um membro responsavel atribuido
- A equipe Engelmig tera seus 7 projetos e 14 entregas associados aos 4 membros de acordo com area e diagnostico
- O admin pode re-executar a associacao a qualquer momento via botao no painel
