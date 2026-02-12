
# Associar Projetos e Entregas aos Membros via IA

## Resumo

Criar uma edge function que usa IA para associar projetos e entregas aos membros da equipe com base nos diagnosticos individuais. Atualizar as funcoes de geracao existentes para ja fazerem essa associacao automaticamente. Executar retroativamente para a equipe Inovacao (Engelmig).

## Dados atuais da equipe Inovacao

- **7 projetos** sem responsavel no `backlog_skills`
- **14 entregas** sem responsavel no `entregas_skills`
- **4 membros** com diagnosticos completos:
  - Livia Pesso (Financeiro) - processos: DFC, Relatorio Mensal de Resultados
  - Antonio (TI) - processos: RAIVs, Sinistros, Planejamento orcamentario frota
  - Erich (TI) - processos: Planejamento Estrategico TI, Gestao Time TI, Gestao Fornecedores
  - Lucio Torres (Operacoes) - processos: Falhas Power BI, Validacao dados AllStrategy, Formulas/ideias dashboards

## O que muda

1. Ao gerar projetos ou entregas com IA, cada item ja sai com um membro responsavel atribuido
2. O admin pode clicar "Associar Membros com IA" para atribuir responsaveis retroativamente
3. A equipe Inovacao tera todos os 7 projetos e 14 entregas associados aos membros corretos

## Detalhes Tecnicos

### 1. Nova edge function: `associar-membros-skills`

Recebe `equipe_id`, busca projetos/entregas sem responsavel + diagnosticos individuais, envia para IA pedindo associacao membro-item, e atualiza `responsavel_id` nos registros existentes.

O prompt incluira:
- Lista de membros com area, processos e gargalos de cada um
- Lista de projetos e entregas sem responsavel
- Instrucao para associar cada item ao membro mais relevante

Schema de retorno via tool calling:
```text
associacoes: [
  { item_id, item_tipo ("projeto" ou "entrega"), responsavel_nome }
]
```

Apos receber, mapeia `responsavel_nome` para `user_id` e faz UPDATE em `backlog_skills` e `entregas_skills`.

### 2. Atualizar `gerar-projetos-skills`

- Buscar membros + diagnosticos individuais
- Incluir no prompt: quem sao os membros, suas areas e processos
- Adicionar `responsavel_nome` no schema de retorno
- Mapear para `user_id` e preencher `responsavel_id` no insert de `backlog_skills` e `entregas_skills`

### 3. Atualizar `gerar-entregas-skills`

- Buscar diagnosticos individuais dos membros
- Incluir no prompt detalhes de cada membro
- Adicionar `responsavel_nome` no schema de retorno
- Mapear para `user_id` e preencher `responsavel_id` no insert

### 4. Botao "Associar Membros com IA" no admin

Adicionar botao no `SkillsEntregasTab.tsx` que chama a nova edge function. Visivel quando ha itens sem responsavel.

### 5. Executar para equipe Inovacao

Apos deploy da edge function, chamar automaticamente para a equipe `412b0ddd-a38a-4354-86e0-274e892ea9be`.

## Arquivos

**Novos:**
- `supabase/functions/associar-membros-skills/index.ts`

**Modificados:**
- `supabase/functions/gerar-projetos-skills/index.ts` -- adicionar associacao de membros
- `supabase/functions/gerar-entregas-skills/index.ts` -- adicionar associacao de membros
- `src/components/admin/skills/SkillsEntregasTab.tsx` -- botao "Associar Membros com IA"
- `supabase/config.toml` -- registrar nova function
