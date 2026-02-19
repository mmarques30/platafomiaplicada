
# Adicionar opcao "Todos" nos filtros do FilterBar

## Problema
Nos filtros do `FilterBar` (usado em Prompts e outros), ao selecionar um valor como "Intermediario", nao ha como voltar a ver todos os itens porque falta uma opcao de reset ("Todos") no dropdown.

## Solucao
Adicionar automaticamente uma opcao "Todos" (usando o texto do `placeholder`) como primeiro item de cada `Select` no `FilterBar`, com valor vazio (`""`), permitindo limpar o filtro.

## Mudanca

### `src/components/admin/content/FilterBar.tsx`
- Dentro do `SelectContent`, antes do map de `filter.options`, adicionar:
  ```
  <SelectItem value="__all__">placeholder do filtro (ex: "Todos os niveis")</SelectItem>
  ```
- No `onValueChange`, converter `"__all__"` para `""` (string vazia) para manter compatibilidade com a logica existente de filtragem

Obs: Usar `"__all__"` como valor porque o Radix Select nao aceita string vazia como value de um `SelectItem`.

## Arquivo modificado
1. `src/components/admin/content/FilterBar.tsx`
