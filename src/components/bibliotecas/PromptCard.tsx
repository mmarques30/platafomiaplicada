import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FavoriteButton } from "@/components/shared/FavoriteButton";
import {
  ChevronRight,
  TrendingUp,
  Megaphone,
  Settings,
  MessageSquare,
  BarChart3,
  Zap,
  PenTool,
  LineChart,
  Presentation,
  FileText,
  type LucideIcon,
} from "lucide-react";

interface PromptCardProps {
  prompt: {
    id: string;
    titulo: string;
    descricao: string;
    categoria: string;
    nivel_complexidade: string | null;
  };
  onVerMais: () => void;
}

const categoriaIcons: Record<string, LucideIcon> = {
  Vendas: TrendingUp,
  Marketing: Megaphone,
  Automacao: Settings,
  Comunicacao: MessageSquare,
  "Gestao de Projetos": BarChart3,
  Produtividade: Zap,
  "Comunicação & Escrita": PenTool,
  "Análise de Dados": LineChart,
  Apresentações: Presentation,
};

const NIVEL_LABEL: Record<string, string> = {
  iniciante: "Iniciante",
  intermediario: "Intermediário",
  avancado: "Avançado",
};

/**
 * Quebra títulos do tipo "Prompt-base — Landing Page de Isca" ou
 * "Dashboard Financeiro | Controle de Finanças" em um rótulo curto (eyebrow)
 * e o título limpo, sem travessão/barra no meio do título.
 */
export function splitTitulo(titulo: string): { eyebrow: string | null; titulo: string } {
  const m = titulo.match(/^(.{2,40}?)\s+(?:—|–|\||-)\s+(.+)$/);
  if (!m) return { eyebrow: null, titulo };
  return { eyebrow: m[1].trim(), titulo: m[2].trim() };
}

export function PromptCard({ prompt, onVerMais }: PromptCardProps) {
  const Icon = categoriaIcons[prompt.categoria] || FileText;
  const { eyebrow, titulo } = splitTitulo(prompt.titulo);

  return (
    <Card
      className="group flex h-full min-h-[240px] cursor-pointer flex-col transition-colors hover:border-primary/50"
      onClick={onVerMais}
    >
      <CardContent className="flex flex-1 flex-col gap-3 p-5">
        {/* Linha superior: ícone da categoria + categoria + favorito */}
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted text-primary">
            <Icon className="h-4 w-4" />
          </div>
          <span className="truncate text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
            {prompt.categoria}
          </span>
          <div className="ml-auto" onClick={(e) => e.stopPropagation()}>
            <FavoriteButton tipo="prompt" itemId={prompt.id} variant="ghost" size="sm" />
          </div>
        </div>

        {/* Título (sem travessão) com rótulo opcional */}
        <div>
          {eyebrow && (
            <span className="mb-1 block text-[11px] font-medium text-primary">{eyebrow}</span>
          )}
          <h3 className="line-clamp-2 text-base font-semibold leading-snug text-foreground">{titulo}</h3>
        </div>

        {/* Descrição */}
        <p className="line-clamp-3 text-sm text-muted-foreground">{prompt.descricao}</p>

        {/* Rodapé: nível + ação */}
        <div className="mt-auto flex items-center justify-between pt-2">
          {prompt.nivel_complexidade ? (
            <Badge variant="outline" className="text-xs">
              {NIVEL_LABEL[prompt.nivel_complexidade] ?? prompt.nivel_complexidade}
            </Badge>
          ) : (
            <span />
          )}
          <span className="inline-flex items-center gap-1 text-sm font-medium text-primary">
            Ver prompt
            <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
