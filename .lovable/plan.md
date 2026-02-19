
# Aumentar tamanho dos cards de video na visao gratuita (formato Reels)

## Problema

Os cards de video em `VideosVisitante` estao muito pequenos porque o grid usa ate 6 colunas (`grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6`), tornando cada card estreito.

## Solucao

Reduzir o numero de colunas no grid de `VideosVisitante.tsx` para que cada card fique maior, simulando o formato Reels. O aspect ratio 9/16 ja esta correto no `VideoCardVertical`, entao basta ajustar o grid.

### Alteracao em `src/components/dashboard/VideosVisitante.tsx`

Trocar o grid de:
```
grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6
```

Para:
```
grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4
```

Isso se aplica tanto no grid principal (linha 49) quanto no skeleton de loading (linha 30). Com menos colunas, cada card ocupa mais espaco e fica visualmente no formato Reels.

Ajustar tambem a altura do skeleton para refletir o novo tamanho: `h-[240px] sm:h-[320px] md:h-[400px]`.

Nenhuma alteracao no `VideoCardVertical` -- o componente ja usa `aspect-[9/16]`, que e exatamente o formato Reels.
