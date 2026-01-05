import { motion } from "framer-motion";
import { Newspaper, Globe, Lightbulb, ExternalLink, Calendar } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ConteudoDashboard } from "@/hooks/useConteudosDashboard";

interface ConteudoCardProps {
  conteudo: ConteudoDashboard;
}

const iconMap = {
  newsletter: Newspaper,
  noticia: Globe,
  dica: Lightbulb,
};

const colorMap = {
  newsletter: "bg-primary/10 text-primary",
  noticia: "bg-blue-500/10 text-blue-500",
  dica: "bg-amber-500/10 text-amber-500",
};

export function ConteudoCard({ conteudo }: ConteudoCardProps) {
  const Icon = iconMap[conteudo.tipo];
  const colorClass = colorMap[conteudo.tipo];

  const handleClick = () => {
    if (conteudo.link_externo) {
      window.open(conteudo.link_externo, "_blank");
    }
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      className={`
        group relative p-5 rounded-xl 
        bg-card/60 backdrop-blur-sm 
        border border-border/50 hover:border-primary/30 
        transition-all duration-300 cursor-pointer
        shadow-sm hover:shadow-md
        min-w-[280px] max-w-[320px] flex-shrink-0
      `}
      onClick={handleClick}
    >
      {/* Destaque indicator */}
      {conteudo.destaque && (
        <div className="absolute top-3 right-3">
          <span className="px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider bg-primary/10 text-primary rounded-full">
            Destaque
          </span>
        </div>
      )}

      {/* Icon */}
      <div className={`w-10 h-10 rounded-lg ${colorClass} flex items-center justify-center mb-4`}>
        <Icon className="w-5 h-5" />
      </div>

      {/* Content */}
      <h4 className="font-semibold text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
        {conteudo.titulo}
      </h4>
      <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
        {conteudo.resumo}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5" />
          <span>{format(new Date(conteudo.created_at), "dd MMM yyyy", { locale: ptBR })}</span>
        </div>
        {conteudo.link_externo && (
          <ExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity text-primary" />
        )}
      </div>
    </motion.div>
  );
}
