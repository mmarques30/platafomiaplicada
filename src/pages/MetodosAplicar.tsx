import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { FavoriteButton } from "@/components/shared/FavoriteButton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useMetodos } from "@/hooks/useFerramentas";
import { Target, Search, Lightbulb, Cpu, FileText, ExternalLink, ChevronDown } from "lucide-react";
import { METODOS_CATEGORIAS } from "@/lib/metodosCategories";

interface MetodoItem {
  id: string;
  titulo: string;
  descricao: string;
  categoria: string;
  link_documento: string | null;
  ferramentas_recomendadas: unknown[];
  comentarios: string | null;
}

export default function MetodosAplicar() {
  const { data: metodos, isLoading } = useMetodos();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategoria, setSelectedCategoria] = useState<string | null>(null);
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());

  const todosItens = useMemo(() => {
    return (metodos || []).map(m => ({
      id: m.id,
      titulo: m.titulo,
      descricao: m.descricao,
      categoria: m.categoria,
      link_documento: m.link_documento,
      ferramentas_recomendadas: Array.isArray(m.ferramentas_recomendadas) ? m.ferramentas_recomendadas : [],
      comentarios: m.comentarios,
    }));
  }, [metodos]);

  const filteredItens = todosItens.filter((item) => {
    const matchesSearch =
      item.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.descricao.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategoria =
      !selectedCategoria || item.categoria === selectedCategoria;
    return matchesSearch && matchesCategoria;
  });

  const toggleItem = (id: string) => {
    setOpenItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-4 md:space-y-6">
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold">Métodos para Aplicar</h1>
        <p className="text-sm md:text-base text-muted-foreground">
          Metodologias para alimentar a IA e obter resultados melhores
        </p>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Busca */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Buscar métodos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Dropdown de Categoria */}
        <Select
          value={selectedCategoria || "todas"}
          onValueChange={(value) => setSelectedCategoria(value === "todas" ? null : value)}
        >
          <SelectTrigger className="w-[240px]">
            <SelectValue placeholder="Todas as categorias" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Todas ({todosItens.length})</SelectItem>
            {METODOS_CATEGORIAS.map((categoria) => {
              const count = todosItens.filter(m => m.categoria === categoria).length;
              if (count === 0) return null;
              return (
                <SelectItem key={categoria} value={categoria}>
                  {categoria} ({count})
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>

      {/* Conteúdo */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="p-4">
              <Skeleton className="h-5 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </Card>
          ))}
        </div>
      ) : filteredItens.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredItens.map((item) => {
            const isOpen = openItems.has(item.id);
            const ferramentas = Array.isArray(item.ferramentas_recomendadas) 
              ? item.ferramentas_recomendadas 
              : [];
            
            return (
              <Collapsible
                key={item.id}
                open={isOpen}
                onOpenChange={() => toggleItem(item.id)}
              >
                <Card className="overflow-hidden">
                  {/* Header compacto - estrutura horizontal com altura fixa */}
                  <CollapsibleTrigger asChild>
                    <div className="p-4 h-[72px] flex items-center gap-3 cursor-pointer hover:bg-muted/50 transition-colors">
                      {/* Conteúdo à esquerda */}
                      <div className="flex-1 min-w-0 flex flex-col justify-center">
                        <h3 className="font-medium text-sm leading-tight line-clamp-1 mb-1.5">
                          {item.titulo}
                        </h3>
                        <Badge variant="secondary" className="text-xs w-fit">
                          {item.categoria}
                        </Badge>
                      </div>
                      
                      {/* Ícones à direita - centralizados verticalmente */}
                      <div className="flex items-center gap-1 shrink-0">
                        <FavoriteButton 
                          tipo="metodo" 
                          itemId={item.id}
                          variant="ghost"
                          className="h-7 w-7"
                        />
                        <ChevronDown 
                          className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${
                            isOpen ? 'rotate-180' : ''
                          }`} 
                        />
                      </div>
                    </div>
                  </CollapsibleTrigger>

                  {/* Conteúdo expandível */}
                  <CollapsibleContent>
                    <div className="px-4 pb-4 border-t space-y-3">
                      {/* Descrição */}
                      <p className="text-sm text-muted-foreground pt-3">
                        {item.descricao}
                      </p>

                      {/* Dicas de Uso */}
                      {item.comentarios && (
                        <div className="bg-muted/50 rounded-lg p-3">
                          <div className="flex items-center gap-2 text-sm font-medium mb-1">
                            <Lightbulb className="h-4 w-4 text-primary" />
                            Dicas de Uso
                          </div>
                          <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                            {item.comentarios}
                          </p>
                        </div>
                      )}

                      {/* Ferramentas completas */}
                      {ferramentas.length > 0 && (
                        <div className="pt-2">
                          <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                            <Cpu className="w-3 h-3" />
                            Ferramentas onde aplicar:
                          </p>
                          <div className="flex gap-1.5 flex-wrap">
                            {ferramentas.map((ferramenta: string) => (
                              <Badge 
                                key={ferramenta} 
                                variant="outline" 
                                className="text-xs"
                              >
                                {ferramenta}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Botão Acessar Documento */}
                      {item.link_documento && (
                        <Button asChild className="w-full mt-2">
                          <a 
                            href={item.link_documento} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-2"
                          >
                            <FileText className="w-4 h-4" />
                            Acessar Documento
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </Button>
                      )}
                    </div>
                  </CollapsibleContent>
                </Card>
              </Collapsible>
            );
          })}
        </div>
      ) : (
        <Card>
          <div className="flex flex-col items-center justify-center py-12">
            <Target className="w-12 h-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Nenhum método encontrado</p>
          </div>
        </Card>
      )}
    </div>
  );
}
