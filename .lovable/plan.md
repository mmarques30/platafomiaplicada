

# Estilizar filtros de Trilhas com visual discreto na cor verde da marca

## Problema

Os filtros de ordenacao e classificacao em "Trilhas de Aprendizado" usam o estilo padrao dos selects (borda cinza, fundo branco), sem integracao visual com a identidade verde da marca. O usuario quer filtros discretos, elegantes, com a cor primaria (verde) aplicada de forma sutil.

## Solucao

Estilizar os dois `SelectTrigger` e `SelectContent` com tons suaves de verde (usando `primary/10`, `primary/20`, `primary` do design system), mantendo-os compactos e discretos.

## Alteracoes

### Arquivo: `src/components/dashboard/TodasAsTrilhas.tsx`

**SelectTrigger (linhas 118 e 129):**
- Aplicar fundo `bg-primary/5` com borda `border-primary/20`
- Texto em `text-primary/80` para manter discreto
- Hover com `hover:bg-primary/10 hover:border-primary/30`
- Reduzir altura para `h-9` e texto para `text-xs` para ficarem mais compactos
- Adicionar `rounded-full` para visual de pill/badge

**SelectContent (linhas 121 e 132):**
- Fundo solido `bg-background` com borda `border-primary/20`
- Items com `focus:bg-primary/10 focus:text-primary` no hover

**Resultado visual:**
- Filtros aparecem como pills verdes sutis, integrados ao branding
- Ao abrir, o dropdown mostra opcoes com highlight verde discreto
- Compactos e nao competem visualmente com os cards de trilha

