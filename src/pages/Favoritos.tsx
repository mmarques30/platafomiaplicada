import { useState } from "react";
import { useFavoritos, useToggleFavorito } from "@/hooks/useFavoritos";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Heart, Search, ExternalLink, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";

export default function Favoritos() {
  const { data: favoritos, isLoading } = useFavoritos();
  const toggleFavorito = useToggleFavorito();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("todos");

  // Buscar detalhes dos itens favoritados
  const { data: trilhas } = useQuery({
    queryKey: ["trilhas-favoritas"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("trilhas")
        .select("*")
        .eq("ativo", true);
      if (error) throw error;
      return data;
    },
  });

  const { data: cursos } = useQuery({
    queryKey: ["cursos-favoritos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cursos")
        .select("*")
        .eq("ativo", true);
      if (error) throw error;
      return data;
    },
  });

  const { data: videos } = useQuery({
    queryKey: ["videos-favoritos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("videos")
        .select("*")
        .eq("ativo", true);
      if (error) throw error;
      return data;
    },
  });

  const getFavoritoDetails = (favorito: any) => {
    let item;
    let link = "";
    
    switch (favorito.tipo) {
      case "trilha":
        item = trilhas?.find((t) => t.id === favorito.item_id);
        link = `/trilhas/${favorito.item_id}`;
        break;
      case "curso":
        item = cursos?.find((c) => c.id === favorito.item_id);
        link = `/trilhas`; // Ajustar conforme necessário
        break;
      case "video":
        item = videos?.find((v) => v.id === favorito.item_id);
        link = `/videos/${favorito.item_id}`;
        break;
    }

    return { item, link };
  };

  const filteredFavoritos = favoritos?.filter((fav) => {
    const { item } = getFavoritoDetails(fav);
    if (!item) return false;

    const matchesSearch = item.titulo?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTab = activeTab === "todos" || fav.tipo === activeTab;

    return matchesSearch && matchesTab;
  });

  const handleRemoveFavorito = (tipo: string, itemId: string) => {
    toggleFavorito.mutate({ tipo, item_id: itemId });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4 flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
          <Heart className="h-10 w-10 text-primary" />
          Meus Favoritos
        </h1>
        <p className="text-muted-foreground">Acesse rapidamente seus conteúdos favoritos</p>
      </div>

      {/* Busca */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar nos favoritos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Tabs de Filtro */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="todos">Todos</TabsTrigger>
          <TabsTrigger value="trilha">Trilhas</TabsTrigger>
          <TabsTrigger value="curso">Cursos</TabsTrigger>
          <TabsTrigger value="video">Vídeos</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          {!filteredFavoritos || filteredFavoritos.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Heart className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">Nenhum favorito encontrado</h3>
                <p className="text-muted-foreground text-center">
                  {searchTerm
                    ? "Tente ajustar sua busca"
                    : "Comece a favoritar conteúdos para vê-los aqui"}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredFavoritos.map((favorito) => {
                const { item, link } = getFavoritoDetails(favorito);
                if (!item) return null;

                return (
                  <Card key={favorito.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between gap-2">
                        <CardTitle className="text-lg line-clamp-2">{item.titulo}</CardTitle>
                        <Badge variant="secondary" className="shrink-0">
                          {favorito.tipo === "trilha" ? "Trilha" : 
                           favorito.tipo === "curso" ? "Curso" : "Vídeo"}
                        </Badge>
                      </div>
                      {item.descricao && (
                        <CardDescription className="line-clamp-2">
                          {item.descricao}
                        </CardDescription>
                      )}
                    </CardHeader>
                    <CardContent>
                      <div className="flex gap-2">
                        <Button asChild size="sm" className="flex-1">
                          <Link to={link}>
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Acessar
                          </Link>
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRemoveFavorito(favorito.tipo, favorito.item_id)}
                          disabled={toggleFavorito.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
