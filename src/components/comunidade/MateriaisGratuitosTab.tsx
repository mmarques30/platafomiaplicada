import { FileText, ExternalLink, Download, BookOpen, Lightbulb, Wrench, CheckSquare, Book, Mail, ArrowUpRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useContentAccessLogger } from "@/hooks/useContentAccessLogger";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Json } from "@/integrations/supabase/types";
import { useState, useMemo } from "react";
import { MaterialGratuitoModal, type MaterialGratuito } from "@/components/comunidade/MaterialGratuitoModal";
import { downloadUrl, getFileNameFromUrl } from "@/lib/download";
import { toast } from "sonner";

const categoriaIconMap: Record<string, typeof FileText> = {
  templates: FileText,
  guias: BookOpen,
  prompts: Lightbulb,
  ferramentas: Wrench,
  checklists: CheckSquare,
  ebooks: Book,
  newsletter: Mail,
};

const categoriaLabel = (cat: string) =>
  cat.replace(/_/g, " ").replace(/^\w/, (c) => c.toUpperCase());

const getLinksUrls = (links_url: Json | null): string[] => {
  if (!links_url) return [];
  if (Array.isArray(links_url)) {
    return links_url.filter((item): item is string => typeof item === "string");
  }
  return [];
};

const getArquivoUrls = (arquivos_url: Json | null): string[] => {
  if (!arquivos_url) return [];
  if (Array.isArray(arquivos_url)) {
    return arquivos_url.filter((item): item is string => typeof item === "string");
  }
  return [];
};

