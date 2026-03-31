

# Unificar estilos de cards na área /mentoria

## Resumo
Padronizar todos os cards para `bg-card border-border` removendo gradientes, cores verdes e opacidades parciais.

## Alterações

### 1. `BusinessEvolucaoAprendizado.tsx`
- Linhas 65, 114, 132, 150: trocar `border-aplicada-green-300 bg-aplicada-green-100` por `border-border bg-card`
- Linha 169: trocar `border-border/50 bg-card/50 backdrop-blur-sm` por `border-border bg-card`

### 2. `BusinessProgressoConteudo.tsx`
- Linhas 16, 27: trocar `border-primary/20` por `border-border bg-card`
- Linha 73: trocar `border-primary/20 bg-gradient-to-br from-blue-500/5 to-transparent` por `border-border bg-card`
- Linha 103: trocar `border-primary/20 bg-gradient-to-br from-green-500/5 to-transparent` por `border-border bg-card`
- Linha 131: trocar `border-primary/20 bg-gradient-to-br from-purple-500/5 to-transparent` por `border-border bg-card`
- Linha 151: trocar `border-primary/20` por `border-border bg-card`

### 3. `BusinessROIChart.tsx`
- Linha 108: trocar `border-border/50 bg-card/50 backdrop-blur-sm` por `border-border bg-card`

### 4. `BusinessReportsCard.tsx`
- Linhas 19, 32, 66: trocar `border-border/50 bg-card/50` por `border-border bg-card`

## Resultado
Todos os cards usam `bg-card border-border` — consistente no light e dark mode, sem gradientes ou cores custom.

