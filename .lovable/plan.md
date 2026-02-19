
# Ajuste de cores nos KPIs do Painel do Lider

## Resumo

Duas alteracoes no `KPICard.tsx`:

1. **Variante `accent`** (KPIs com fundo verde claro e borda lateral): os textos voltam para preto, como estavam antes
2. **Variante `dark`** (cards completamente verdes): o fundo verde fica mais opaco/suave

## Alteracoes no arquivo `src/components/skills/performance/KPICard.tsx`

### Variante `accent` - textos voltam para preto

| Propriedade | Atual | Novo |
|---|---|---|
| `title` | `text-[#6B7A20]` | `text-foreground` |
| `value` | `text-[#4A5516]` | `text-foreground` |
| `subtitle` | `text-[#6B7A20]/70` | `text-muted-foreground` |
| `trend` | `text-[#5a6a1a]` | `text-foreground` |

### Variante `dark` - verde mais opaco

| Propriedade | Atual | Novo |
|---|---|---|
| `card` | `bg-[#4A5516] border-[#4A5516]` | `bg-[#4A5516]/80 border-[#4A5516]/80` |

A opacidade de 80% suaviza o verde escuro mantendo o contraste com texto branco.

### Arquivo unico alterado

| Arquivo | Alteracao |
|---|---|
| `KPICard.tsx` | Textos accent para preto padrao, fundo dark com opacidade 80% |
