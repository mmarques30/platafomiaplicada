
# Correção do Player de Vídeo na Página Sobre

## Problemas Identificados

1. **Card do vídeo muito pequeno**: A largura máxima está limitada a 280-320px, tornando o vídeo difícil de visualizar
2. **API incorreta do ReactPlayer**: O componente usa `src` ao invés de `url`, causando falha no carregamento
3. **Controle de tempo incorreto**: Está usando `onTimeUpdate` (evento de video nativo) ao invés de `onProgress` (evento do react-player)

## Alterações Técnicas

### 1. SimpleVideoPlayer.tsx
- Corrigir prop `src` para `url` (API correta do react-player)
- Substituir `onTimeUpdate` por `onProgress` com tipagem correta
- Usar interface `OnProgressProps` do react-player para controle de tempo

### 2. about-section.tsx
- Aumentar a largura máxima do container do vídeo de `max-w-[280px] md:max-w-[320px]` para `max-w-[320px] md:max-w-[380px]`
- Isso dará mais espaço para o vídeo vertical ser exibido adequadamente

## Código das Correções

### SimpleVideoPlayer.tsx - Mudanças principais:
```tsx
// Interface de progresso do react-player
interface ProgressState {
  playedSeconds: number;
}

// Substituir handleTimeUpdate por:
const handleProgress = useCallback((state: ProgressState) => {
  if (endSeconds && state.playedSeconds >= endSeconds) {
    setIsPlaying(false);
    if (onEnded) {
      onEnded();
    }
  }
}, [endSeconds, onEnded]);

// No ReactPlayer, corrigir:
<ReactPlayer
  url={videoUrl}  // era "src"
  onProgress={handleProgress}  // era "onTimeUpdate"
  // ... demais props
/>
```

### about-section.tsx - Mudança no container:
```tsx
className="w-full max-w-[320px] md:max-w-[380px] shadow-2xl..."
```

## Resultado Esperado
- O vídeo carregará corretamente
- O player terá tamanho adequado para o formato vertical (Reels)
- O vídeo parará automaticamente no tempo 3:26 (206 segundos)
