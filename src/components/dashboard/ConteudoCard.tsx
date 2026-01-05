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

const iconBgMap = {
  newsletter: "bg-aplicada-green-700",
  noticia: "bg-aplicada-green-800",
  dica: "bg-aplicada-green-600",
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
        group relative p-5 rounded-xl 
        bg-card/90 backdrop-blur-sm 
        border-2 border-aplicada-green-700/30 hover:border-aplicada-green-700/60 
        transition-all duration-300 cursor-pointer
        shadow-lg hover:shadow-xl hover:shadow-aplicada-green-900/20
        min-w-[280px] max-w-[320px] flex-shrink-0
      `}
      onClick={handleClick}
    >
      {/* Destaque indicator */}
      {conteudo.destaque && (
        <div className="absolute top-3 right-3">
          <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-aplicada-green-700 text-white rounded-full shadow-md">
            Destaque
          </span>
        </div>
      )}

      {/* Icon */}
      <div className={`w-11 h-11 rounded-xl ${iconBgClass} flex items-center justify-center mb-4 shadow-md`}>
        <Icon className="w-5 h-5 text-white" />
      </div>

      {/* Content */}
      <h4 className="font-semibold text-foreground mb-2 line-clamp-2 group-hover:text-aplicada-green-600 transition-colors">
        {conteudo.titulo}
      </h4>
      <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
        {conteudo.resumo}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-aplicada-green-600" />
          <span>{format(new Date(conteudo.created_at), "dd MMM yyyy", { locale: ptBR })}</span>
        </div>
        {conteudo.link_externo && (
          <ExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity text-aplicada-green-600" />
        )}
      </div>
    </motion.div>
  );
}
