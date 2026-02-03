

# Diagnóstico: Imagens Lentas para Carregar

## O Que Está Acontecendo

As imagens estão demorando para carregar por **duas razões principais**:

### 1. Imagens de Ambientes (Locais)

As imagens `env-*.jpg` estão em `src/assets/` e são importadas via ES6:

```tsx
// EnvironmentSelector.tsx
import envBusinessImage from "@/assets/env-business.jpg";
import envSkillsImage from "@/assets/env-skills.jpg";
import envAcademyImage from "@/assets/env-academy.jpg";
import envGratuitoImage from "@/assets/env-gratuito.jpg";
```

**Problema**: Arquivos JPG grandes (provavelmente > 200KB cada) sem otimização de carregamento. O navegador precisa baixar todos antes de renderizar.

### 2. Imagens de Trilhas (Supabase Storage)

As URLs vêm do banco de dados:
```
https://ocwpsanqtfubixerjive.supabase.co/storage/v1/object/public/trilhas-imagens/0.379...png
```

**Problema**: Imagens PNG armazenadas sem otimização (podem ser > 500KB cada).

---

## Causas Raiz

| Fonte | Problema | Impacto |
|-------|----------|---------|
| Ambientes (locais) | JPGs grandes, sem preload | ~1-2s para carregar cada |
| Trilhas (Supabase) | PNGs não otimizados, sem CDN com resize | ~2-4s para carregar cada |
| PWA Cache | StaleWhileRevalidate para imagens | Primeiro acesso é lento |

---

## Solução Proposta

### A. Para Imagens de Ambientes (Efeito Imediato)

1. **Adicionar preload** das imagens críticas no `EnvironmentSelector.tsx`
2. **Usar placeholder blur** enquanto carrega (shimmer effect)
3. **Converter para WebP** se possível (menor tamanho)

### B. Para Imagens de Trilhas (Otimização)

1. **Adicionar skeleton/placeholder** durante carregamento
2. **Implementar progressive loading** com blur
3. **Usar `fetchpriority="high"`** para imagens acima do fold

### C. Para PWA Cache (Configuração)

1. **Mudar estratégia** de `StaleWhileRevalidate` para `CacheFirst` com fallback
2. **Pre-cache** imagens críticas

---

## Implementação Detalhada

### Arquivo 1: `src/pages/EnvironmentSelector.tsx`

Adicionar preload e estados de loading:

```tsx
// Adicionar preload via link no useEffect
useEffect(() => {
  const images = [envBusinessImage, envSkillsImage, envAcademyImage, envGratuitoImage];
  images.forEach(src => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = src;
    document.head.appendChild(link);
  });
}, []);
```

Adicionar skeleton enquanto imagem não carrega:

```tsx
<div className="relative w-40 h-40">
  {!imageLoaded && (
    <div className="absolute inset-0 bg-white/5 animate-pulse rounded-3xl" />
  )}
  <img
    src={ENVIRONMENT_IMAGES[env]}
    alt={config.label}
    onLoad={() => setImageLoaded(true)}
    className={cn(
      "w-full h-full object-cover transition-opacity duration-300",
      imageLoaded ? "opacity-100" : "opacity-0"
    )}
  />
</div>
```

### Arquivo 2: `src/components/shared/TrilhaCard.tsx`

Adicionar skeleton e progressive loading:

```tsx
import { useState } from "react";

export function TrilhaCard({ id, titulo, imagem_url, visivel_apenas_pro }: TrilhaCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <Link to={`/trilhas/${id}`} className="block group">
      <div className="overflow-hidden rounded-xl shadow-md ...">
        {/* Skeleton enquanto carrega */}
        {!imageLoaded && (
          <div className="absolute inset-0 bg-muted animate-pulse" />
        )}
        <img
          src={imagem_url || "/placeholder.svg"}
          alt={titulo}
          loading="lazy"
          onLoad={() => setImageLoaded(true)}
          className={cn(
            "block w-full h-full object-cover ...",
            imageLoaded ? "opacity-100" : "opacity-0"
          )}
        />
        ...
      </div>
    </Link>
  );
}
```

### Arquivo 3: Criar `src/components/shared/OptimizedImage.tsx`

Componente reutilizável para todas as imagens:

```tsx
interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
}

export function OptimizedImage({ src, alt, className, priority = false }: OptimizedImageProps) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  return (
    <div className="relative w-full h-full">
      {!loaded && !error && (
        <div className="absolute inset-0 bg-muted animate-pulse" />
      )}
      <img
        src={error ? "/placeholder.svg" : src}
        alt={alt}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : "auto"}
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
        className={cn(
          "transition-opacity duration-300",
          loaded ? "opacity-100" : "opacity-0",
          className
        )}
      />
    </div>
  );
}
```

### Arquivo 4: `vite.config.ts`

Ajustar cache de imagens para CacheFirst:

```ts
{
  urlPattern: /\.(png|jpg|jpeg|svg|gif|webp)$/,
  handler: 'CacheFirst',  // Mudança: era StaleWhileRevalidate
  options: {
    cacheName: 'images-cache-v11',
    expiration: {
      maxEntries: 200,
      maxAgeSeconds: 7 * 24 * 60 * 60 // 7 dias
    }
  }
}
```

---

## Resumo das Alterações

| Arquivo | Alteração |
|---------|-----------|
| `EnvironmentSelector.tsx` | Preload + skeleton + fade-in |
| `TrilhaCard.tsx` | Skeleton + fade-in |
| `TrilhaCardBloqueavel.tsx` | Skeleton + fade-in |
| `VideoCardVertical.tsx` | Skeleton + fade-in |
| `ModuloCard.tsx` | Skeleton + fade-in |
| Novo: `OptimizedImage.tsx` | Componente reutilizável |
| `vite.config.ts` | Cache strategy para CacheFirst |

---

## Resultado Esperado

- **Primeira visita**: Skeleton/shimmer visível enquanto carrega (UX melhorada)
- **Visitas seguintes**: Imagens carregam instantaneamente do cache
- **Experiência geral**: Transições suaves com fade-in

