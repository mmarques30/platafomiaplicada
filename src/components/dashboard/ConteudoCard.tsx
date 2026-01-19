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
  material: Calendar,
};

const iconBgMap = {
  newsletter: "bg-primary",
  noticia: "bg-primary/90",
  dica: "bg-primary/80",
  material: "bg-primary/70",
};

export function ConteudoCard({ conteudo }: ConteudoCardProps) {
  const Icon = iconMap[conteudo.tipo];
  const iconBgClass = iconBgMap[conteudo.tipo];

  const handleClick = () => {
    if (conteudo.link_externo) {
      window.open(conteudo.link_externo, "_blank");
    }
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -4 }}
      whileTap={{ scale: 0.98 }}
      className={`
        group relative p-3 sm:p-4 md:p-5 rounded-lg sm:rounded-xl 
        bg-card/90 backdrop-blur-sm 
        border border-primary/30 dark:border-primary/40 sm:border-2 hover:border-primary/60 
        transition-all duration-300 cursor-pointer
        shadow-md sm:shadow-lg hover:shadow-xl hover:shadow-primary/20
        min-w-[200px] max-w-[240px] sm:min-w-[280px] sm:max-w-[320px] flex-shrink-0
        h-[200px] sm:h-[240px] flex flex-col
      `}
      onClick={handleClick}
    >
      {/* Destaque indicator */}
      {conteudo.destaque && (
        <div className="absolute top-2 right-2 sm:top-3 sm:right-3">
          <span className="px-1.5 py-0.5 sm:px-2.5 sm:py-1 text-[8px] sm:text-[10px] font-bold uppercase tracking-wider bg-primary text-primary-foreground rounded-full shadow-md">
            Destaque
          </span>
        </div>
      )}

      {/* Icon */}
      <div className={`w-8 h-8 sm:w-10 sm:h-10 md:w-11 md:h-11 rounded-lg sm:rounded-xl ${iconBgClass} flex items-center justify-center mb-2.5 sm:mb-3 md:mb-4 shadow-md`}>
        <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
      </div>

      {/* Content */}
      <div className="flex-grow overflow-hidden">
        <h4 className="font-semibold text-foreground mb-1.5 sm:mb-2 line-clamp-2 group-hover:text-primary transition-colors text-sm sm:text-base">
          {conteudo.titulo}
        </h4>
        <p className="text-xs sm:text-sm text-muted-foreground line-clamp-3 sm:line-clamp-4">
          {conteudo.resumo}
        </p>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between text-[10px] sm:text-xs text-muted-foreground mt-auto pt-2">
        <div className="flex items-center gap-1 sm:gap-1.5">
          <Calendar className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-primary" />
          <span>{format(new Date(conteudo.created_at), "dd MMM yyyy", { locale: ptBR })}</span>
        </div>
        {conteudo.link_externo && (
          <ExternalLink className="w-3.5 h-3.5 sm:w-4 sm:h-4 opacity-0 group-hover:opacity-100 transition-opacity text-primary" />
        )}
      </div>
    </motion.div>
  );
}
