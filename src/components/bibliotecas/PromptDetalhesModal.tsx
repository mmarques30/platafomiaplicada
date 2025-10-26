import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/shared/CopyButton";
import { Cpu, TrendingUp, Megaphone, Settings, MessageSquare, BarChart3, Zap, PenTool, LineChart, Presentation, FileText, type LucideIcon } from "lucide-react";

interface PromptDetalhesModalProps {
  prompt: {
    id: string;
    titulo: string;
    descricao: string;
    categoria: string;
    nivel_complexidade: string | null;
    tags: string[] | null;
    ferramentas_recomendadas: string[] | null;
    prompt: string;
  } | null;
  onClose: () => void;
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

const getGradientCategoria = (_categoria: string) => {
  return 'bg-primary/10 border border-primary/20';
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

export function PromptDetalhesModal({ prompt, onClose }: PromptDetalhesModalProps) {
  if (!prompt) return null;

  return (
    <Dialog open={!!prompt} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          {/* Ícone + Título */}
          <div className="flex items-start gap-3 mb-2">
            <div className={`w-12 h-12 rounded-lg ${getGradientCategoria(prompt.categoria)} flex items-center justify-center shadow-md flex-shrink-0`}>
              {(() => {
                const IconComponent = getIconeCategoria(prompt.categoria);
                return <IconComponent className="w-6 h-6 text-primary" />;
              })()}
            </div>
            <div className="flex-1">
              <DialogTitle className="text-2xl mb-2">{prompt.titulo}</DialogTitle>
              <p className="text-sm text-muted-foreground">{prompt.descricao}</p>
            </div>
          </div>
          
          {/* Badges */}
          <div className="flex gap-2 flex-wrap mt-3">
            <Badge variant="secondary">{prompt.categoria}</Badge>
            {prompt.nivel_complexidade && (
              <Badge className={getNivelColor(prompt.nivel_complexidade)}>
                {prompt.nivel_complexidade.charAt(0).toUpperCase() + prompt.nivel_complexidade.slice(1)}
              </Badge>
            )}
          </div>
        </DialogHeader>
        
        {/* Tags */}
        {prompt.tags && prompt.tags.length > 0 && (
          <div className="mt-4">
            <p className="text-xs font-medium mb-2 text-muted-foreground">Tags:</p>
            <div className="flex gap-2 flex-wrap">
              {prompt.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}
        
        {/* Ferramentas Recomendadas */}
        {prompt.ferramentas_recomendadas && prompt.ferramentas_recomendadas.length > 0 && (
          <div className="mt-4">
            <p className="text-xs font-medium mb-2 flex items-center gap-1 text-muted-foreground">
              <Cpu className="w-3 h-3" />
              Ferramentas onde aplicar:
            </p>
            <div className="flex gap-2 flex-wrap">
              {prompt.ferramentas_recomendadas.map((ferramenta) => (
                <Badge key={ferramenta} className="text-xs bg-primary/10 text-primary hover:bg-primary/20">
                  {ferramenta}
                </Badge>
              ))}
            </div>
          </div>
        )}
        
        {/* Prompt Completo */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium">Prompt:</p>
            <CopyButton content={prompt.prompt} size="sm" />
          </div>
          <div className="bg-muted p-4 rounded-md max-h-[400px] overflow-y-auto">
            <pre className="text-sm whitespace-pre-wrap font-mono">
              {prompt.prompt}
            </pre>
          </div>
        </div>
        
        <DialogFooter className="mt-6">
          <Button onClick={onClose} variant="outline">
            Fechar
          </Button>
          <CopyButton 
            content={prompt.prompt} 
            variant="default"
          />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
