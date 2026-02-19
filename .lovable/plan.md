

# Corrigir Edicao de Categoria da Trilha

## Problema
O campo de categoria usa o componente `CommandInput` do cmdk com `value` e `onValueChange` controlados. Isso causa conflito com o filtro interno do cmdk, impedindo a selecao de categorias existentes e a digitacao de novas.

## Solucao
Substituir o combobox complexo (Command/Popover) por um `Select` simples com opcoes pre-definidas, mais um campo de texto para categoria customizada. Isso garante que:
- As categorias existentes no banco aparecem como opcoes selecionaveis
- E possivel digitar uma categoria nova
- Funciona tanto na criacao quanto na edicao

## Detalhes tecnicos

### Arquivo: `src/components/admin/content/TrilhaModal.tsx`

**Remover**: o bloco Popover/Command (linhas 240-302) que usa cmdk para o campo de categoria.

**Substituir por**: um `Select` padrao do Radix com as categorias carregadas do banco, mais uma opcao "Outra..." que revela um `Input` de texto para digitar uma nova categoria.

Logica:
1. Se o usuario seleciona uma categoria existente no `Select`, o valor e aplicado diretamente
2. Se seleciona "Outra...", aparece um `Input` para digitar o nome da nova categoria
3. Na edicao, o `Select` mostra a categoria atual (se existir na lista) ou mostra "Outra..." com o input preenchido

**Remover imports nao mais necessarios**: `Command`, `CommandEmpty`, `CommandGroup`, `CommandInput`, `CommandItem`, `ChevronsUpDown`, `cn` (se nao usado em outro lugar).

**Manter**: o state `selectedCategoria`, `categorias`, `loadingCategorias` e a funcao `fetchCategorias` -- apenas mudar como sao usados no JSX.

