import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { usePrompts } from "@/hooks/useFerramentas";
import { MessageSquare, Search } from "lucide-react";
import { PromptCard } from "@/components/bibliotecas/PromptCard";
import { PromptDetalhesModal } from "@/components/bibliotecas/PromptDetalhesModal";

export default function BibliotecaPrompts() {
  const { data: prompts, isLoading } = usePrompts();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategoria, setSelectedCategoria] = useState<string | null>(null);
  const [selectedNivel, setSelectedNivel] = useState<string | null>(null);
  const [promptSelecionado, setPromptSelecionado] = useState<any>(null);

  const categorias = prompts
    ? Array.from(new Set(prompts.map((p) => p.categoria)))
    : [];

  const niveis = prompts
    ? Array.from(new Set(prompts.map((p) => p.nivel_complexidade).filter(Boolean)))
    : [];

  const filteredPrompts = prompts?.filter((prompt) => {
    const matchesSearch =
      prompt.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prompt.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prompt.prompt.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategoria =
      !selectedCategoria || prompt.categoria === selectedCategoria;
    const matchesNivel = 
      !selectedNivel || prompt.nivel_complexidade === selectedNivel;
    return matchesSearch && matchesCategoria && matchesNivel;
  }).sort((a, b) => (a.ordem ?? 999) - (b.ordem ?? 999));

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3 mb-8">
        <MessageSquare className="w-8 h-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Biblioteca de Prompts</h1>
          <p className="text-muted-foreground">
            Prompts prontos para cada tipo de situação
          </p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Buscar prompts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="space-y-3 mb-6">
        <div>
          <p className="text-sm font-medium mb-2">Filtrar por Categoria:</p>
          <div className="flex gap-2 flex-wrap">
            <Badge
              variant={selectedCategoria === null ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => setSelectedCategoria(null)}
            >
              Todas
            </Badge>
            {categorias.map((categoria) => (
              <Badge
                key={categoria}
                variant={selectedCategoria === categoria ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => setSelectedCategoria(categoria)}
              >
                {categoria}
              </Badge>
            ))}
          </div>
        </div>

        <div>
          <p className="text-sm font-medium mb-2">Filtrar por Nível:</p>
          <div className="flex gap-2 flex-wrap">
            <Badge
              variant={selectedNivel === null ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => setSelectedNivel(null)}
            >
              Todos os Níveis
            </Badge>
            <Badge
              variant={selectedNivel === 'iniciante' ? "default" : "outline"}
              className="cursor-pointer bg-green-500 text-white hover:bg-green-600"
              onClick={() => setSelectedNivel('iniciante')}
            >
              Iniciante
            </Badge>
            <Badge
              variant={selectedNivel === 'intermediario' ? "default" : "outline"}
              className="cursor-pointer bg-yellow-500 text-white hover:bg-yellow-600"
              onClick={() => setSelectedNivel('intermediario')}
            >
              Intermediário
            </Badge>
            <Badge
              variant={selectedNivel === 'avancado' ? "default" : "outline"}
              className="cursor-pointer bg-red-500 text-white hover:bg-red-600"
              onClick={() => setSelectedNivel('avancado')}
            >
              Avançado
            </Badge>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="h-[240px]">
              <CardContent className="p-5 flex flex-col gap-3">
                <Skeleton className="h-14 w-14 rounded-xl" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-9 w-full mt-auto" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredPrompts && filteredPrompts.length > 0 ? (
        <>
          {/* Contador de Resultados */}
          <p className="text-sm text-muted-foreground mb-4">
            Mostrando {filteredPrompts.length} {filteredPrompts.length === 1 ? 'prompt' : 'prompts'}
          </p>
          
          {/* Grid de Cards Compactos */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPrompts.map((prompt) => (
              <PromptCard 
                key={prompt.id} 
                prompt={prompt}
                onVerMais={() => setPromptSelecionado(prompt)}
              />
            ))}
          </div>
          
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
