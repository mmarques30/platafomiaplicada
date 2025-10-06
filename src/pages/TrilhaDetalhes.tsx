import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BookOpen, Play, Clock } from "lucide-react";

export default function TrilhaDetalhes() {
  const { id } = useParams();

  const { data: trilha, isLoading } = useQuery({
    queryKey: ["trilha", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("trilhas")
        .select(`
          *,
          cursos:cursos(
            *,
            modulos:modulos(
              *,
              videos:videos(*)
            )
          )
        `)
        .eq("id", id)
        .single();
      
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!trilha) {
    return <div>Trilha não encontrada</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container py-6">
        <Link to="/trilhas">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para Trilhas
          </Button>
        </Link>

        {trilha.imagem_url && (
          <div className="w-full h-64 rounded-lg overflow-hidden mb-6">
            <img 
              src={trilha.imagem_url} 
              alt={trilha.titulo}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="mb-8">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">{trilha.titulo}</h1>
              <p className="text-muted-foreground">{trilha.descricao}</p>
            </div>
            <Badge>{trilha.nivel}</Badge>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-bold flex items-center">
            <BookOpen className="h-6 w-6 mr-2" />
            Cursos ({trilha.cursos?.length || 0})
          </h2>

          <Accordion type="single" collapsible className="w-full">
            {trilha.cursos?.map((curso, index) => (
              <AccordionItem key={curso.id} value={`curso-${curso.id}`}>
                <AccordionTrigger className="text-left">
                  <div className="flex items-start gap-4 w-full">
                    <Badge variant="outline" className="mt-0.5">{index + 1}</Badge>
                    <div className="flex-1">
                      <h3 className="font-semibold">{curso.titulo}</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {curso.modulos?.length || 0} módulos
                      </p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="pl-12 space-y-3">
                    <p className="text-muted-foreground mb-4">{curso.descricao}</p>
                    
                    {curso.modulos?.map((modulo, modIndex) => (
                      <Card key={modulo.id}>
                        <CardHeader>
                          <CardTitle className="text-base flex items-center gap-2">
                            <Badge variant="secondary">{modIndex + 1}</Badge>
                            {modulo.titulo}
                          </CardTitle>
                          <CardDescription>{modulo.descricao}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            {modulo.videos?.map((video) => (
                              <Link key={video.id} to={`/videos/${video.id}`}>
                                <div className="flex items-center justify-between p-3 rounded-lg hover:bg-accent transition-colors">
                                  <div className="flex items-center gap-3">
                                    <Play className="h-4 w-4 text-primary" />
                                    <span className="text-sm">{video.titulo}</span>
                                  </div>
                                  {video.duracao && (
                                    <Badge variant="outline">
                                      <Clock className="h-3 w-3 mr-1" />
                                      {Math.floor(video.duracao / 60)}min
                                    </Badge>
                                  )}
                                </div>
                              </Link>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </main>
    </div>
  );
}