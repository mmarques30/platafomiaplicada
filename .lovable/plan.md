
# Ajuste de Proporção do Vídeo na Página Sobre

## Problema Identificado
O vídeo atual está usando a proporção `aspect-video` (16:9 - horizontal), mas o conteúdo do vídeo do YouTube parece ser vertical (estilo Reels/Shorts com proporção 9:16). Isso causa corte nas laterais do vídeo.

## Solução Proposta
Modificar o `CustomVideoPlayer` para aceitar uma proporção customizada e atualizar o `AboutSection` para usar proporção vertical (9:16).

## Alterações Técnicas

### 1. CustomVideoPlayer.tsx
- Adicionar nova prop `aspectRatio` com opções: `"video"` (16:9), `"reels"` (9:16), `"square"` (1:1)
- Aplicar a classe de aspect ratio correta baseada na prop
- Atualizar os estados de erro e loading para também usar a proporção customizada

### 2. about-section.tsx
- Passar `aspectRatio="reels"` para o CustomVideoPlayer
- Ajustar o container do vídeo para acomodar a proporção vertical
- Reduzir a largura máxima do container para que o vídeo vertical não fique muito grande na tela

## Resultado Esperado
O vídeo será exibido na proporção vertical (9:16), semelhante a um Reel do Instagram, sem cortes, mantendo todo o conteúdo visível.

## Classes de Aspect Ratio
- `aspect-video` = 16/9 (horizontal padrão)
- `aspect-[9/16]` = 9/16 (vertical Reels)
- `aspect-square` = 1/1 (quadrado)
