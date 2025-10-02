import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Info, AlertCircle, AlertTriangle, Play, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function Dashboard() {
  const { data: avisos } = useQuery({
    queryKey: ["avisos-ativos"],
    queryFn: async () => {
      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from("avisos")
        .select("*")
        .eq("ativo", true)
        .or(`data_expiracao.is.null,data_expiracao.gt.${now}`)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const { data: videosRecentes } = useQuery({
    queryKey: ["videos-recentes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("videos")
        .select(`
          *,
          modulo:modulos(
            id,
            titulo,
            curso:cursos(
              id,
              titulo,
              trilha:trilhas(
                id,
                titulo
              )
            )
          )
        `)
        .eq("ativo", true)
        .order("created_at", { ascending: false })
        .limit(6);
      
      if (error) throw error;
      return data;
    },
  });

  const getAvisoIcon = (tipo: string) => {
    switch (tipo) {
      case "info":
        return <Info className="h-5 w-5" />;
      case "alerta":
        return <AlertCircle className="h-5 w-5" />;
      case "urgente":
        return <AlertTriangle className="h-5 w-5" />;
      default:
        return <Info className="h-5 w-5" />;
    }
  };

  const getAvisoVariant = (tipo: string) => {
    switch (tipo) {
      case "urgente":
        return "destructive";
      default:
        return "default";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="container py-6 space-y-8">
        {/* Avisos */}
        {avisos && avisos.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-2xl font-bold">Avisos Importantes</h2>
            <div className="space-y-3">
              {avisos.map((aviso) => (
                <Alert key={aviso.id} variant={getAvisoVariant(aviso.tipo)}>
                  {getAvisoIcon(aviso.tipo)}
                  <AlertTitle>{aviso.titulo}</AlertTitle>
                  <AlertDescription>{aviso.mensagem}</AlertDescription>
                </Alert>
              ))}
            </div>
          </section>
        )}

        {/* Vídeos Recentes */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Vídeos Recentes</h2>
            <Link to="/trilhas">
              <Button variant="outline">Ver todas as trilhas</Button>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {videosRecentes?.map((video) => (
              <Card key={video.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-video bg-muted relative">
                  {video.thumbnail_url ? (
                    <img 
                      src={video.thumbnail_url} 
                      alt={video.titulo}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Play className="h-12 w-12 text-muted-foreground" />
                    </div>
                  )}
                  {video.duracao && (
                    <Badge className="absolute bottom-2 right-2" variant="secondary">
                      <Clock className="h-3 w-3 mr-1" />
                      {Math.floor(video.duracao / 60)}min
                    </Badge>
                  )}
                </div>
                <CardHeader>
                  <CardTitle className="line-clamp-2">{video.titulo}</CardTitle>
                  <CardDescription className="line-clamp-1">
                    {video.modulo?.curso?.trilha?.titulo}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Link to={`/videos/${video.id}`}>
                    <Button className="w-full">
                      <Play className="h-4 w-4 mr-2" />
                      Assistir
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}