export function MateriaisGratuitosTab() {
  const { logAccess } = useContentAccessLogger();
  const [selectedMaterial, setSelectedMaterial] = useState<MaterialGratuito | null>(null);
  const [filter, setFilter] = useState<string>("todos");

  const { data: materiais, isLoading } = useQuery({
    queryKey: ["materiais-gratuitos-comunidade"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("materiais_gratuitos")
        .select("*")
        .eq("ativo", true)
        .eq("visivel_gratuitos", true)
        .order("ordem", { ascending: true });

      if (error) throw error;
      return data as MaterialGratuito[];
    },
  });

  const categorias = useMemo(() => {
    const set = new Set((materiais ?? []).map((m) => m.categoria).filter(Boolean));
    return Array.from(set);
  }, [materiais]);

  const filtered = useMemo(() => {
    if (!materiais) return [];
    return filter === "todos" ? materiais : materiais.filter((m) => m.categoria === filter);
  }, [materiais, filter]);

  const handleAccessClick = (material: MaterialGratuito) => {
    logAccess("material", material.id, material.titulo);
  };

  const safeDownload = async (url: string) => {
    try {
      await downloadUrl(url, getFileNameFromUrl(url));
    } catch (e) {
      console.error(e);
      toast.error("Não foi possível baixar este arquivo. Abrindo em nova aba...");
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div className="space-y-6">
      {/* Filtros por categoria */}
      {!isLoading && materiais && materiais.length > 0 && categorias.length > 1 && (
        <div className="flex flex-wrap gap-2">
          <FilterChip active={filter === "todos"} onClick={() => setFilter("todos")}>
            Todos
          </FilterChip>
          {categorias.map((cat) => {
            const Icon = categoriaIconMap[cat] || FileText;
            return (
              <FilterChip key={cat} active={filter === cat} onClick={() => setFilter(cat)}>
                <Icon className="h-3.5 w-3.5" />
                {categoriaLabel(cat)}
              </FilterChip>
            );
          })}
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-40 rounded-2xl" />
          ))}
        </div>
      )}

      {/* Grid de cards */}
      {!isLoading && filtered.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((material) => {
            const Icon = categoriaIconMap[material.categoria] || FileText;
            const links = getLinksUrls(material.links_url);
            const arquivos = getArquivoUrls(material.arquivos_url);
            const primaryUrl = material.url || links[0];
            const hasFiles = arquivos.length > 0;
            const hasAnyContent = !!primaryUrl || hasFiles || !!material.descricao;

            return (
              <div
                key={material.id}
                role={hasAnyContent ? "button" : undefined}
                tabIndex={hasAnyContent ? 0 : undefined}
                onClick={() => {
                  if (!hasAnyContent) return;
                  handleAccessClick(material);
                  setSelectedMaterial(material);
                }}
                onKeyDown={(e) => {
                  if (!hasAnyContent) return;
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleAccessClick(material);
                    setSelectedMaterial(material);
                  }
                }}
                className={cn(
                  "group flex flex-col gap-3 rounded-2xl border border-brand-hairline bg-brand-cream-soft p-5 transition-all duration-200",
                  hasAnyContent && "cursor-pointer hover:border-brand-strong/40 hover:shadow-lg hover:shadow-foreground/5 hover:-translate-y-0.5"
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="h-11 w-11 rounded-xl bg-brand-strong/10 flex items-center justify-center flex-shrink-0">
                    <Icon className="h-5 w-5 text-brand-strong" />
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-full bg-brand-cream border border-brand-hairline px-2.5 py-1 text-[11px] font-medium text-brand-strong capitalize">
                    {categoriaLabel(material.categoria)}
                  </span>
                </div>

                <div className="flex-1">
                  <h3 className="font-medium text-foreground leading-snug line-clamp-2 group-hover:text-brand-strong transition-colors">
                    {material.titulo}
                  </h3>
                  {material.descricao && (
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-1.5">
                      {material.descricao}
                    </p>
                  )}
                </div>

                {/* Ações */}
                <div className="flex items-center gap-2 pt-1 mt-auto">
                  {primaryUrl && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAccessClick(material);
                        window.open(primaryUrl, "_blank", "noopener,noreferrer");
                      }}
                      className="inline-flex items-center gap-1.5 rounded-full bg-brand-strong text-brand-cream px-3.5 py-1.5 text-xs font-medium hover:bg-brand-strong/90 transition-colors"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      Acessar
                    </button>
                  )}
                  {hasFiles && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAccessClick(material);
                        void safeDownload(arquivos[0]);
                      }}
                      className="inline-flex items-center gap-1.5 rounded-full border border-brand-hairline bg-background px-3.5 py-1.5 text-xs font-medium text-foreground hover:border-brand-strong/40 hover:text-brand-strong transition-colors"
                    >
                      <Download className="h-3.5 w-3.5" />
                      Baixar
                    </button>
                  )}
                  {!primaryUrl && !hasFiles && material.descricao && (
                    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground group-hover:text-brand-strong transition-colors">
                      Ver detalhes <ArrowUpRight className="h-3.5 w-3.5" />
                    </span>
                  )}
                  {!hasAnyContent && (
                    <span className="text-xs text-muted-foreground">Em breve</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Sem itens no filtro */}
      {!isLoading && materiais && materiais.length > 0 && filtered.length === 0 && (
        <div className="text-center py-12 text-muted-foreground text-sm">
          Nenhum material nesta categoria.
        </div>
      )}

      <MaterialGratuitoModal
        material={selectedMaterial}
        open={!!selectedMaterial}
        onOpenChange={(open) => !open && setSelectedMaterial(null)}
      />

      {/* Empty State geral */}
      {!isLoading && materiais && materiais.length === 0 && (
        <div className="rounded-2xl border border-dashed border-brand-hairline bg-brand-cream-soft py-16 text-center">
          <div className="h-14 w-14 rounded-2xl bg-brand-strong/10 flex items-center justify-center mx-auto mb-4">
            <FileText className="h-6 w-6 text-brand-strong" />
          </div>
          <h3 className="font-serif-display text-xl text-foreground mb-1">Nenhum material ainda</h3>
          <p className="text-sm text-muted-foreground">
            Os materiais de apoio aparecerão aqui assim que forem publicados.
          </p>
        </div>
      )}
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium border transition-colors",
        active
          ? "bg-brand-strong text-brand-cream border-brand-strong"
          : "bg-brand-cream-soft text-muted-foreground border-brand-hairline hover:text-foreground hover:border-brand-strong/30"
      )}
    >
      {children}
    </button>
  );
}
