

# Filtros no Backlog de Projetos

## Objetivo
Adicionar filtros inline (discretos, sem card de fundo) no BacklogView para filtrar projetos por **responsavel**, **prioridade** e **area impactada**. Seguindo o padrao visual ja existente em `FilterSelect.tsx`.

## Abordagem

Toda a filtragem sera feita no frontend (client-side), pois os dados ja estao carregados pelo hook. Nao requer mudancas no banco de dados.

### Alteracao em `BacklogView.tsx`

1. Adicionar 3 estados de filtro: `filtroResponsavel`, `filtroPrioridade`, `filtroArea`
2. Extrair opcoes dinamicamente dos items carregados (valores unicos de responsavel, prioridade, area_impactada)
3. Cada filtro tera uma opcao "Todos" para limpar
4. Filtrar os items antes de passar para `BacklogKanban` e `BacklogTable`
5. Renderizar os 3 selects inline abaixo do header, usando o mesmo estilo do `FilterSelect` (h-8, text-xs, bg-transparent, sem labels externos)

### Layout dos filtros

```
[Backlog de Projetos]                    [+ Novo Projeto] [Kanban|Tabela]
[Responsavel v] [Prioridade v] [Area v]
```

Os filtros ficam em uma linha entre o header e o conteudo, compactos e discretos conforme o padrao do projeto.

## Detalhes tecnicos

**Arquivo modificado:** `src/components/skills/backlog/BacklogView.tsx`

- Importar `Select, SelectContent, SelectItem, SelectTrigger, SelectValue` de `@/components/ui/select`
- Criar 3 estados com `useState<string>("todos")`
- Calcular opcoes unicas com `useMemo` a partir de `items`:
  - Responsaveis: nomes unicos dos items com responsavel
  - Prioridades: valores unicos (alta, media, baixa)
  - Areas: valores unicos de area_impactada
- Criar `filteredItems` com `useMemo` aplicando os 3 filtros
- Passar `filteredItems` para `BacklogKanban` e `BacklogTable` em vez de `items`
- 3 selects inline com `w-[160px] h-8 text-xs bg-transparent border-border/50`

Nenhum outro arquivo precisa ser alterado.

