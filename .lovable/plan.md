
# Remover Cards de KPI da Pagina de Projetos

## O que sera feito

Remover os 4 cards de resumo (Horas Economizadas, ROI Acumulado, Entregas, Semana Atual) que aparecem na aba "Acompanhamento" da pagina de Projetos. Esses KPIs ja estao disponiveis no Painel Lider e sao redundantes aqui.

## Alteracao

### Arquivo: `src/pages/skills/ProjetoSkillsProjetosPage.tsx`

- Remover a linha `<ResumoPerformanceCards />` (linha 45)
- Remover o import do componente `ResumoPerformanceCards` (linha 7)

A aba "Acompanhamento" ficara apenas com o `PortfolioOverview` e o grafico `EntregasProjetadasVsExecutadasChart`.
