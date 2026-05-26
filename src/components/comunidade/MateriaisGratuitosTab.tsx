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

// Cor por tipo de material — tons harmônicos dentro da paleta da marca
// (verdes/oliva/terra). Cada categoria ganha uma identidade sutil.
const categoriaColor: Record<string, string> = {
  guias: "#5C6F1D",          // verde-brand escuro
  templates: "#7C8E2F",      // verde médio
  prompts: "#9EB038",        // verde claro (símbolo)
  ferramentas: "#4A5A17",    // verde profundo
  checklists: "#8A7B2E",     // oliva/dourado
  ebooks: "#6B7F3A",         // musgo
  newsletter: "#A8924B",     // terra/areia
  materiais_aula: "#7C8E2F",
};
const corDe = (cat: string) => categoriaColor[cat] || "#5C6F1D";
const rgba = (hex: string, a: number) => {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
};

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

      {/* Grid de cards — menores, mais colunas, cor por tipo */}
      {!isLoading && filtered.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {filtered.map((material) => {
            const Icon = categoriaIconMap[material.categoria] || FileText;
            const links = getLinksUrls(material.links_url);
            const arquivos = getArquivoUrls(material.arquivos_url);
            const primaryUrl = material.url || links[0];
            const hasFiles = arquivos.length > 0;
            const hasAnyContent = !!primaryUrl || hasFiles || !!material.descricao;
            const cor = corDe(material.categoria);

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
                style={{ backgroundColor: rgba(cor, 0.07), borderColor: rgba(cor, 0.22) }}
                className={cn(
                  "group flex flex-col gap-2.5 rounded-2xl border p-4 transition-all duration-200",
                  hasAnyContent && "cursor-pointer hover:shadow-lg hover:shadow-foreground/5 hover:-translate-y-0.5"
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div
                    className="h-9 w-9 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: rgba(cor, 0.15) }}
                  >
                    <Icon className="h-[18px] w-[18px]" style={{ color: cor }} />
                  </div>
                  <span
                    className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium capitalize"
                    style={{ backgroundColor: rgba(cor, 0.12), color: cor }}
                  >
                    {categoriaLabel(material.categoria)}
                  </span>
                </div>

                <div className="flex-1">
                  <h3 className="font-medium text-sm text-foreground leading-snug line-clamp-2">
                    {material.titulo}
                  </h3>
                </div>

                {/* Ações compactas */}
                <div className="flex items-center gap-1.5 mt-auto">
                  {primaryUrl && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAccessClick(material);
                        window.open(primaryUrl, "_blank", "noopener,noreferrer");
                      }}
                      style={{ backgroundColor: cor }}
                      className="inline-flex items-center gap-1 rounded-full text-white px-3 py-1 text-[11px] font-medium hover:opacity-90 transition-opacity"
                    >
                      <ExternalLink className="h-3 w-3" />
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
                      style={{ borderColor: rgba(cor, 0.3), color: cor }}
                      className="inline-flex items-center gap-1 rounded-full border bg-background/60 px-3 py-1 text-[11px] font-medium hover:bg-background transition-colors"
                    >
                      <Download className="h-3 w-3" />
                      Baixar
                    </button>
                  )}
                  {!primaryUrl && !hasFiles && material.descricao && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium" style={{ color: cor }}>
                      Ver detalhes <ArrowUpRight className="h-3 w-3" />
                    </span>
                  )}
                  {!hasAnyContent && (
                    <span className="text-[11px] text-muted-foreground">Em breve</span>
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
