import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, ExternalLink, GraduationCap, Play, Wrench, MessageSquare, Target, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { LucideIcon } from "lucide-react";

interface FavoritoRowProps {
  tipo: string;
  titulo: string;
  descricao: string;
  link: string;
  onRemove: () => void;
  isRemoving?: boolean;
}

const tipoConfig: Record<string, { icon: LucideIcon; bgColor: string; label: string }> = {
  trilha: { icon: GraduationCap, bgColor: "bg-blue-50 dark:bg-blue-950/30", label: "Trilha" },
  video: { icon: Play, bgColor: "bg-purple-50 dark:bg-purple-950/30", label: "Vídeo" },
  ferramenta: { icon: Wrench, bgColor: "bg-green-50 dark:bg-green-950/30", label: "Ferramenta" },
  prompt: { icon: MessageSquare, bgColor: "bg-orange-50 dark:bg-orange-950/30", label: "Prompt" },
  metodo: { icon: Target, bgColor: "bg-pink-50 dark:bg-pink-950/30", label: "Método" },
  ia_copie_use: { icon: Sparkles, bgColor: "bg-yellow-50 dark:bg-yellow-950/30", label: "IA Copie e Use" },
};

export default function FavoritoRow({ tipo, titulo, descricao, link, onRemove, isRemoving }: FavoritoRowProps) {
  const config = tipoConfig[tipo] || tipoConfig.trilha;
  const Icon = config.icon;

  return (
    <div className="flex items-center gap-4 p-4 border-b last:border-b-0 hover:bg-accent/50 transition-colors group">
      {/* Ícone por tipo */}
      <div className={`w-10 h-10 rounded-lg ${config.bgColor} flex items-center justify-center shrink-0`}>
        <Icon className="w-5 h-5 text-primary" />
      </div>
      
      {/* Título e Descrição */}
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold truncate text-foreground">{titulo}</h3>
        <p className="text-sm text-muted-foreground line-clamp-1">{descricao}</p>
      </div>
      
      {/* Badge do tipo - oculto em mobile */}
      <Badge variant="outline" className="hidden md:flex shrink-0">
        {config.label}
      </Badge>
      
      {/* Ações */}
      <div className="flex gap-2 shrink-0">
        <Button variant="ghost" size="sm" asChild className="hidden sm:flex">
          <Link to={link}>
            <ExternalLink className="h-4 w-4 mr-2" />
            Ver
          </Link>
        </Button>
        <Button variant="ghost" size="icon" asChild className="sm:hidden">
          <Link to={link}>
            <ExternalLink className="h-4 w-4" />
          </Link>
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onRemove}
          disabled={isRemoving}
          className="hover:bg-destructive/10"
        >
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      </div>
    </div>
  );
}
