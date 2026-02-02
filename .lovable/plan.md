
# Plano: Corrigir Layout dos Cards de Vídeo para Formato Reels

## Problema Identificado
Os cards de vídeos nas trilhas (seção "Gravações Aulas Semanais") estão aparecendo com formato quadrado ao invés do formato vertical reels (9:16). Isso está acontecendo porque o componente `VideoCardVertical` tem restrições de altura máxima (`max-h-*`) que interferem com a proporção `aspect-[9/16]`.

## Comparação
| Componente | Implementação | Resultado |
|------------|--------------|-----------|
| `TrilhaCardBloqueavel` | Apenas `aspect-[9/16]` | ✅ Formato reels correto |
| `VideoCardVertical` | `aspect-[9/16]` + `max-h-[220px/260px/310px]` | ❌ Formato distorcido |

## Solução
Remover as restrições de `max-h` do `VideoCardVertical` para que o aspect-ratio 9/16 seja respeitado naturalmente, assim como funciona no `TrilhaCardBloqueavel`.

---

## Detalhes Técnicos

### Arquivo: `src/components/shared/VideoCardVertical.tsx`

**Mudança:**
- Remover `max-h-[220px] sm:max-h-[260px] md:max-h-[310px]` da div do card
- Manter apenas `aspect-[9/16]` para garantir a proporção vertical reels

**De:**
```tsx
<div className="overflow-hidden rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 relative w-full bg-neutral-800 aspect-[9/16] max-h-[220px] sm:max-h-[260px] md:max-h-[310px]">
```

**Para:**
```tsx
<div className="overflow-hidden rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 relative w-full bg-neutral-800 aspect-[9/16]">
```

---

## Impacto
- **TrilhaCarousel** (Academy, Skills, Business): Cards voltarão ao formato reels vertical
- **VideosVisitante**: Mantém o mesmo comportamento pois usa o mesmo componente

O tamanho final dos cards será determinado pela largura do container (`basis-2/5`, `basis-1/3`, etc. do carousel), e a altura será calculada automaticamente para manter a proporção 9:16.
