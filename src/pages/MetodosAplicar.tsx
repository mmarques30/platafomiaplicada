import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CopyButton } from "@/components/shared/CopyButton";
import { FavoriteButton } from "@/components/shared/FavoriteButton";
import { useMetodos } from "@/hooks/useFerramentas";
import { Target, Search, Lightbulb, Cpu, FileText, ExternalLink } from "lucide-react";
import { METODOS_CATEGORIAS } from "@/lib/metodosCategories";

export default function MetodosAplicar() {
  const { data: metodos, isLoading } = useMetodos();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategoria, setSelectedCategoria] = useState<string | null>(null);

  const filteredMetodos = metodos?.filter((metodo) => {
    const matchesSearch =
      metodo.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      metodo.descricao.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategoria =
      !selectedCategoria || metodo.categoria === selectedCategoria;
    return matchesSearch && matchesCategoria;
  });

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Métodos para Aplicar</h1>
        <p className="text-muted-foreground">
          Metodologias para alimentar a IA e obter resultados melhores
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Buscar métodos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="flex gap-2 flex-wrap mb-6">
        <Badge
          variant={selectedCategoria === null ? "default" : "outline"}
          className="cursor-pointer"
          onClick={() => setSelectedCategoria(null)}
        >
          Todas
        </Badge>
        {METODOS_CATEGORIAS.map((categoria) => (
          <Badge
            key={categoria}
            variant={selectedCategoria === categoria ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => setSelectedCategoria(categoria)}
          >
            {categoria}
          </Badge>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-40 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredMetodos && filteredMetodos.length > 0 ? (
        <div className="space-y-4">
          {filteredMetodos.map((metodo) => (
            <Card key={metodo.id} className="hover:shadow-lg transition-shadow">
               <CardHeader>
                 <div className="flex items-start justify-between gap-3">
                   <div className="flex-1">
                     <CardTitle className="text-xl mb-2">{metodo.titulo}</CardTitle>
                     <CardDescription>{metodo.descricao}</CardDescription>
                   </div>
                   <div className="flex items-center gap-2">
                     <Badge variant="secondary">{metodo.categoria}</Badge>
                     <FavoriteButton 
                       tipo="metodo" 
                       itemId={metodo.id}
                       variant="ghost"
                     />
                   </div>
                 </div>

                 {/* Link do documento */}
                 {metodo.link_documento && (
                   <div className="mt-3">
                     <Button
                       variant="outline"
                       size="sm"
                       asChild
                       className="gap-2"
                     >
                       <a 
                         href={metodo.link_documento} 
                         target="_blank" 
                         rel="noopener noreferrer"
                       >
                         <FileText className="w-4 h-4" />
                         Ver Documento
                         <ExternalLink className="w-3 h-3" />
                       </a>
                     </Button>
                   </div>
                 )}

                 {Array.isArray(metodo.ferramentas_recomendadas) && 
                  metodo.ferramentas_recomendadas.length > 0 && (
                   <div className="mt-3 pt-3 border-t">
                     <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                       <Cpu className="w-3 h-3" />
                       Ferramentas onde aplicar:
                     </p>
                     <div className="flex gap-2 flex-wrap">
                       {metodo.ferramentas_recomendadas.map((ferramenta: string) => (
                         <Badge 
                           key={ferramenta} 
                           variant="default" 
                           className="text-xs bg-primary/10 text-primary hover:bg-primary/20"
                         >
                           {ferramenta}
                         </Badge>
                       ))}
                     </div>
                   </div>
                 )}
               </CardHeader>
              <CardContent className="space-y-4">
                <Tabs defaultValue="template" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="template">Template</TabsTrigger>
                    {metodo.exemplo && (
                      <TabsTrigger value="exemplo">
                        <Lightbulb className="w-4 h-4 mr-2" />
                        Exemplo
                      </TabsTrigger>
                    )}
                  </TabsList>
                  <TabsContent value="template" className="space-y-4">
                    <div className="bg-muted p-4 rounded-md">
                      <pre className="text-sm whitespace-pre-wrap font-mono">
                        {metodo.template}
                      </pre>
                    </div>
                    <CopyButton
                      content={metodo.template}
                      variant="default"
                      size="default"
                      className="w-full"
                    />
                  </TabsContent>
                  {metodo.exemplo && (
                    <TabsContent value="exemplo" className="space-y-4">
                      <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 p-4 rounded-md">
                        <pre className="text-sm whitespace-pre-wrap font-mono">
                          {metodo.exemplo}
                        </pre>
                      </div>
                      <CopyButton
                        content={metodo.exemplo}
                        variant="outline"
                        size="default"
                        className="w-full"
                      />
                    </TabsContent>
                  )}
                </Tabs>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Target className="w-12 h-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Nenhum método encontrado</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
