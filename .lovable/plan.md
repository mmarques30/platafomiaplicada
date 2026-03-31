
# Banner de dados fictícios no BusinessROIChart

## Resumo
Quando `!contrato?.data_inicio` (sem dados reais), exibir o gráfico com opacidade 40% e um banner sobreposto avisando que são dados de exemplo.

## Alteração

**Arquivo: `src/components/mentoria/BusinessROIChart.tsx`**

1. Adicionar flag `const isDadosFicticios = !contrato?.data_inicio`
2. Importar `Info` do lucide-react
3. Envolver o `ChartContainer` + legenda em um `div` com `position: relative`
4. Quando `isDadosFicticios`:
   - Aplicar `opacity-40` no chart + legenda
   - Sobrepor um banner centralizado (position absolute, z-10) com:
     - Fundo: `bg-zinc-900/90 border border-[#E8A43C]/50 rounded-xl`
     - Ícone `Info` âmbar + texto: "Este é um exemplo do que você verá quando seu projeto iniciar. Os dados reais serão inseridos pela sua mentora."
     - Texto centralizado, max-w limitado

## Detalhe técnico
- Nenhuma tabela nova, nenhuma query nova — apenas condicional no JSX baseada no `contrato` já carregado
- 1 arquivo editado
