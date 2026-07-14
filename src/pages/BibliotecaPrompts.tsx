import { useState, useMemo, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { usePrompts } from "@/hooks/useFerramentas";
import { usePromptCopyLogger } from "@/hooks/usePromptCopyLogger";
import { MessageSquare, Search, ListChecks, Copy, Download, X } from "lucide-react";
import { PromptRow } from "@/components/bibliotecas/PromptRow";
import { PromptDetalhesModal } from "@/components/bibliotecas/PromptDetalhesModal";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PageTitle } from "@/components/shared/PageTitle";
import { PageContainer } from "@/components/shared/PageContainer";
import { toast } from "sonner";

type PromptLike = {
  id: string;
  titulo: string;
  descricao: string;
  categoria: string;
  nivel_complexidade: string | null;
  prompt: string;
  tags?: unknown;
  ferramentas_recomendadas?: unknown;
};

const asArray = (v: unknown): string[] => (Array.isArray(v) ? (v as string[]) : []);

function buildExportContent(list: PromptLike[], format: "md" | "txt" | "csv"): string {
  if (format === "csv") {
    const esc = (s: string) => `"${String(s ?? "").replace(/"/g, '""')}"`;
    const header = ["titulo", "categoria", "nivel", "ferramentas", "descricao", "prompt"].join(",");
    const rows = list.map((p) =>
      [
        esc(p.titulo),
        esc(p.categoria),
        esc(p.nivel_complexidade ?? ""),
        esc(asArray(p.ferramentas_recomendadas).join(" | ")),
        esc(p.descricao),
        esc(p.prompt),
      ].join(",")
    );
    return [header, ...rows].join("\n");
  }

  if (format === "md") {
    const blocks = list.map((p) => {
      const ferr = asArray(p.ferramentas_recomendadas);
      const meta = [`**Categoria:** ${p.categoria}`, p.nivel_complexidade ? `**Nível:** ${p.nivel_complexidade}` : null]
        .filter(Boolean)
        .join(" · ");
      const ferrLine = ferr.length ? `\n\n**Ferramentas:** ${ferr.join(", ")}` : "";
      return `## ${p.titulo}\n\n${meta}${ferrLine}\n\n${p.descricao}\n\n\`\`\`\n${p.prompt}\n\`\`\``;
    });
    return `# Biblioteca de Prompts — IAplicada\n\n${blocks.join("\n\n---\n\n")}\n`;
  }

  // txt
  const blocks = list.map((p) => {
    const ferr = asArray(p.ferramentas_recomendadas);
    const meta = `Categoria: ${p.categoria}${p.nivel_complexidade ? ` | Nível: ${p.nivel_complexidade}` : ""}${
      ferr.length ? ` | Ferramentas: ${ferr.join(", ")}` : ""
    }`;
    return `${p.titulo}\n${"=".repeat(Math.min(p.titulo.length, 60))}\n${meta}\n\n${p.descricao}\n\n${p.prompt}`;
  });
  return `BIBLIOTECA DE PROMPTS — IAplicada\n\n${blocks.join("\n\n----------------------------------------\n\n")}\n`;
}

