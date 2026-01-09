import { motion } from "framer-motion";
import { FileText, BookOpen, Lightbulb, Wrench, CheckSquare, Book, Mail, ExternalLink, Calendar, Download } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { MaterialGratuito } from "@/hooks/useMateriaisGratuitos";
import { Json } from "@/integrations/supabase/types";

interface MaterialCardProps {
  material: MaterialGratuito;
}

const categoriaIconMap: Record<string, typeof FileText> = {
  templates: FileText,
  guias: BookOpen,
  prompts: Lightbulb,
  ferramentas: Wrench,
  checklists: CheckSquare,
  ebooks: Book,
  newsletter: Mail,
};

const categoriaBgMap: Record<string, string> = {
  templates: "bg-primary",
  guias: "bg-primary/90",
  prompts: "bg-primary/80",
  ferramentas: "bg-primary/70",
  checklists: "bg-primary",
  ebooks: "bg-primary/90",
  newsletter: "bg-primary/80",
};

const getLinksUrls = (links_url: Json | null): string[] => {
  if (!links_url) return [];
  if (Array.isArray(links_url)) {
    return links_url.filter((item): item is string => typeof item === 'string');
  }
  return [];
};

const getArquivoUrls = (arquivos_url: Json | null): string[] => {
  if (!arquivos_url) return [];
  if (Array.isArray(arquivos_url)) {
    return arquivos_url.filter((item): item is string => typeof item === 'string');
  }
  return [];
};

export function MaterialCard({ material }: MaterialCardProps) {
  const Icon = categoriaIconMap[material.categoria] || FileText;
  const iconBgClass = categoriaBgMap[material.categoria] || "bg-primary";
  
  const links = getLinksUrls(material.links_url);
  const arquivos = getArquivoUrls(material.arquivos_url);
  const primaryUrl = material.url || links[0];
  const hasFiles = arquivos.length > 0;

  const handleClick = () => {
    if (primaryUrl) {
      window.open(primaryUrl, "_blank");
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
        min-h-[160px] sm:min-h-[180px]
      `}
      onClick={handleClick}
    >
      {/* Icon */}
      <div className={`w-8 h-8 sm:w-10 sm:h-10 md:w-11 md:h-11 rounded-lg sm:rounded-xl ${iconBgClass} flex items-center justify-center mb-2.5 sm:mb-3 md:mb-4 shadow-md`}>
        <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
      </div>

      {/* Content */}
      <h4 className="font-semibold text-foreground mb-1.5 sm:mb-2 line-clamp-2 group-hover:text-primary transition-colors text-sm sm:text-base">
        {material.titulo}
      </h4>
      <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 sm:line-clamp-3 mb-2.5 sm:mb-4">
        {material.descricao}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between text-[10px] sm:text-xs text-muted-foreground">
        <div className="flex items-center gap-1 sm:gap-1.5">
          <Calendar className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-primary" />
          <span>
            {material.created_at 
              ? format(new Date(material.created_at), "dd MMM yyyy", { locale: ptBR })
              : "Disponível"
            }
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          {hasFiles && (
            <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary/70" />
          )}
          {primaryUrl && (
            <ExternalLink className="w-3.5 h-3.5 sm:w-4 sm:h-4 opacity-0 group-hover:opacity-100 transition-opacity text-primary" />
          )}
        </div>
      </div>
    </motion.div>
  );
}
