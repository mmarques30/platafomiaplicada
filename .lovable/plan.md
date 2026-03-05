

# Corrigir contraste do RoadMap Timeline

## Problema
O fundo `brand[500]` (#BCC95D) e os cards internos `brand[400]60` (#C8D27B com 37% opacidade) sao tons de verde muito proximos, tornando tudo indistinguivel.

## Solucao
Aumentar o contraste usando tons mais claros da propria paleta da marca:

1. **Fundo do card principal**: Trocar de `brand[500]` para `brand[100]` (#F6F7E9 - off-white da marca) - fundo claro e limpo
2. **Cards internos de cada etapa**: Usar `white` com borda sutil em `brand[300]` - destaque claro sobre o fundo off-white
3. **Barra de progresso geral**: Manter `brand[900]` (#738925) sobre fundo `brand[200]` (#E9EBC6) - contraste forte
4. **Track line e beam**: Usar `brand[300]` para a track e `brand[700]` para o beam animado
5. **Dots de status**: Manter as cores atuais (ja usam brand[900]/[800]) que terao mais destaque no fundo claro
6. **Barras de progresso por etapa**: Track em `brand[200]`, preenchimento em `brand[900]`
7. **Hover nos cards**: `brand[200]` como background no hover

1 arquivo editado: `TimelineEtapas.tsx`

