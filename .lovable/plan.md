

# Gerar Entregas com IA a partir dos Projetos Mapeados

## Objetivo

Criar um botao "Gerar Entregas com IA" na aba Entregas do Mentoria Skills que analisa os projetos do `backlog_skills` e gera automaticamente entregas detalhadas na tabela `entregas_skills`, permitindo que a equipe comece a executar os projetos imediatamente.

## Como vai funcionar

1. O admin seleciona uma equipe e vai na aba "Entregas"
2. Clica em "Gerar Entregas com IA"
3. A IA analisa todos os projetos mapeados (backlog_skills) da equipe
4. Para cada projeto, a IA gera 1 a 3 entregas praticas com titulo, descricao, instrucoes, tipo, prioridade, economia estimada e prazo sugerido
5. As entregas sao salvas na tabela `entregas_skills` vinculadas ao projeto de origem (`backlog_item_id`)
6. A lista de entregas e atualizada automaticamente

## Solucao Tecnica

### 1. Nova Edge Function: `gerar-entregas-skills`

**Arquivo:** `supabase/functions/gerar-entregas-skills/index.ts`

Logica:
- Recebe `equipe_id`
- Busca projetos do `backlog_skills` da equipe
- Busca membros da equipe (`membros_equipe_skills`) para distribuir responsaveis
- Envia para a IA (Lovable AI Gateway, modelo `google/gemini-2.5-flash`) pedindo entregas praticas
- Usa tool calling para estruturar a resposta com campos: titulo, descricao, instrucoes, tipo (individual/colaborativo/sistema), prioridade (P1/P2/P3), economia_horas_semana, prazo_dias
- Insere as entregas na tabela `entregas_skills` com `backlog_item_id` preenchido, status "pendente"
- Retorna quantidade de entregas criadas

Campos da entrega gerada:
- `equipe_id` — da equipe
- `backlog_item_id` — vinculo com o projeto de origem
- `titulo` — titulo da entrega
- `descricao` — o que precisa ser feito
- `instrucoes` — passo a passo detalhado
- `tipo` — individual, colaborativo ou sistema
- `prioridade` — P1, P2 ou P3
- `economia_horas_semana` — estimativa de horas economizadas
- `status` — "pendente"
- `prazo` — data calculada (hoje + prazo_dias sugerido pela IA)

### 2. Atualizar `SkillsEntregasTab.tsx`

**Arquivo:** `src/components/admin/skills/SkillsEntregasTab.tsx`

Adicionar:
- Botao "Gerar Entregas com IA" ao lado do "Nova Entrega"
- Verificacao de pre-requisito: so habilitar se existirem projetos no backlog
- Indicador de status (quantos projetos existem)
- Estado de loading durante a geracao
- Invalidacao do cache apos sucesso

### 3. Registrar no `config.toml`

Adicionar a nova funcao `gerar-entregas-skills` com `verify_jwt = false`.

## Fluxo da IA

```text
Entrada para a IA:
  - Lista de projetos (titulo, descricao, area_impactada, prioridade, horas_estimadas)
  - Lista de membros da equipe (nome, cargo)

Saida esperada (via tool calling):
  - Array de entregas, cada uma com:
    - projeto_titulo (para vincular)
    - titulo da entrega
    - descricao
    - instrucoes (passo a passo)
    - tipo: individual | colaborativo | sistema
    - prioridade: P1 | P2 | P3
    - economia_horas_semana: number
    - prazo_dias: number (dias a partir de hoje)
```

## Arquivos

**Novos:**
- `supabase/functions/gerar-entregas-skills/index.ts`

**Modificados:**
- `src/components/admin/skills/SkillsEntregasTab.tsx` — botao + logica de geracao
- `supabase/config.toml` — registrar nova funcao

