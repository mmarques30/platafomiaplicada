import { Card, CardContent } from "@/components/ui/card";
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
      return 'bg-gray-500 text-white';
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
            return <IconComponent className="w-7 h-7 text-white" />;
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
        <div className="flex gap-2 flex-wrap">
          <Badge variant="secondary" className="text-xs">
            {prompt.categoria}
          </Badge>
          {prompt.nivel_complexidade && (
            <Badge className={`text-xs ${getNivelColor(prompt.nivel_complexidade)}`}>
              {prompt.nivel_complexidade.charAt(0).toUpperCase() + prompt.nivel_complexidade.slice(1)}
            </Badge>
          )}
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
