import { useState } from "react";
import { useFavoritos, useToggleFavorito } from "@/hooks/useFavoritos";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Heart, Search, ExternalLink, Trash2, Wrench, MessageSquare, Target, Sparkles, Play } from "lucide-react";
import { Link } from "react-router-dom";

export default function Favoritos() {
  const { data: favoritos, isLoading } = useFavoritos();
  const toggleFavorito = useToggleFavorito();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("todos");

  const { data: trilhas } = useQuery({
    queryKey: ["trilhas-favoritas"],
    queryFn: async () => {
      const { data, error } = await supabase.from("trilhas").select("*").eq("ativo", true);
      if (error) throw error;
      return data;
    },
  });

  const { data: videos } = useQuery({
    queryKey: ["videos-favoritos"],
    queryFn: async () => {
      const { data, error } = await supabase.from("videos").select("*, modulos!inner(trilha_id)").eq("ativo", true);
      if (error) throw error;
      return data;
    },
  });

  const { data: ferramentas } = useQuery({
    queryKey: ["ferramentas-favoritas"],
    queryFn: async () => {
      const { data, error } = await supabase.from("ferramentas_ia").select("*").eq("ativo", true);
      if (error) throw error;
      return data;
    },
  });

  const { data: prompts } = useQuery({
    queryKey: ["prompts-favoritos"],
    queryFn: async () => {
      const { data, error } = await supabase.from("biblioteca_prompts").select("*").eq("ativo", true);
      if (error) throw error;
      return data;
    },
  });

  const { data: metodos } = useQuery({
    queryKey: ["metodos-favoritos"],
    queryFn: async () => {
      const { data, error } = await supabase.from("metodos_aplicar").select("*").eq("ativo", true);
      if (error) throw error;
      return data;
    },
  });

  const { data: iasCopieUse } = useQuery({
    queryKey: ["ias-favoritas"],
    queryFn: async () => {
      const { data, error } = await supabase.from("ia_copie_use").select("*").eq("ativo", true);
      if (error) throw error;
      return data;
    },
  });

  const getFavoritoDetails = (favorito: any) => {
    let item: any = null;
    let link = "";
    switch (favorito.tipo) {
      case "trilha":
        item = trilhas?.find((t) => t.id === favorito.item_id);
        link = `/trilhas/${favorito.item_id}`;
        break;
      case "video":
        const video = videos?.find((v) => v.id === favorito.item_id);
        item = video;
        link = video?.modulos?.trilha_id ? `/trilhas/${video.modulos.trilha_id}?video=${favorito.item_id}` : `/video/${favorito.item_id}`;
        break;
      case "ferramenta":
        item = ferramentas?.find((f) => f.id === favorito.item_id);
        link = `/biblioteca-ferramentas`;
        break;
      case "prompt":
        item = prompts?.find((p) => p.id === favorito.item_id);
        link = `/biblioteca-prompts`;
        break;
      case "metodo":
        item = metodos?.find((m) => m.id === favorito.item_id);
        link = `/metodos-aplicar`;
        break;
      case "ia_copie_use":
        item = iasCopieUse?.find((ia) => ia.id === favorito.item_id);
        link = `/ia-copie-use`;
        break;
    }
    return { item, link };
  };

  const filteredFavoritos = favoritos?.filter((fav) => {
    const { item } = getFavoritoDetails(fav);
    if (!item) return false;
    const matchesSearch = (item.titulo || item.nome)?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTab = activeTab === "todos" || fav.tipo === activeTab;
    return matchesSearch && matchesTab;
  });

  if (isLoading) return <div className="container mx-auto py-8 px-4"><p>Carregando...</p></div>;

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
          <Heart className="h-10 w-10 text-primary" />
          Meus Favoritos
        </h1>
        <p className="text-muted-foreground">Acesse rapidamente seus conteúdos favoritos</p>
      </div>
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar nos favoritos..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
        </div>
      </div>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="flex-wrap h-auto">
          <TabsTrigger value="todos">Todos</TabsTrigger>
          <TabsTrigger value="trilha">Trilhas</TabsTrigger>
          <TabsTrigger value="video">Vídeos</TabsTrigger>
          <TabsTrigger value="ferramenta">Ferramentas</TabsTrigger>
          <TabsTrigger value="prompt">Prompts</TabsTrigger>
          <TabsTrigger value="metodo">Métodos</TabsTrigger>
          <TabsTrigger value="ia_copie_use">IA Copie e Use</TabsTrigger>
        </TabsList>
        <TabsContent value={activeTab} className="space-y-4">
          {!filteredFavoritos || filteredFavoritos.length === 0 ? (
            <Card><CardContent className="flex flex-col items-center justify-center py-12">
              <Heart className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">Nenhum favorito encontrado</h3>
              <p className="text-muted-foreground text-center">{searchTerm ? "Tente ajustar sua busca" : "Comece a favoritar conteúdos"}</p>
            </CardContent></Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredFavoritos.map((favorito) => {
                const { item, link } = getFavoritoDetails(favorito);
                if (!item) return null;
                return (
                  <Card key={favorito.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          {favorito.tipo === "ferramenta" && <Wrench className="h-5 w-5 text-primary mt-1" />}
                          {favorito.tipo === "prompt" && <MessageSquare className="h-5 w-5 text-primary mt-1" />}
                          {favorito.tipo === "metodo" && <Target className="h-5 w-5 text-primary mt-1" />}
                          {favorito.tipo === "ia_copie_use" && <Sparkles className="h-5 w-5 text-primary mt-1" />}
                          {favorito.tipo === "video" && <Play className="h-5 w-5 text-primary mt-1" />}
                          <div className="flex-1 min-w-0">
                            <CardTitle className="line-clamp-1">{item?.titulo || item?.nome}</CardTitle>
                            <CardDescription className="line-clamp-2">{item?.descricao || item?.objetivo || "Sem descrição"}</CardDescription>
                          </div>
                        </div>
                        <Badge variant="outline" className="ml-2 shrink-0">{favorito.tipo === "ia_copie_use" ? "IA" : favorito.tipo}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex gap-2">
                        <Button variant="outline" className="flex-1" asChild><Link to={link}><ExternalLink className="h-4 w-4 mr-2" />Ver</Link></Button>
                        <Button variant="ghost" size="icon" onClick={() => toggleFavorito.mutate({ tipo: favorito.tipo, item_id: favorito.item_id })} disabled={toggleFavorito.isPending}>
                          <Trash2 className="h-4 w-4 text-destructive" />
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
