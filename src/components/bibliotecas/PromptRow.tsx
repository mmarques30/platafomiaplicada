import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
}

const categoriaIcons: Record<string, { icon: LucideIcon; gradient: string }> = {
  'Vendas': { icon: TrendingUp, gradient: 'bg-gradient-to-br from-green-400 to-green-600' },
  'Marketing': { icon: Megaphone, gradient: 'bg-gradient-to-br from-purple-400 to-purple-600' },
  'Automacao': { icon: Settings, gradient: 'bg-gradient-to-br from-blue-400 to-blue-600' },
  'Comunicacao': { icon: MessageSquare, gradient: 'bg-gradient-to-br from-teal-400 to-teal-600' },
  'Gestao de Projetos': { icon: BarChart3, gradient: 'bg-gradient-to-br from-orange-400 to-orange-600' },
  'Produtividade': { icon: Zap, gradient: 'bg-gradient-to-br from-yellow-400 to-yellow-600' },
  'Comunicação & Escrita': { icon: PenTool, gradient: 'bg-gradient-to-br from-pink-400 to-pink-600' },
  'Análise de Dados': { icon: LineChart, gradient: 'bg-gradient-to-br from-indigo-400 to-indigo-600' },
  'Apresentações': { icon: Presentation, gradient: 'bg-gradient-to-br from-red-400 to-red-600' },
};

const getIconeCategoria = (categoria: string) => {
  return categoriaIcons[categoria]?.icon || FileText;
};

const getGradientCategoria = (categoria: string) => {
  return categoriaIcons[categoria]?.gradient || 'bg-gradient-to-br from-gray-400 to-gray-600';
};

const getNivelColor = (nivel: string | null) => {
  switch (nivel) {
    case 'iniciante':
      return 'bg-green-500 text-white hover:bg-green-600';
    case 'intermediario':
      return 'bg-yellow-500 text-white hover:bg-yellow-600';
    case 'avancado':
      return 'bg-red-500 text-white hover:bg-red-600';
    default:
      return 'bg-muted text-muted-foreground';
  }
};

export function PromptRow({ prompt, onClick }: PromptRowProps) {
  return (
    <div
      className="flex items-center gap-4 p-4 border-b last:border-b-0 hover:bg-accent/50 transition-colors cursor-pointer group"
      onClick={onClick}
    >
      {/* Ícone da Categoria */}
      <div className={`w-12 h-12 rounded-lg ${getGradientCategoria(prompt.categoria)} flex items-center justify-center flex-shrink-0 shadow-sm`}>
        {(() => {
          const IconComponent = getIconeCategoria(prompt.categoria);
          return <IconComponent className="w-6 h-6 text-white" />;
        })()}
      </div>

      {/* Título e Descrição */}
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-base truncate mb-1">{prompt.titulo}</h3>
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

      {/* Botão Ver */}
      <Button
        variant="ghost"
        size="sm"
        className="flex-shrink-0 group-hover:text-primary"
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
      >
        <ChevronRight className="w-5 h-5" />
      </Button>
    </div>
  );
}
