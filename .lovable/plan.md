

# Typing indicator animado no chat da MarIAna

## Alteração

Substituir o indicador de loading atual (Loader2 + "Pensando...") nas linhas 393-410 por um typing indicator com 3 dots pulsantes.

### `src/index.css` — adicionar keyframe `pulse-dot`
```css
@keyframes pulse-dot {
  0%, 80%, 100% { opacity: 0.3; transform: scale(0.8); }
  40% { opacity: 1; transform: scale(1); }
}
```

### `src/components/shared/MarIAnaChatDrawer.tsx` — linhas 393-410
Substituir o bloco `isLoading && !isStreaming` por:

```tsx
{isLoading && !isStreaming && (
  <div className="flex justify-start">
    <div className="flex gap-2 items-start">
      <img src={mariAvatar} alt="MarIAna" className="w-7 h-7 rounded-full flex-shrink-0"
        onError={(e) => { e.currentTarget.src = mariAvatarFallback; }} />
      <div className="bg-muted rounded-lg px-4 py-3 flex items-center gap-1">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="block w-2 h-2 rounded-full bg-muted-foreground"
            style={{
              animation: 'pulse-dot 1.4s ease-in-out infinite',
              animationDelay: `${i * 0.2}s`,
            }}
          />
        ))}
      </div>
    </div>
  </div>
)}
```

Remover import de `Loader2` se não for usado em outro lugar do arquivo (verificação: não é usado em nenhum outro ponto).

## Arquivos
- **Editados**: `src/index.css` (1 keyframe), `src/components/shared/MarIAnaChatDrawer.tsx` (substituir bloco de loading)

