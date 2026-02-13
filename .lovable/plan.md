

# Unificar Cards do PortfolioOverview para Estilo Verde (Accent)

## Problema

Na aba "Acompanhamento" da pagina Projetos, os cards do PortfolioOverview alternam entre preto e verde. O usuario quer que todos usem o mesmo estilo verde (accent) para manter consistencia visual com o card de "Progresso Geral" ao lado.

## Solucao

No arquivo `src/components/skills/kanban/PortfolioOverview.tsx`:

1. **KPI cards (linhas 40-44)**: Mudar todos os `variant` de `"dark"` para `"accent"`
2. **Distribuicao por tipo (linhas 47-51)**: Mudar todos os `variant` de `"dark"` para `"accent"`
3. **Remover `darkCard`** (linha 53) ja que nao sera mais usado

Todos os cards passam a usar o estilo:
- Fundo: `bg-[#9EB038]/15`
- Borda: `border-[#9EB038]/30` com `border-l-4 border-l-[#9EB038]`
- Label: `text-[#3a3a3a]`
- Valor: `text-[#0D0D0D]`

## Arquivo Modificado

- `src/components/skills/kanban/PortfolioOverview.tsx`

