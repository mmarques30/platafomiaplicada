import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { TrilhaCard } from "@/components/shared/TrilhaCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Trilhas() {
  const { data: trilhas, isLoading } = useQuery({
    queryKey: ["trilhas"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("trilhas")
        .select(`
          *,
          cursos:cursos(count)
        `)
        .eq("ativo", true)
        .order("ordem");
      
      if (error) throw error;
      return data;
    },
  });

  const trilhasPorNivel = {
    todos: trilhas || [],
    iniciante: trilhas?.filter(t => t.nivel === "iniciante") || [],
    intermediario: trilhas?.filter(t => t.nivel === "intermediario") || [],
    avancado: trilhas?.filter(t => t.nivel === "avancado") || [],
  };

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

        <Tabs defaultValue="todos" className="w-full">
          <TabsList>
            <TabsTrigger value="todos">Todos</TabsTrigger>
            <TabsTrigger value="iniciante">Iniciante</TabsTrigger>
            <TabsTrigger value="intermediario">Intermediário</TabsTrigger>
            <TabsTrigger value="avancado">Avançado</TabsTrigger>
          </TabsList>

          <TabsContent value="todos" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {trilhasPorNivel.todos.map((trilha) => (
                <TrilhaCard
                  key={trilha.id}
                  id={trilha.id}
                  titulo={trilha.titulo}
                  imagem_url={trilha.imagem_url}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="iniciante" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {trilhasPorNivel.iniciante.map((trilha) => (
                <TrilhaCard
                  key={trilha.id}
                  id={trilha.id}
                  titulo={trilha.titulo}
                  imagem_url={trilha.imagem_url}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="intermediario" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {trilhasPorNivel.intermediario.map((trilha) => (
                <TrilhaCard
                  key={trilha.id}
                  id={trilha.id}
                  titulo={trilha.titulo}
                  imagem_url={trilha.imagem_url}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="avancado" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {trilhasPorNivel.avancado.map((trilha) => (
                <TrilhaCard
                  key={trilha.id}
                  id={trilha.id}
                  titulo={trilha.titulo}
                  imagem_url={trilha.imagem_url}
                />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}