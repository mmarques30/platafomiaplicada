import { BookOpen, FileText, Lightbulb, Newspaper, TrendingUp, type LucideIcon } from "lucide-react";
import type { TipoConteudo } from "@/hooks/useConteudosDashboard";

/**
 * Curadoria de conteúdos.
 *
 * A seção não é mural de notícia: cada item precisa ensinar algo ou mudar uma
 * decisão. O `resumo` do conteúdo é a frase de "por que isso importa" e
 * aparece uma única vez no card, abaixo do título.
 */

export interface TipoInfo {
  label: string;
  /** Verbo da ação no rodapé do card. */
  acao: string;
  icon: LucideIcon;
  /** Par de cores (tokens da marca) da capa gráfica. */
  capa: string;
}

export const TIPO_INFO: Record<string, TipoInfo> = {
  artigo: {
    label: "Artigo",
    acao: "Ler",
    icon: BookOpen,
    capa: "from-primary/35 via-primary/10 to-transparent",
  },
  documento: {
    label: "Documento",
    acao: "Abrir",
    icon: FileText,
    capa: "from-sky-500/30 via-sky-500/10 to-transparent",
  },
  dica: {
    label: "Prática",
    acao: "Ver",
    icon: Lightbulb,
    capa: "from-amber-400/30 via-amber-400/10 to-transparent",
  },
  noticia: {
    label: "Mercado",
    acao: "Abrir",
    icon: TrendingUp,
    capa: "from-violet-500/30 via-violet-500/10 to-transparent",
  },
  newsletter: {
    label: "Newsletter",
    acao: "Ler",
    icon: Newspaper,
    capa: "from-emerald-500/30 via-emerald-500/10 to-transparent",
  },
  material: {
    label: "Material",
    acao: "Abrir",
    icon: FileText,
    capa: "from-sky-500/30 via-sky-500/10 to-transparent",
  },
};

export function tipoInfo(tipo: string): TipoInfo {
  return TIPO_INFO[tipo] ?? TIPO_INFO.artigo;
}

/**
 * Grupos das abas. "Aprender" junta o que ensina; "Documentos" junta o que a
 * pessoa leva para usar; "Mercado" é a novidade que muda uma decisão.
 */
export const GRUPOS: { value: string; label: string; tipos: TipoConteudo[] }[] = [
  { value: "aprender", label: "Aprender", tipos: ["artigo", "dica"] },
  { value: "documentos", label: "Documentos", tipos: ["documento", "material"] },
  { value: "mercado", label: "Mercado", tipos: ["noticia"] },
  { value: "newsletter", label: "Newsletter", tipos: ["newsletter"] },
];

/** Minutos de leitura a partir do texto próprio do conteúdo (200 palavras/min). */
export function tempoLeitura(texto?: string | null): number | null {
  if (!texto) return null;
  const palavras = texto.trim().split(/\s+/).length;
  if (palavras < 80) return null;
  return Math.max(1, Math.round(palavras / 200));
}
