
# Correção: Entregas não aparecem após geração por IA

## Problema Identificado

As entregas **foram geradas com sucesso** pela IA — existem 14 entregas na tabela `entregas_skills` para a equipe "Inovação". O problema é que a interface não atualizou após a geração por conta de um **bug no cache key**.

No botão "Gerar Entregas com IA", após gerar, o código invalida o cache com a chave:
```text
["entregas-skills-admin", equipeId]
```

Mas o hook `useEntregasSkillsAdmin` usa a chave:
```text
["admin-entregas-skills", equipeId]
```

Como as chaves são diferentes, o React Query não sabe que precisa recarregar os dados, e a tabela continua mostrando "Nenhuma entrega cadastrada".

## Solução

Corrigir a chave de invalidação no `SkillsEntregasTab.tsx` para usar `["admin-entregas-skills"]` em vez de `["entregas-skills-admin"]`.

## Arquivo Modificado

- `src/components/admin/skills/SkillsEntregasTab.tsx` — linha 115: trocar a queryKey de invalidação

## Resultado

Ao clicar "Gerar Entregas com IA" (ou simplesmente recarregar a página agora), as 14 entregas já geradas aparecerão na tabela.
