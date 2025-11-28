import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { TrilhaCard } from "@/components/shared/TrilhaCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useContentVisibility } from "@/hooks/useContentVisibility";

export default function Trilhas() {
  const [trilhasVisiveis, setTrilhasVisiveis] = useState(3);
  const { isVisitante, isLoading: loadingRole } = useContentVisibility();

  const { data: trilhas, isLoading } = useQuery({
    queryKey: ["trilhas", isVisitante],
    queryFn: async () => {
      let query = supabase
        .from("trilhas")
        .select("*")
        .eq("ativo", true)
        .order("ordem");
      
      if (isVisitante) {
        query = query.eq("visivel_visitantes", true);
      } else {
        query = query.eq("visivel_mentorados", true);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data;
    },
    enabled: !loadingRole,
  });

  const trilhasPorNivel = {
    todos: trilhas || [],
    iniciante: trilhas?.filter(t => t.nivel === "iniciante") || [],
    intermediario: trilhas?.filter(t => t.nivel === "intermediario") || [],
    avancado: trilhas?.filter(t => t.nivel === "avancado") || [],
  };

  // Limitar número de trilhas visíveis
  const trilhasVisiveisComModulos = trilhasPorNivel.todos.slice(0, trilhasVisiveis);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="container py-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Trilhas de Aprendizado</h1>
          <p className="text-muted-foreground">
            Explore os cursos organizados por nível de dificuldade
          </p>
        </div>

        <Tabs defaultValue="todos" className="w-full" onValueChange={() => setTrilhasVisiveis(3)}>
          <TabsList className="w-full justify-start bg-transparent border-b border-zinc-200 dark:border-zinc-700 rounded-none p-0 h-auto">
            <TabsTrigger 
              value="todos"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary px-4 py-2"
            >
              Todos
            </TabsTrigger>
            <TabsTrigger 
              value="iniciante"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary px-4 py-2"
            >
              Iniciante
            </TabsTrigger>
            <TabsTrigger 
              value="intermediario"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary px-4 py-2"
            >
              Intermediário
            </TabsTrigger>
            <TabsTrigger 
              value="avancado"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary px-4 py-2"
            >
              Avançado
            </TabsTrigger>
          </TabsList>

          <TabsContent value="todos" className="mt-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {trilhasVisiveisComModulos.map((trilha) => (
                <TrilhaCard
                  key={trilha.id}
                  id={trilha.id}
                  titulo={trilha.titulo}
                  imagem_url={trilha.imagem_url}
                  visivel_apenas_pro={trilha.visivel_apenas_pro}
                />
              ))}
            </div>

            {trilhasVisiveis < trilhasPorNivel.todos.length && (
              <div className="flex justify-center mt-12">
                <Button 
                  variant="outline" 
                  size="lg"
                  onClick={() => setTrilhasVisiveis(prev => prev + 3)}
                  className="min-w-[200px]"
                >
                  Ver Mais Trilhas ({trilhasPorNivel.todos.length - trilhasVisiveis} restantes)
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="iniciante" className="mt-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {trilhasPorNivel.iniciante.map((trilha) => (
                <TrilhaCard
                  key={trilha.id}
                  id={trilha.id}
                  titulo={trilha.titulo}
                  imagem_url={trilha.imagem_url}
                  visivel_apenas_pro={trilha.visivel_apenas_pro}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="intermediario" className="mt-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {trilhasPorNivel.intermediario.map((trilha) => (
                <TrilhaCard
                  key={trilha.id}
                  id={trilha.id}
                  titulo={trilha.titulo}
                  imagem_url={trilha.imagem_url}
                  visivel_apenas_pro={trilha.visivel_apenas_pro}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="avancado" className="mt-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {trilhasPorNivel.avancado.map((trilha) => (
                <TrilhaCard
                  key={trilha.id}
                  id={trilha.id}
                  titulo={trilha.titulo}
                  imagem_url={trilha.imagem_url}
                  visivel_apenas_pro={trilha.visivel_apenas_pro}
                />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}