

# Ajustar cores dos cards em Meu Projeto para a paleta da marca

## Problema
Os StatCards em `ProjetoOverviewCards.tsx` usam cores fora da paleta da marca:
- Sparklines: `#4ade80` (emerald), `#f87171` (red), `#9ca3af` (gray)
- Texto de tendência: `text-emerald-400`, `text-red-400`

## Paleta correta (Brand Book)
- Positivo: `#738925` (Brand 900) ou `#9EB038` (Brand 700)
- Negativo: manter vermelho mas mais discreto, ou usar tom escuro
- Neutro: `rgba(255,255,255,0.5)` (já está sobre fundo escuro)

## Alterações em `src/components/meu-sistema/ProjetoOverviewCards.tsx`

1. **Cores do texto de tendência** (linhas 76-80):
   - `positive` → `text-[#BCC95D]` (Brand 500 — bom contraste sobre fundo escuro)
   - `negative` → `text-[#f87171]` (manter, é funcional para alerta)
   - `neutral` → `text-white/50`

2. **Cores das sparklines** (linhas 82-86):
   - `positive` → `#BCC95D` (Brand 500)
   - `negative` → `#f87171` (manter)
   - `neutral` → `#C8D27B` (Brand 400)

Isso alinha os indicadores positivos e neutros à paleta verde da marca, mantendo o vermelho funcional para alertas.

**1 arquivo editado, 6 valores de cor alterados.**

