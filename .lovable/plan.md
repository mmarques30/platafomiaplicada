
# Tornar "Área Impactada" editável no Modal de Detalhes

## Situação atual
O campo "Área Impactada" é exibido como texto fixo no `ProjetoDetailModal.tsx`. Só pode ser definido na criação do projeto.

## Alteração

### `ProjetoDetailModal.tsx`
- Substituir o texto estático por um `Input` editável (similar ao campo de observações)
- Usar estado local + auto-save no `onBlur` para persistir a alteração via `onUpdate(item.id, { area_impactada: valor })`
- Quando `onUpdate` não estiver disponível (modo leitura), manter o texto estático atual

### Correção de build
- Investigar e corrigir o erro `mux-embed` workspace dependency (não encontrado no `package.json` principal, pode estar em outro arquivo de configuração)

## Resumo

| Arquivo | Alteração |
|---|---|
| `ProjetoDetailModal.tsx` | Campo `Input` editável para área impactada com auto-save |
