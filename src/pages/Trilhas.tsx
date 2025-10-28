import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { TrilhaCard } from "@/components/shared/TrilhaCard";
import { ModuloCard } from "@/components/shared/ModuloCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";

const formatDuracao = (minutos: number): string => {
  const horas = Math.floor(minutos / 60);
  const mins = minutos % 60;
  if (horas === 0) return `${mins}min`;
  if (mins === 0) return `${horas}h`;
  return `${horas}h${mins.toString().padStart(2, '0')}min`;
};

export default function Trilhas() {
  const [trilhasVisiveis, setTrilhasVisiveis] = useState(3);

  const { data: trilhas, isLoading } = useQuery({
    queryKey: ["trilhas-com-modulos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("trilhas")
        .select(`
          *,
          modulos:modulos(
            id,
            titulo,
            descricao,
            ordem,
            categoria,
            imagem_url
          )
        `)
        .eq("ativo", true)
        .eq("visivel_mentorados", true)
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
          <TabsList>
            <TabsTrigger value="todos">Todos</TabsTrigger>
            <TabsTrigger value="iniciante">Iniciante</TabsTrigger>
            <TabsTrigger value="intermediario">Intermediário</TabsTrigger>
            <TabsTrigger value="avancado">Avançado</TabsTrigger>
          </TabsList>

          <TabsContent value="todos" className="mt-6">
            <div className="space-y-12">
              {trilhasVisiveisComModulos.map((trilha) => (
                <div key={trilha.id} className="space-y-6">
                  {/* Título da Trilha */}
                  <div>
                    <h2 className="text-2xl font-bold uppercase tracking-wide mb-2">
                      {trilha.titulo}
                    </h2>
                    {trilha.descricao && (
                      <p className="text-muted-foreground">
                        {trilha.descricao}
                        {trilha.duracao_estimada && (
                          <span> • {formatDuracao(trilha.duracao_estimada)}</span>
                        )}
                      </p>
                    )}
                  </div>

                  {/* Grid de Módulos */}
                  {trilha.modulos && trilha.modulos.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                      {trilha.modulos.map((modulo: any) => (
                        <ModuloCard
                          key={modulo.id}
                          trilhaId={trilha.id}
                          moduloId={modulo.id}
                          titulo={modulo.titulo}
                          descricao={modulo.descricao}
                          imagem_url={modulo.imagem_url || trilha.imagem_url}
                        />
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground italic">
                      Nenhum módulo disponível nesta trilha.
                    </p>
                  )}
                </div>
                ))}
              
              {/* Botão Ver Mais Trilhas */}
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
            </div>
          </TabsContent>

          <TabsContent value="iniciante" className="mt-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
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
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
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
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
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