function downloadFile(filename: string, content: string, mime: string) {
  const blob = new Blob([content], { type: `${mime};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export default function BibliotecaPrompts() {
  const { data: prompts, isLoading } = usePrompts();
  const { logPromptCopy } = usePromptCopyLogger();
  const [searchTerm, setSearchTerm] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState("todas");
  const [filtroNivel, setFiltroNivel] = useState("todos");
  const [filtroTag, setFiltroTag] = useState("todas");
  const [filtroFerramenta, setFiltroFerramenta] = useState("todas");
  const [promptSelecionado, setPromptSelecionado] = useState<any>(null);
  const [itemsToShow, setItemsToShow] = useState(10);
  const [modoSelecao, setModoSelecao] = useState(false);
  const [selecionados, setSelecionados] = useState<Set<string>>(new Set());
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Extrair valores únicos para os dropdowns
  const categorias = useMemo(() => 
    prompts ? Array.from(new Set(prompts.map((p) => p.categoria))) : []
  , [prompts]);

  const tags = useMemo(() => {
    if (!prompts) return [];
    const allTags = prompts.flatMap((p) => (Array.isArray(p.tags) ? p.tags : []) as string[]);
    return Array.from(new Set(allTags));
  }, [prompts]);

  const ferramentas = useMemo(() => {
    if (!prompts) return [];
    const allFerramentas = prompts.flatMap((p) => (Array.isArray(p.ferramentas_recomendadas) ? p.ferramentas_recomendadas : []) as string[]);
    return Array.from(new Set(allFerramentas));
  }, [prompts]);

  // Filtrar prompts
  const filteredPrompts = useMemo(() => {
    return prompts?.filter((prompt) => {
      const matchesSearch =
        prompt.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prompt.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prompt.prompt.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategoria =
        filtroCategoria === "todas" || prompt.categoria === filtroCategoria;
      
      const matchesNivel =
        filtroNivel === "todos" || prompt.nivel_complexidade === filtroNivel;
      
      const matchesTag =
        filtroTag === "todas" || 
        (Array.isArray(prompt.tags) && (prompt.tags as string[]).includes(filtroTag));
      
      const matchesFerramenta =
        filtroFerramenta === "todas" || 
        (Array.isArray(prompt.ferramentas_recomendadas) && (prompt.ferramentas_recomendadas as string[]).includes(filtroFerramenta));
      
      return matchesSearch && matchesCategoria && matchesNivel && 
             matchesTag && matchesFerramenta;
    }).sort((a, b) => (a.ordem ?? 999) - (b.ordem ?? 999));
  }, [prompts, searchTerm, filtroCategoria, filtroNivel, filtroTag, filtroFerramenta]);

  const visiblePrompts = useMemo(() => {
    return filteredPrompts?.slice(0, itemsToShow) || [];
  }, [filteredPrompts, itemsToShow]);

  useEffect(() => {
    setItemsToShow(10);
  }, [searchTerm, filtroCategoria, filtroNivel, filtroTag, filtroFerramenta]);

  const toggleSelecionado = (id: string) => {
    setSelecionados((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const todosFiltradosSelecionados =
    (filteredPrompts?.length ?? 0) > 0 && (filteredPrompts?.every((p) => selecionados.has(p.id)) ?? false);

  const toggleSelecionarTodos = () => {
    if (todosFiltradosSelecionados) {
      setSelecionados(new Set());
    } else {
      setSelecionados(new Set((filteredPrompts ?? []).map((p) => p.id)));
    }
  };

  const promptsSelecionados = useMemo(
    () => (filteredPrompts ?? []).filter((p) => selecionados.has(p.id)),
    [filteredPrompts, selecionados]
  );

  const handleQuickCopy = async (p: PromptLike) => {
    try {
      await navigator.clipboard.writeText(p.prompt);
      logPromptCopy(p.id, p.titulo);
      setCopiedId(p.id);
      setTimeout(() => setCopiedId((cur) => (cur === p.id ? null : cur)), 1500);
      toast.success("Prompt copiado!");
    } catch {
      toast.error("Não foi possível copiar");
    }
  };

  const alvoExport = (): PromptLike[] =>
    promptsSelecionados.length > 0 ? (promptsSelecionados as PromptLike[]) : ((filteredPrompts ?? []) as PromptLike[]);

  const handleCopiarLote = async () => {
    const list = alvoExport();
    if (list.length === 0) return;
    try {
      await navigator.clipboard.writeText(buildExportContent(list, "txt"));
      list.forEach((p) => logPromptCopy(p.id, p.titulo));
      toast.success(`${list.length} ${list.length === 1 ? "prompt copiado" : "prompts copiados"}!`);
    } catch {
      toast.error("Não foi possível copiar");
    }
  };

  const handleDownload = (format: "md" | "txt" | "csv") => {
    const list = alvoExport();
    if (list.length === 0) {
      toast.error("Nenhum prompt para exportar");
      return;
    }
    const ext = format;
    const mime = format === "csv" ? "text/csv" : format === "md" ? "text/markdown" : "text/plain";
    downloadFile(`prompts-iaplicada.${ext}`, buildExportContent(list, format), mime);
    list.forEach((p) => logPromptCopy(p.id, p.titulo));
    toast.success(`${list.length} ${list.length === 1 ? "prompt exportado" : "prompts exportados"} (.${ext})`);
  };

  const qtdAlvo = promptsSelecionados.length > 0 ? promptsSelecionados.length : filteredPrompts?.length ?? 0;
  const rotuloAlvo = promptsSelecionados.length > 0 ? "selecionados" : "filtrados";

  return (
    <PageContainer>
      <PageTitle primary="Biblioteca" secondary="de prompts" eyebrow="Recursos" />

      {/* Barra de Busca e Filtros Dropdown */}
      <div className="flex flex-col md:flex-row gap-3">
        {/* Campo de Busca */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar prompts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Filtro Categoria */}
        <Select value={filtroCategoria} onValueChange={setFiltroCategoria}>
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Todas Categorias</SelectItem>
            {categorias.map((categoria) => (
              <SelectItem key={categoria} value={categoria}>
                {categoria}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Filtro Nível */}
        <Select value={filtroNivel} onValueChange={setFiltroNivel}>
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Nível" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os Níveis</SelectItem>
            <SelectItem value="iniciante">Iniciante</SelectItem>
            <SelectItem value="intermediario">Intermediário</SelectItem>
            <SelectItem value="avancado">Avançado</SelectItem>
          </SelectContent>
        </Select>

        {/* Filtro Tag */}
        {tags.length > 0 && (
          <Select value={filtroTag} onValueChange={setFiltroTag}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Tag" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas as Tags</SelectItem>
              {tags.map((tag) => (
                <SelectItem key={String(tag)} value={String(tag)}>
                  {String(tag)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {/* Filtro Ferramenta */}
        {ferramentas.length > 0 && (
          <Select value={filtroFerramenta} onValueChange={setFiltroFerramenta}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Ferramenta" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas Ferramentas</SelectItem>
              {ferramentas.map((ferramenta) => (
                <SelectItem key={String(ferramenta)} value={String(ferramenta)}>
                  {String(ferramenta)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Barra de exportação em lote */}
      {!isLoading && filteredPrompts && filteredPrompts.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-brand-hairline bg-brand-cream-soft px-3 py-2">
          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant={modoSelecao ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setModoSelecao((v) => !v);
                if (modoSelecao) setSelecionados(new Set());
              }}
              className={modoSelecao ? "bg-brand-strong text-brand-cream hover:bg-brand-strong/90" : ""}
            >
              <ListChecks className="w-4 h-4 mr-2" />
              {modoSelecao ? "Sair da seleção" : "Selecionar"}
            </Button>

            {modoSelecao && (
              <>
                <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
                  <Checkbox checked={todosFiltradosSelecionados} onCheckedChange={toggleSelecionarTodos} />
                  Selecionar todos
                </label>
                <span className="text-sm text-muted-foreground">
                  {selecionados.size} {selecionados.size === 1 ? "selecionado" : "selecionados"}
                </span>
                {selecionados.size > 0 && (
                  <button
                    type="button"
                    onClick={() => setSelecionados(new Set())}
                    className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
                  >
                    <X className="w-3 h-3" /> limpar
                  </button>
                )}
              </>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleCopiarLote}>
              <Copy className="w-4 h-4 mr-2" />
              Copiar {rotuloAlvo}
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Exportar {rotuloAlvo} ({qtdAlvo})
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleDownload("md")}>Markdown (.md)</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleDownload("txt")}>Texto (.txt)</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleDownload("csv")}>Planilha (.csv)</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      )}

      {/* Contador de Resultados */}
      {!isLoading && filteredPrompts && (
        <p className="text-sm text-muted-foreground">
          Mostrando {visiblePrompts.length} de {filteredPrompts.length} {filteredPrompts.length === 1 ? 'prompt' : 'prompts'}
        </p>
      )}

      {/* Lista de Prompts */}
      {isLoading ? (
        <Card>
          <CardContent className="p-0">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="flex items-center gap-4 p-4 border-b last:border-b-0">
                <Skeleton className="h-12 w-12 rounded-lg flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                </div>
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-8 w-8" />
              </div>
            ))}
          </CardContent>
        </Card>
      ) : filteredPrompts && filteredPrompts.length > 0 ? (
        <>
          <Card>
            <CardContent className="p-0">
              {visiblePrompts.map((prompt) => (
                <PromptRow
                  key={prompt.id}
                  prompt={prompt}
                  onClick={() => setPromptSelecionado(prompt)}
                  selectable={modoSelecao}
                  selected={selecionados.has(prompt.id)}
                  onToggleSelect={() => toggleSelecionado(prompt.id)}
                  onQuickCopy={() => handleQuickCopy(prompt as PromptLike)}
                  justCopied={copiedId === prompt.id}
                />
              ))}
            </CardContent>
          </Card>

          {/* Botão Ver Mais */}
          {filteredPrompts && visiblePrompts.length < filteredPrompts.length && (
            <div className="flex justify-center mt-6">
              <Button 
                variant="outline" 
                size="lg"
                onClick={() => setItemsToShow(prev => prev + 10)}
                className="min-w-[200px]"
              >
                Ver Mais ({filteredPrompts.length - visiblePrompts.length} restantes)
              </Button>
            </div>
          )}

          {/* Modal de Detalhes */}
          <PromptDetalhesModal
            prompt={promptSelecionado}
            onClose={() => setPromptSelecionado(null)}
          />
        </>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <MessageSquare className="w-12 h-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Nenhum prompt encontrado</p>
          </CardContent>
        </Card>
      )}
    </PageContainer>
  );
}
