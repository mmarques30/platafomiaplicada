

# Corrigir formato dos cards de Trilhas para Reels (9:16)

## Problema

O componente `TrilhaCard` usa alturas fixas (`h-[300px] sm:h-[350px] md:h-[440px]`) sem restringir a largura, fazendo os cards ficarem largos demais. Enquanto isso, o `TrilhaCardBloqueavel` ja usa `aspect-[9/16]` corretamente.

## Solucao

Substituir as classes de altura fixa no `TrilhaCard` por `aspect-[9/16]`, igualando ao formato Reels do `TrilhaCardBloqueavel`. Isso mantém a altura proporcional (cards altos) e restringe a largura automaticamente.

## Alteracao

### Arquivo: `src/components/shared/TrilhaCard.tsx` (linha 21)

**De:**
```
h-[300px] sm:h-[350px] md:h-[440px] w-full
```

**Para:**
```
w-full aspect-[9/16]
```

Isso garante o formato vertical Reels sem reduzir a altura -- a altura sera proporcional a largura do card no carousel.

