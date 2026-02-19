
# Corrigir Atribuicao de Projetos por Diagnostico de Origem

## Problema
A edge function `gerar-projetos-skills` tem dois problemas criticos:

1. **O resumo enviado a IA nao identifica quem reportou cada dor** - os diagnosticos sao enviados como lista anonima, sem `user_id` ou nome do membro
2. **A atribuicao e round-robin cega** - projetos sao distribuidos na ordem `membrosIds[0], membrosIds[1], membrosIds[0]...` sem relacao com quem relatou o problema

Resultado: um membro que relatou "gargalo no financeiro" pode receber um projeto de "automacao de RH" que veio do diagnostico de outro membro.

## Solucao

Alterar a edge function para:

1. Incluir a identificacao do membro (user_id + nome) em cada diagnostico enviado a IA
2. Pedir a IA que indique quais membros sao os mais adequados para cada projeto (baseado em quem relatou a dor)
3. Usar a sugestao da IA para atribuir o `responsavel_id`, em vez de round-robin

## Mudancas na Edge Function `gerar-projetos-skills/index.ts`

### 1. Buscar nomes dos membros
Apos buscar os membros ativos, buscar tambem os nomes na tabela `profiles`:
```text
membros_equipe_skills (user_id) -> profiles (nome_completo)
```

### 2. Enriquecer o resumo com identificacao
O resumo enviado a IA passara a incluir um identificador por membro:
```text
Antes:  { processos, gargalos, economia, area }
Depois: { membro_id, nome, processos, gargalos, economia, area }
```

### 3. Alterar o prompt da IA
Adicionar instrucao para que a IA sugira o `membro_id` mais adequado para cada projeto, baseado em quem reportou as dores relacionadas:

```text
REGRA NOVA: Para cada projeto, indique o "membro_id" do membro que
reportou a dor mais relacionada ao projeto. Se o projeto combina dores
de multiplos membros, escolha o que tem maior afinidade com a area.
```

### 4. Alterar o schema da tool call
Adicionar campo `responsavel_membro_id` (string) ao schema do projeto retornado pela IA.

### 5. Substituir round-robin por atribuicao inteligente
Na montagem dos inserts:
```text
Antes:  responsavel_id: membrosIds[i % membrosIds.length]
Depois: responsavel_id: projetoIA.responsavel_membro_id (validado contra membrosIds)
         fallback: membrosIds[0] se o ID sugerido nao for valido
```

A mesma logica se aplica a criacao automatica de entregas.

## Arquivos Modificados
1. `supabase/functions/gerar-projetos-skills/index.ts` - toda a logica descrita acima
