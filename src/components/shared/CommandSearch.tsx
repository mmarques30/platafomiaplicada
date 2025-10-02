import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Search, BookOpen, Video, Sparkles, MessageSquare, Target } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface SearchResult {
  id: string;
  titulo: string;
  tipo: "trilha" | "video" | "ia" | "prompt" | "metodo" | "ferramenta";
  url: string;
}

interface CommandSearchProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CommandSearch({ open, onOpenChange }: CommandSearchProps) {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const searchContent = async () => {
      if (!search.trim()) {
        setResults([]);
        return;
      }

      setLoading(true);
      const searchTerm = search.toLowerCase();
      const allResults: SearchResult[] = [];

      try {
        // Buscar trilhas
        const { data: trilhas } = await supabase
          .from("trilhas")
          .select("id, titulo")
          .eq("ativo", true)
          .ilike("titulo", `%${searchTerm}%`)
          .limit(3);

        if (trilhas) {
          allResults.push(
            ...trilhas.map((t) => ({
              id: t.id,
              titulo: t.titulo,
              tipo: "trilha" as const,
              url: `/trilhas/${t.id}`,
            }))
          );
        }

        // Buscar vídeos
        const { data: videos } = await supabase
          .from("videos")
          .select("id, titulo")
          .eq("ativo", true)
          .ilike("titulo", `%${searchTerm}%`)
          .limit(3);

        if (videos) {
          allResults.push(
            ...videos.map((v) => ({
              id: v.id,
              titulo: v.titulo,
              tipo: "video" as const,
              url: `/videos/${v.id}`,
            }))
          );
        }

        // Buscar IAs
        const { data: ias } = await supabase
          .from("ia_copie_use")
          .select("id, titulo")
          .eq("ativo", true)
          .ilike("titulo", `%${searchTerm}%`)
          .limit(3);

        if (ias) {
          allResults.push(
            ...ias.map((i) => ({
              id: i.id,
              titulo: i.titulo,
              tipo: "ia" as const,
              url: "/ia-copie-use",
            }))
          );
        }

        // Buscar prompts
        const { data: prompts } = await supabase
          .from("biblioteca_prompts")
          .select("id, titulo")
          .eq("ativo", true)
          .ilike("titulo", `%${searchTerm}%`)
          .limit(3);

        if (prompts) {
          allResults.push(
            ...prompts.map((p) => ({
              id: p.id,
              titulo: p.titulo,
              tipo: "prompt" as const,
              url: "/biblioteca-prompts",
            }))
          );
        }

        // Buscar métodos
        const { data: metodos } = await supabase
          .from("metodos_aplicar")
          .select("id, titulo")
          .eq("ativo", true)
          .ilike("titulo", `%${searchTerm}%`)
          .limit(3);

        if (metodos) {
          allResults.push(
            ...metodos.map((m) => ({
              id: m.id,
              titulo: m.titulo,
              tipo: "metodo" as const,
              url: "/metodos-aplicar",
            }))
          );
        }

        // Buscar ferramentas
        const { data: ferramentas } = await supabase
          .from("ferramentas_ia")
          .select("id, nome")
          .eq("ativo", true)
          .ilike("nome", `%${searchTerm}%`)
          .limit(3);

        if (ferramentas) {
          allResults.push(
            ...ferramentas.map((f) => ({
              id: f.id,
              titulo: f.nome,
              tipo: "ferramenta" as const,
              url: "/biblioteca-ferramentas",
            }))
          );
        }

        setResults(allResults);
      } catch (error) {
        console.error("Erro ao buscar:", error);
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(searchContent, 300);
    return () => clearTimeout(debounce);
  }, [search]);

  const getIcon = (tipo: SearchResult["tipo"]) => {
    switch (tipo) {
      case "trilha":
        return <BookOpen className="w-4 h-4" />;
      case "video":
        return <Video className="w-4 h-4" />;
      case "ia":
        return <Sparkles className="w-4 h-4" />;
      case "prompt":
        return <MessageSquare className="w-4 h-4" />;
      case "metodo":
        return <Target className="w-4 h-4" />;
      case "ferramenta":
        return <Sparkles className="w-4 h-4" />;
    }
  };

  const getTipoLabel = (tipo: SearchResult["tipo"]) => {
    switch (tipo) {
      case "trilha":
        return "Trilha";
      case "video":
        return "Vídeo";
      case "ia":
        return "IA Copie e Use";
      case "prompt":
        return "Prompt";
      case "metodo":
        return "Método";
      case "ferramenta":
        return "Ferramenta";
    }
  };

  const handleSelect = (url: string) => {
    navigate(url);
    onOpenChange(false);
    setSearch("");
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput
        placeholder="Buscar conteúdo..."
        value={search}
        onValueChange={setSearch}
      />
      <CommandList>
        <CommandEmpty>
          {loading ? "Buscando..." : "Nenhum resultado encontrado."}
        </CommandEmpty>
        {results.length > 0 && (
          <CommandGroup heading="Resultados">
            {results.map((result) => (
              <CommandItem
                key={`${result.tipo}-${result.id}`}
                onSelect={() => handleSelect(result.url)}
                className="flex items-center gap-2 cursor-pointer"
              >
                {getIcon(result.tipo)}
                <span className="flex-1">{result.titulo}</span>
                <span className="text-xs text-muted-foreground">
                  {getTipoLabel(result.tipo)}
                </span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}
      </CommandList>
    </CommandDialog>
  );
}
