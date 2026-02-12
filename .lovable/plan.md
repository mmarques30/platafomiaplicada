

# Corrigir Erro ao Consolidar Diagnosticos

## Problema

A edge function `consolidar-diagnosticos-skills` faz esta query:

```
.select("*, profiles:user_id(nome_completo, cargo)")
```

A tabela `profiles` nao tem coluna `cargo`. O campo `cargo` ja existe na propria tabela `diagnosticos_skills` (preenchido no formulario), entao nao precisa buscar do profiles.

## Solucao

### Arquivo: `supabase/functions/consolidar-diagnosticos-skills/index.ts`

Remover `cargo` do join com profiles:

```typescript
// ANTES:
.select("*, profiles:user_id(nome_completo, cargo)")

// DEPOIS:
.select("*, profiles:user_id(nome_completo)")
```

O campo `cargo` ja e acessado corretamente via `d.cargo` no mapeamento do `resumoDiagnosticos` (linha que ja existe no codigo). Nenhuma outra alteracao necessaria.

## Resultado

O botao "Consolidar Diagnosticos" executara a edge function sem erro, gerando o diagnostico consolidado da equipe via IA.

