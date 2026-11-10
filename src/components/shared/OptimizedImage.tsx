import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
  fallback?: string;
}

/**
 * Imagem com esmaecida de entrada e troca para o fallback quando falha.
 *
 * Tinha um defeito que só aparece com a imagem em cache: o componente só
 * mostrava a foto depois do evento `load`, e uma imagem já em cache dispara
 * esse evento antes de o React pendurar o ouvinte. O `onLoad` nunca chegava,
 * `loaded` ficava falso e a foto ficava em `opacity-0` para sempre — presente
 * no HTML, invisível na tela. Era pior na segunda visita à mesma página, que
 * é justamente quando a imagem está em cache.
 *
 * A correção é perguntar ao próprio elemento, na montagem, se ele já
 * terminou de carregar (`img.complete`), em vez de esperar um evento que já
 * passou.
 */
export function OptimizedImage({
  src,
  alt,
  className,
  priority = false,
  fallback = "/placeholder.svg",
}: OptimizedImageProps) {
  const ref = useRef<HTMLImageElement>(null);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    const img = ref.current;
    if (!img) return;
    // Já veio do cache: o load aconteceu antes de o ouvinte existir.
    if (img.complete && img.naturalWidth > 0) setLoaded(true);
    else if (img.complete) setError(true);
  }, [src]);

  return (
    <div className="relative h-full w-full">
      {!loaded && !error && <div className="absolute inset-0 animate-pulse bg-muted" />}
      <img
        ref={ref}
        src={error ? fallback : src}
        alt={alt}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : "auto"}
        onLoad={() => setLoaded(true)}
        onError={() => {
          // O fallback também pode falhar; aí mostra-se o que há, sem piscar.
          setError(true);
          setLoaded(true);
        }}
        className={cn(
          "transition-opacity duration-300",
          loaded || error ? "opacity-100" : "opacity-0",
          className,
        )}
      />
    </div>
  );
}
