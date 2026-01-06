import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { FileText, Download, ExternalLink, Search, FolderLock, Sparkles } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface BonusMentoria {
  id: string;
  nome: string;
  descricao: string;
  link?: string;
  arquivo_url?: any;
  liberado: boolean;
  condicao_tipo: string;
  condicao_descricao?: string;
}

export function MateriaisExclusivos() {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: materiais, isLoading } = useQuery({
    queryKey: ["bonus-mentoria"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bonus_mentoria")
        .select("*")
        .eq("publico_alvo", "mentorado")
        .order("nome");

      if (error) throw error;
      return data as BonusMentoria[];
    },
  });

  const materiaisFiltrados = materiais?.filter(
    (m) =>
      m.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.descricao.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const categorizarMaterial = (material: BonusMentoria) => {
    const nome = material.nome.toLowerCase();
    if (nome.includes("template") || nome.includes("modelo")) return "Template";
    if (nome.includes("framework") || nome.includes("método")) return "Framework";
    if (nome.includes("guia") || nome.includes("manual")) return "Guia";
    if (nome.includes("planilha") || nome.includes("excel")) return "Planilha";
    return "Recurso";
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 flex-1" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <FolderLock className="h-5 w-5 text-primary" />
            Materiais Exclusivos
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Templates, frameworks e recursos exclusivos da mentoria
          </p>
        </div>
        
        {/* Busca */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar material..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Grid de Materiais */}
      {!materiaisFiltrados || materiaisFiltrados.length === 0 ? (
        <Card className="py-12">
          <CardContent className="text-center">
            <Sparkles className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="font-medium mb-2">Nenhum material encontrado</h3>
            <p className="text-sm text-muted-foreground">
              {searchTerm 
                ? "Tente outro termo de busca" 
                : "Novos materiais serão adicionados em breve"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {materiaisFiltrados.map((material) => {
            const categoria = categorizarMaterial(material);
            const arquivos = material.arquivo_url ? 
              (Array.isArray(material.arquivo_url) ? material.arquivo_url : [material.arquivo_url]) 
              : [];

            return (
              <Card 
                key={material.id} 
                className={`flex flex-col transition-all hover:shadow-md ${
                  !material.liberado ? "opacity-60" : ""
                }`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <FileText className="h-4 w-4 text-primary" />
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {categoria}
                      </Badge>
                    </div>
                    {!material.liberado && (
                      <Badge variant="secondary" className="text-xs">
                        🔒 Bloqueado
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-base mt-3">{material.nome}</CardTitle>
                  <CardDescription className="text-sm line-clamp-2">
                    {material.descricao}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="mt-auto pt-0">
                  {material.liberado ? (
                    <div className="flex gap-2">
                      {material.link && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="flex-1"
                          onClick={() => window.open(material.link, '_blank')}
                        >
                          <ExternalLink className="h-4 w-4 mr-1" />
                          Acessar
                        </Button>
                      )}
                      {arquivos.length > 0 && (
                        <Button 
                          size="sm"
                          className="flex-1"
                          onClick={() => {
                            const url = typeof arquivos[0] === 'string' ? arquivos[0] : arquivos[0]?.url;
                            if (url) window.open(url, '_blank');
                          }}
                        >
                          <Download className="h-4 w-4 mr-1" />
                          Baixar
                        </Button>
                      )}
                      {!material.link && arquivos.length === 0 && (
                        <Button size="sm" variant="outline" className="w-full" disabled>
                          Em breve
                        </Button>
                      )}
                    </div>
                  ) : (
                    <div className="text-xs text-muted-foreground text-center p-2 bg-muted/50 rounded">
                      {material.condicao_descricao || "Complete as etapas para desbloquear"}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
