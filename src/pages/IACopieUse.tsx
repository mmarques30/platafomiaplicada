import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/shared/CopyButton";
import { FavoriteButton } from "@/components/shared/FavoriteButton";
import { useIACopieUse } from "@/hooks/useFerramentas";
import { Sparkles, Search, Cpu, FileText, Image, Table, FileCode, Download } from "lucide-react";

// Helper to get file icon based on extension
const getFileIcon = (url: string) => {
  const ext = url.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'pdf':
      return <FileText className="h-4 w-4" />;
    case 'png':
    case 'jpg':
    case 'jpeg':
      return <Image className="h-4 w-4" />;
    case 'csv':
      return <Table className="h-4 w-4" />;
    case 'html':
    case 'htm':
      return <FileCode className="h-4 w-4" />;
    default:
      return <FileText className="h-4 w-4" />;
  }
};

// Helper to extract filename from URL
const getFileName = (url: string) => {
  const parts = url.split('/');
  const filename = parts[parts.length - 1];
  // Remove UUID prefix if present
  const cleanName = filename.replace(/^[a-f0-9-]{36}_/, '');
  return decodeURIComponent(cleanName);
};

// Helper to normalize arquivos_url to array
const getArquivoUrls = (arquivosUrl: any): string[] => {
  if (!arquivosUrl) return [];
  if (Array.isArray(arquivosUrl)) return arquivosUrl;
  if (typeof arquivosUrl === 'string') return [arquivosUrl];
  return [];
};

export default function IACopieUse() {
  const { data: ias, isLoading } = useIACopieUse();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategoria, setSelectedCategoria] = useState<string | null>(null);

  const categorias = ias
    ? Array.from(new Set(ias.map((ia) => ia.categoria)))
    : [];

  const filteredIAs = ias?.filter((ia) => {
    const matchesSearch = ia.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ia.descricao.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategoria = !selectedCategoria || ia.categoria === selectedCategoria;
    return matchesSearch && matchesCategoria;
  });

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">IA "Copie e Use"</h1>
        <p className="text-muted-foreground">
          Ferramentas de IA prontas para você copiar e usar
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Buscar ferramentas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <Badge
            variant={selectedCategoria === null ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => setSelectedCategoria(null)}
          >
            Todas
          </Badge>
          {categorias.map((categoria) => (
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
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredIAs && filteredIAs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredIAs.map((ia) => {
            const arquivos = getArquivoUrls(ia.arquivos_url);
            
            return (
              <Card key={ia.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-2">{ia.titulo}</CardTitle>
                      <CardDescription>{ia.descricao}</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{ia.categoria}</Badge>
                      <FavoriteButton 
                        tipo="ia_copie_use" 
                        itemId={ia.id}
                        variant="ghost"
                      />
                    </div>
                  </div>

                  {Array.isArray(ia.ferramentas_recomendadas) && 
                   ia.ferramentas_recomendadas.length > 0 && (
                    <div className="mt-3 pt-3 border-t">
                      <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                        <Cpu className="w-3 h-3" />
                        Ferramentas onde aplicar:
                      </p>
                      <div className="flex gap-2 flex-wrap">
                        {ia.ferramentas_recomendadas.map((ferramenta: string) => (
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
                  {ia.ia_recomendada && (
                    <div className="text-sm">
                      <span className="font-semibold">IA Recomendada:</span>{" "}
                      {ia.ia_recomendada}
                    </div>
                  )}
                  <div className="bg-muted p-3 rounded-md">
                    <code className="text-sm break-all">{ia.conteudo}</code>
                  </div>
                  <CopyButton
                    content={ia.conteudo}
                    variant="default"
                    size="default"
                    className="w-full"
                  />
                  
                  {/* Attached Files Section */}
                  {arquivos.length > 0 && (
                    <div className="pt-3 border-t space-y-2">
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Download className="w-3 h-3" />
                        Arquivos para download:
                      </p>
                      <div className="flex flex-col gap-2">
                        {arquivos.map((url, index) => (
                          <Button
                            key={index}
                            variant="outline"
                            size="sm"
                            className="w-full justify-start"
                            asChild
                          >
                            <a href={url} target="_blank" rel="noopener noreferrer" download>
                              {getFileIcon(url)}
                              <span className="ml-2 truncate">{getFileName(url)}</span>
                            </a>
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Sparkles className="w-12 h-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              Nenhuma ferramenta encontrada
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
