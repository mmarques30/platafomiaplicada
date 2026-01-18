import { useState } from "react";
import { useFavoritos, useToggleFavorito } from "@/hooks/useFavoritos";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Heart, Search } from "lucide-react";
import FavoritoRow from "@/components/favoritos/FavoritoRow";
import { PageTitle } from "@/components/shared/PageTitle";

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
    <div className="container mx-auto py-4 md:py-8 px-4">
      <div className="mb-6 md:mb-8">
        <PageTitle primary="Meus" secondary="Favoritos" icon={<Heart className="h-7 w-7 md:h-8 md:w-8 text-primary shrink-0" />} />
        <p className="text-sm md:text-base text-muted-foreground mt-2">Acesse rapidamente seus conteúdos favoritos</p>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-3 mb-4 md:mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar nos favoritos..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
        </div>
        <Select value={activeTab} onValueChange={setActiveTab}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filtrar por tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos</SelectItem>
            <SelectItem value="trilha">Trilhas</SelectItem>
            <SelectItem value="video">Vídeos</SelectItem>
            <SelectItem value="ferramenta">Ferramentas</SelectItem>
            <SelectItem value="prompt">Prompts</SelectItem>
            <SelectItem value="metodo">Métodos</SelectItem>
            <SelectItem value="ia_copie_use">IA Copie e Use</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-4">
        {!filteredFavoritos || filteredFavoritos.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Heart className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">Nenhum favorito encontrado</h3>
              <p className="text-muted-foreground text-center">
                {searchTerm ? "Tente ajustar sua busca" : "Comece a favoritar conteúdos"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-0">
              {filteredFavoritos.map((favorito) => {
                const { item, link } = getFavoritoDetails(favorito);
                if (!item) return null;
                
                return (
                  <FavoritoRow
                    key={favorito.id}
                    tipo={favorito.tipo}
                    titulo={item?.titulo || item?.nome}
                    descricao={item?.descricao || item?.objetivo || "Sem descrição"}
                    link={link}
                    onRemove={() => toggleFavorito.mutate({ tipo: favorito.tipo, item_id: favorito.item_id })}
                    isRemoving={toggleFavorito.isPending}
                  />
                );
              })}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}