import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  type LucideIcon
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
      return 'bg-card text-white';
  }
};

export function PromptCard({ prompt, onVerMais }: PromptCardProps) {
  return (
    <Card className="h-[240px] flex flex-col hover:shadow-lg transition-all">
      <CardContent className="p-5 flex flex-col gap-3 flex-1">
        {/* Ícone da Categoria */}
        <div className={`w-14 h-14 rounded-xl ${getGradientCategoria(prompt.categoria)} flex items-center justify-center shadow-md`}>
          {(() => {
            const IconComponent = getIconeCategoria(prompt.categoria);
            return <IconComponent className="w-7 h-7 text-primary" />;
          })()}
        </div>
        
        {/* Título */}
        <h3 className="font-bold text-lg line-clamp-2 min-h-[3.5rem]">
          {prompt.titulo}
        </h3>
        
        {/* Descrição Resumida */}
        <p className="text-sm text-muted-foreground line-clamp-3 flex-1">
          {prompt.descricao}
        </p>
        
        {/* Badges de Categoria e Nível */}
        <div className="flex gap-2 flex-wrap items-center">
          <Badge variant="secondary" className="text-xs">
            {prompt.categoria}
          </Badge>
          {prompt.nivel_complexidade && (
            <Badge className={`text-xs ${getNivelColor(prompt.nivel_complexidade)}`}>
              {prompt.nivel_complexidade.charAt(0).toUpperCase() + prompt.nivel_complexidade.slice(1)}
            </Badge>
          )}
          <FavoriteButton 
            tipo="prompt" 
            itemId={prompt.id}
            variant="ghost"
            size="sm"
            className="ml-auto"
          />
        </div>
        
        {/* Botão Ver Prompt */}
        <Button 
          variant="ghost" 
          className="w-full text-primary hover:text-primary hover:bg-accent mt-auto"
          onClick={onVerMais}
        >
          Ver Prompt 
          <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </CardContent>
    </Card>
  );
}
