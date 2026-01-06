import { useState, useMemo, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { usePrompts } from "@/hooks/useFerramentas";
import { MessageSquare, Search } from "lucide-react";
import { PromptRow } from "@/components/bibliotecas/PromptRow";
import { PromptDetalhesModal } from "@/components/bibliotecas/PromptDetalhesModal";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageTitle } from "@/components/shared/PageTitle";

export default function BibliotecaPrompts() {
  const { data: prompts, isLoading } = usePrompts();
  const [searchTerm, setSearchTerm] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState("todas");
  const [filtroNivel, setFiltroNivel] = useState("todos");
  const [filtroTag, setFiltroTag] = useState("todas");
  const [filtroFerramenta, setFiltroFerramenta] = useState("todas");
  const [promptSelecionado, setPromptSelecionado] = useState<any>(null);
  const [itemsToShow, setItemsToShow] = useState(10);

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

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-4 md:space-y-6">
      {/* Header */}
      <PageTitle primary="Biblioteca" secondary="de Prompts" />

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
    </div>
  );
}
