import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Play } from "lucide-react";

import { MarcaIAplicada } from "@/components/shared/MarcaIAplicada";
import { cn } from "@/lib/utils";

/**
 * Os tamanhos de capa que o YouTube publica, do melhor para o que sempre
 * existe.
 *
 * `maxresdefault` (1280x720) só é gerado quando o arquivo enviado tinha 720p
 * ou mais. Para todo vídeo enviado abaixo disso o endereço responde 404 — não
 * é uma imagem ruim, é imagem nenhuma. `hqdefault` (480x360) e `mqdefault`
 * (320x180) são gerados para qualquer vídeo que exista.
 */
const FORMATOS = ["maxresdefault", "hqdefault", "mqdefault"] as const;

/**
 * Quando o vídeo não existe mais, ou o id está errado, o YouTube às vezes
 * devolve 200 com um retângulo cinza de 120x90 em vez de 404. Qualquer
 * formato legítimo é mais largo que isso, então essa largura denuncia a
 * imagem vazia.
 */
const LARGURA_DO_CINZA = 120;

function montarCandidatos(youtubeId?: string | null, capa?: string | null): string[] {
  const lista: string[] = [];

  const personalizada = capa?.trim();
  if (personalizada) lista.push(personalizada);

  const id = youtubeId?.trim();
  if (id) {
    for (const formato of FORMATOS) {
      lista.push(`https://img.youtube.com/vi/${id}/${formato}.jpg`);
    }
  }

  return lista;
}

interface CapaVideoProps {
  youtubeId?: string | null;
  /** A capa escolhida à mão, quando existe. Tem prioridade sobre o YouTube. */
  capa?: string | null;
  alt: string;
  /** Classes do `<img>`. O enquadramento continua com quem chama. */
  className?: string;
  priority?: boolean;
  /** Esmaece e tira a cor, para vídeo de trilha bloqueada. */
  esmaecida?: boolean;
  /** Sem o retângulo pulsando enquanto carrega, para capa decorativa. */
  semPulso?: boolean;
}

/**
 * A capa de um vídeo.
 *
 * Cada tela montava a sua: pegava `maxresdefault.jpg` direto e desenhava um
 * `<img>` sem `onError`. Isso quebrava de duas formas, as duas visíveis na
 * plataforma.
 *
 * A primeira é o endereço. `maxresdefault` não existe para vídeo enviado
 * abaixo de 720p, e o endereço responde 404. A segunda é o desenho: os
 * cartões revelavam a imagem só no `onLoad` e, como o 404 nunca dispara
 * `onLoad`, a capa ficava em `opacity-0` com o retângulo pulsando embaixo
 * para sempre. Por isso a capa não aparecia quebrada: ela simplesmente
 * sumia.
 *
 * Aqui a capa desce a escada: a personalizada, depois maxres, hq e mq, e
 * cada 404 avança para o próximo degrau. Esgotados todos, entra a arte da
 * marca, que é uma capa de verdade e não um ícone de imagem partida.
 *
 * O caso da imagem em cache também é tratado: o navegador dispara `load`
 * antes de o React pendurar o ouvinte, então na montagem o componente
 * pergunta ao próprio elemento se ele já terminou (`complete`) em vez de
 * esperar um evento que já passou.
 */
export function CapaVideo({
  youtubeId,
  capa,
  alt,
  className,
  priority = false,
  esmaecida,
  semPulso = false,
}: CapaVideoProps) {
  const candidatos = useMemo(() => montarCandidatos(youtubeId, capa), [youtubeId, capa]);
  const chave = candidatos.join("|");

  const [indice, setIndice] = useState(0);
  const [pronta, setPronta] = useState(false);
  const ref = useRef<HTMLImageElement>(null);

  // Troca de vídeo: volta ao primeiro degrau.
  useEffect(() => {
    setIndice(0);
    setPronta(false);
  }, [chave]);

  const avancar = useCallback(() => {
    setPronta(false);
    setIndice((n) => n + 1);
  }, []);

  const aoCarregar = useCallback(() => {
    const img = ref.current;
    if (img && img.naturalWidth > 0 && img.naturalWidth <= LARGURA_DO_CINZA) {
      // Veio o retângulo cinza em vez da capa.
      avancar();
      return;
    }
    setPronta(true);
  }, [avancar]);

  useEffect(() => {
    const img = ref.current;
    if (!img || !img.complete) return;
    if (img.naturalWidth > 0) aoCarregar();
    else avancar();
  }, [indice, chave, aoCarregar, avancar]);

  const src = candidatos[indice];

  if (!src) {
    return (
      <div
        className={cn(
          "relative flex h-full w-full items-center justify-center overflow-hidden bg-surface",
          esmaecida && "opacity-50 grayscale",
          className,
        )}
        role="img"
        aria-label={alt}
      >
        <span aria-hidden="true" className="absolute inset-0 dot-grid-bg opacity-40" />
        <MarcaIAplicada className="relative h-[42%] w-auto opacity-30" />
        <span className="absolute bottom-2 right-2 text-muted-foreground/50">
          <Play className="h-4 w-4" fill="currentColor" strokeWidth={0} />
        </span>
      </div>
    );
  }

  return (
    <>
      {!pronta && !semPulso && <span className="absolute inset-0 animate-pulse bg-muted" />}
      <img
        ref={ref}
        key={src}
        src={src}
        alt={alt}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : "auto"}
        onLoad={aoCarregar}
        onError={avancar}
        className={cn(
          "h-full w-full object-cover transition-opacity duration-300",
          pronta ? "opacity-100" : "opacity-0",
          esmaecida && "opacity-50 grayscale",
          className,
        )}
      />
    </>
  );
}
