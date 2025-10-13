import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { CopyButton } from "@/components/shared/CopyButton";
import { usePrompts } from "@/hooks/useFerramentas";
import { MessageSquare, Search, Cpu } from "lucide-react";

export default function BibliotecaPrompts() {
  const { data: prompts, isLoading } = usePrompts();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategoria, setSelectedCategoria] = useState<string | null>(null);

  const categorias = prompts
    ? Array.from(new Set(prompts.map((p) => p.categoria)))
    : [];

  const filteredPrompts = prompts?.filter((prompt) => {
    const matchesSearch =
      prompt.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prompt.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prompt.prompt.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategoria =
      !selectedCategoria || prompt.categoria === selectedCategoria;
    return matchesSearch && matchesCategoria;
  });

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

      <div className="flex gap-2 flex-wrap mb-6">
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

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-32 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredPrompts && filteredPrompts.length > 0 ? (
        <div className="space-y-4">
          {filteredPrompts.map((prompt) => (
            <Card key={prompt.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-xl mb-2">{prompt.titulo}</CardTitle>
                    <CardDescription>{prompt.descricao}</CardDescription>
                  </div>
                  <Badge variant="secondary">{prompt.categoria}</Badge>
                </div>
                {Array.isArray(prompt.tags) && prompt.tags.length > 0 && (
                  <div className="flex gap-2 flex-wrap mt-2">
                    {prompt.tags.map((tag: string, index: number) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                      ))}
                    </div>
                  )}

                  {Array.isArray(prompt.ferramentas_recomendadas) && 
                   prompt.ferramentas_recomendadas.length > 0 && (
                    <div className="mt-3 pt-3 border-t">
                      <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                        <Cpu className="w-3 h-3" />
                        Ferramentas onde aplicar:
                      </p>
                      <div className="flex gap-2 flex-wrap">
                        {prompt.ferramentas_recomendadas.map((ferramenta: string) => (
                          <Badge 
                            key={ferramenta} 
                            variant="default" 
                            className="text-xs bg-primary/10 text-primary hover:bg-primary/20"
                          >
                            {ferramenta}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardHeader>
                <CardContent className="space-y-4">
                <div className="bg-muted p-4 rounded-md">
                  <pre className="text-sm whitespace-pre-wrap font-mono">
                    {prompt.prompt}
                  </pre>
                </div>
                <CopyButton
                  content={prompt.prompt}
                  variant="default"
                  size="default"
                  className="w-full"
                />
              </CardContent>
            </Card>
          ))}
        </div>
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
