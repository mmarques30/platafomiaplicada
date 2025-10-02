import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen } from "lucide-react";
import { Link } from "react-router-dom";

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

  const getNivelColor = (nivel: string) => {
    switch (nivel) {
      case "iniciante":
        return "bg-green-500";
      case "intermediario":
        return "bg-yellow-500";
      case "avancado":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const trilhasPorNivel = {
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
      <Navbar />
      
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
              {trilhas?.map((trilha) => (
                <Card key={trilha.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="line-clamp-2">{trilha.titulo}</CardTitle>
                      <Badge className={getNivelColor(trilha.nivel)}>
                        {trilha.nivel}
                      </Badge>
                    </div>
                    <CardDescription className="line-clamp-3">
                      {trilha.descricao}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <BookOpen className="h-4 w-4 mr-2" />
                      {trilha.cursos?.[0]?.count || 0} cursos
                    </div>
                    <Link to={`/trilhas/${trilha.id}`}>
                      <Button className="w-full">Ver Trilha</Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="iniciante" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {trilhasPorNivel.iniciante.map((trilha) => (
                <Card key={trilha.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="line-clamp-2">{trilha.titulo}</CardTitle>
                    <CardDescription className="line-clamp-3">
                      {trilha.descricao}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <BookOpen className="h-4 w-4 mr-2" />
                      {trilha.cursos?.[0]?.count || 0} cursos
                    </div>
                    <Link to={`/trilhas/${trilha.id}`}>
                      <Button className="w-full">Ver Trilha</Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="intermediario" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {trilhasPorNivel.intermediario.map((trilha) => (
                <Card key={trilha.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="line-clamp-2">{trilha.titulo}</CardTitle>
                    <CardDescription className="line-clamp-3">
                      {trilha.descricao}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <BookOpen className="h-4 w-4 mr-2" />
                      {trilha.cursos?.[0]?.count || 0} cursos
                    </div>
                    <Link to={`/trilhas/${trilha.id}`}>
                      <Button className="w-full">Ver Trilha</Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="avancado" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {trilhasPorNivel.avancado.map((trilha) => (
                <Card key={trilha.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="line-clamp-2">{trilha.titulo}</CardTitle>
                    <CardDescription className="line-clamp-3">
                      {trilha.descricao}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <BookOpen className="h-4 w-4 mr-2" />
                      {trilha.cursos?.[0]?.count || 0} cursos
                    </div>
                    <Link to={`/trilhas/${trilha.id}`}>
                      <Button className="w-full">Ver Trilha</Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}