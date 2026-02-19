
# Remover Filtros "Todos" Duplicados

## Problema
O componente `FilterBar` ja adiciona automaticamente uma opcao "ver todos" usando o `placeholder` do filtro (com valor `__all__`). Porem, cada aba (TrilhasTab, ModulosTab, VideosTab) tambem inclui manualmente uma opcao "Todos/Todas" dentro do array `options`, resultando em duas opcoes de reset duplicadas em cada dropdown.

## Solucao
Remover as opcoes manuais de "Todos/Todas" do array `options` de cada filtro nas 3 abas. O `FilterBar` ja cuida disso automaticamente.

## Detalhes tecnicos

### Arquivo: `src/components/admin/content/TrilhasTab.tsx`
Remover estas linhas dos arrays de options:
- Linha 87: `{ value: 'todas', label: 'Todas as categorias' }`
- Linha 101: `{ value: 'todos', label: 'Todos os niveis' }`
- Linha 114: `{ value: 'todos', label: 'Todos os status' }`
- E o equivalente no filtro de visibilidade

### Arquivo: `src/components/admin/content/ModulosTab.tsx`
Remover:
- Linha 73: `{ value: 'todas', label: 'Todas as trilhas' }`
- Linha 84: `{ value: 'todas', label: 'Todas as categorias' }`
- Linha 98: `{ value: 'todos', label: 'Todos os status' }`
- E o equivalente no filtro de visibilidade

### Arquivo: `src/components/admin/content/VideosTab.tsx`
Remover:
- Linha 96: `{ value: 'todas', label: 'Todas as trilhas' }`
- Linha 107: `{ value: 'todos', label: 'Todos os modulos' }`
- Linha 118: `{ value: 'todos', label: 'Todos os status' }`
- E o equivalente no filtro de visibilidade

### Impacto
Nenhuma mudanca de logica. O `FilterBar` continuara exibindo a opcao de reset usando o `placeholder` de cada filtro e o valor `__all__`, que ja mapeia corretamente para string vazia no estado.
