import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FavoriteButton } from "@/components/shared/FavoriteButton";
import { splitTitulo } from "./PromptCard";
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
  Copy,
  Check,
  type LucideIcon
} from "lucide-react";

interface PromptRowProps {
  prompt: {
    id: string;
    titulo: string;
    descricao: string;
    categoria: string;
    nivel_complexidade: string | null;
  };
  onClick: () => void;
  /** Cópia rápida do prompt direto na linha, sem abrir o modal */
  onQuickCopy?: () => void;
  justCopied?: boolean;
}

const categoriaIcons: Record<string, { icon: LucideIcon; gradient: string }> = {
  'Vendas': { icon: TrendingUp, gradient: 'bg-gradient-to-br from-status-success to-status-success' },
  'Marketing': { icon: Megaphone, gradient: 'bg-gradient-to-br from-secondary to-secondary' },
  'Automacao': { icon: Settings, gradient: 'bg-gradient-to-br from-status-info to-status-info' },
  'Comunicacao': { icon: MessageSquare, gradient: 'bg-gradient-to-br from-status-success to-status-success' },
  'Gestao de Projetos': { icon: BarChart3, gradient: 'bg-gradient-to-br from-status-warning to-status-warning' },
  'Produtividade': { icon: Zap, gradient: 'bg-gradient-to-br from-status-warning to-status-warning' },
  'Comunicação & Escrita': { icon: PenTool, gradient: 'bg-gradient-to-br from-status-danger to-status-danger' },
  'Análise de Dados': { icon: LineChart, gradient: 'bg-gradient-to-br from-status-info to-status-info' },
  'Apresentações': { icon: Presentation, gradient: 'bg-gradient-to-br from-status-danger to-status-danger' },
};

const getIconeCategoria = (categoria: string) => {
  return categoriaIcons[categoria]?.icon || FileText;
};

const getGradientCategoria = (_categoria: string) => {
  return 'bg-primary/10 border border-primary/20';
};

const getNivelColor = (nivel: string | null) => {
  switch (nivel) {
    case 'iniciante':
      return 'bg-status-success text-white hover:bg-status-success';
    case 'intermediario':
      return 'bg-status-warning text-white hover:bg-status-warning';
    case 'avancado':
      return 'bg-status-danger text-white hover:bg-status-danger';
    default:
      return 'bg-muted text-muted-foreground';
  }
};

export function PromptRow({ prompt, onClick, onQuickCopy, justCopied }: PromptRowProps) {
  const { eyebrow, titulo } = splitTitulo(prompt.titulo);
  return (
    <div
      className="flex items-center gap-4 p-4 border-b last:border-b-0 hover:bg-accent/50 transition-colors cursor-pointer group"
      onClick={onClick}
    >
      {/* Ícone da Categoria */}
      <div className={`w-12 h-12 rounded-lg ${getGradientCategoria(prompt.categoria)} flex items-center justify-center flex-shrink-0 shadow-sm`}>
        {(() => {
          const IconComponent = getIconeCategoria(prompt.categoria);
          return <IconComponent className="w-6 h-6 text-primary" />;
        })()}
      </div>

      {/* Título e Descrição */}
      <div className="flex-1 min-w-0">
        {eyebrow && (
          <span className="block text-[11px] font-medium uppercase tracking-[0.12em] text-primary">{eyebrow}</span>
        )}
        <h3 className="font-semibold text-base truncate mb-0.5">{titulo}</h3>
        <p className="text-sm text-muted-foreground truncate">{prompt.descricao}</p>
      </div>

      {/* Badges */}
      <div className="hidden md:flex gap-2 flex-shrink-0">
        <Badge variant="secondary" className="text-xs">
          {prompt.categoria}
        </Badge>
        {prompt.nivel_complexidade && (
          <Badge className={`text-xs ${getNivelColor(prompt.nivel_complexidade)}`}>
            {prompt.nivel_complexidade.charAt(0).toUpperCase() + prompt.nivel_complexidade.slice(1)}
          </Badge>
        )}
      </div>

      {/* Ações */}
      <div className="flex items-center gap-1 shrink-0">
        {onQuickCopy && (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            title="Copiar prompt"
            onClick={(e) => {
              e.stopPropagation();
              onQuickCopy();
            }}
          >
            {justCopied ? <Check className="w-4 h-4 text-brand-strong" /> : <Copy className="w-4 h-4" />}
          </Button>
        )}
        <FavoriteButton 
          tipo="prompt" 
          itemId={prompt.id}
          variant="ghost"
          size="sm"
        />
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onClick();
          }}
        >
          Ver
          <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}
