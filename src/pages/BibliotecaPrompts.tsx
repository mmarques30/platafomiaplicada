import { useState, useMemo, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { usePrompts } from "@/hooks/useFerramentas";
import { usePromptCopyLogger } from "@/hooks/usePromptCopyLogger";
import { MessageSquare } from "lucide-react";
import { PromptRow } from "@/components/bibliotecas/PromptRow";
import { BarraFiltros } from "@/components/bibliotecas/BarraFiltros";
import { ListaRecursos } from "@/components/bibliotecas/LinhaRecurso";
import { PromptDetalhesModal } from "@/components/bibliotecas/PromptDetalhesModal";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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


  return (
    <PageContainer>
      <PageTitle
        primary="Biblioteca"
        secondary="de prompts"
        eyebrow="Recursos"
        description="Prompts testados e prontos para copiar, organizados por objetivo e por ferramenta."
      />

      <BarraFiltros
        busca={searchTerm}
        aoBuscar={setSearchTerm}
        placeholderBusca="Buscar prompts"
        total={filteredPrompts?.length}
        substantivo="prompt"
        filtros={[
          {
            chave: "categoria",
            rotuloVazio: "Categoria",
            rotuloLista: "Todas as categorias",
            valor: filtroCategoria,
            valorVazio: "todas",
            opcoes: categorias,
            aoMudar: setFiltroCategoria,
          },
          {
            chave: "nivel",
            rotuloVazio: "Nível",
            rotuloLista: "Todos os níveis",
            valor: filtroNivel,
            valorVazio: "todos",
            opcoes: ["iniciante", "intermediario", "avancado"],
            aoMudar: setFiltroNivel,
            formatar: (n) =>
              ({ iniciante: "Iniciante", intermediario: "Intermediário", avancado: "Avançado" })[n] ?? n,
          },
          ...(tags.length > 0
            ? [
                {
                  chave: "tag",
                  rotuloVazio: "Tag",
                  rotuloLista: "Todas as tags",
                  valor: filtroTag,
                  valorVazio: "todas",
                  opcoes: tags.map(String),
                  aoMudar: setFiltroTag,
                },
              ]
            : []),
          ...(ferramentas.length > 0
            ? [
                {
                  chave: "ferramenta",
                  rotuloVazio: "Ferramenta",
                  rotuloLista: "Todas as ferramentas",
                  valor: filtroFerramenta,
                  valorVazio: "todas",
                  opcoes: ferramentas.map(String),
                  aoMudar: setFiltroFerramenta,
                },
              ]
            : []),
        ]}
      />

      {/* Lista de Prompts */}
      {isLoading ? (
        <div className="flex flex-col gap-2">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-[86px] rounded-[20px]" />
          ))}
        </div>
      ) : filteredPrompts && filteredPrompts.length > 0 ? (
        <>
          <ListaRecursos>
            {visiblePrompts.map((prompt) => (
              <PromptRow
                key={prompt.id}
                prompt={prompt}
                onClick={() => setPromptSelecionado(prompt)}
                onQuickCopy={() => handleQuickCopy(prompt as PromptLike)}
                justCopied={copiedId === prompt.id}
              />
            ))}
          </ListaRecursos>

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

      {/* A contagem vive na barra de filtros, que é onde ela responde a
          quem acabou de mexer num filtro. Repeti-la no rodapé só somava
          ruído. */}
    </PageContainer>
  );
}
