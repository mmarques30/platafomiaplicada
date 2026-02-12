
# Corrigir Geracao de Projetos com IA (backlog_skills)

## Problema Raiz

A edge function `gerar-projetos-skills` insere projetos com `status: "backlog"`, mas a tabela `backlog_skills` tem uma constraint CHECK que so permite os valores: `levantado`, `priorizado`, `em_execucao`, `entregue`.

Resultado: o INSERT falha silenciosamente (o erro nao e verificado na linha 88), a funcao retorna `projetos_criados: 7` sem erro, mas nenhum dado e salvo no banco.

## Solucao

### Arquivo: `supabase/functions/gerar-projetos-skills/index.ts`

Duas correcoes:

1. Mudar `status: "backlog"` para `status: "levantado"` (valor valido na constraint)
2. Verificar o erro do INSERT para nao retornar sucesso falso

```typescript
// ANTES (linha 83):
status: "backlog",

// DEPOIS:
status: "levantado",

// ANTES (linha 88):
await supabase.from("backlog_skills").insert(inserts);

// DEPOIS:
const { error: insertError } = await supabase.from("backlog_skills").insert(inserts);
if (insertError) throw new Error("Erro ao salvar projetos: " + insertError.message);
```

## Resultado

Os projetos gerados pela IA serao corretamente salvos na tabela `backlog_skills` com status `levantado` e aparecerao na lista de Projetos Mapeados.
