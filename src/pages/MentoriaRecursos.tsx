import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Wrench, Search, ExternalLink, Loader2, BookOpen, ArrowLeft, Gift, Lock, FileDown, Copy, Check } from "lucide-react";
import { useMentoriaRecursos } from "@/hooks/useMentoriaRecursos";
import { useMentoriaBonus } from "@/hooks/useMentoriaBonus";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { toast } from "@/hooks/use-toast";

export default function MentoriaRecursos() {
  const navigate = useNavigate();
  const { recursos, isLoading } = useMentoriaRecursos();
  const { bonus, isLoading: isLoadingBonus } = useMentoriaBonus();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategoria, setSelectedCategoria] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (isLoading || isLoadingBonus) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  const categorias = Array.from(new Set(recursos.map(r => r.categoria)));

  const recursosFiltrados = recursos.filter(recurso => {
    const matchSearch = recurso.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       recurso.descricao.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCategoria = !selectedCategoria || recurso.categoria === selectedCategoria;
    return matchSearch && matchCategoria;
  });

  const bonusLiberados = bonus.filter(b => b.liberado);
  const bonusBloqueados = bonus.filter(b => !b.liberado);

  const handleCopyComando = async (comando: string, id: string) => {
    await navigator.clipboard.writeText(comando);
    setCopiedId(id);
    toast({ title: "Copiado!", description: "Comando copiado para a área de transferência" });
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <Button variant="ghost" onClick={() => navigate("/mentoria")} className="mb-6">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Voltar para Mentoria
      </Button>

      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-3">Recursos e Ferramentas</h1>
        <p className="text-muted-foreground text-lg">
          Ferramentas recomendadas para seu desenvolvimento em IA
        </p>
      </div>

      {/* Bônus Section */}
      {bonus.length > 0 && (
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-4">
            <Gift className="h-5 w-5 text-primary" />
            <h2 className="text-2xl font-bold">Seus Bônus</h2>
          </div>

          {/* Bônus Liberados */}
          {bonusLiberados.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {bonusLiberados.map((bonusItem) => (
                <Card key={bonusItem.id} className="border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-900/10">
                  <CardHeader>
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                        <Gift className="h-5 w-5 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-lg">{bonusItem.nome}</CardTitle>
                        <Badge variant="default" className="mt-1 bg-green-600">
                          Liberado
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">{bonusItem.descricao}</p>
                    
                    <div className="flex flex-wrap gap-2">
                      {bonusItem.link && (
                        <Button variant="outline" size="sm" asChild>
                          <a href={bonusItem.link} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Acessar
                          </a>
                        </Button>
                      )}
                      {bonusItem.arquivo_url && (
                        <Button variant="outline" size="sm" asChild>
                          <a href={bonusItem.arquivo_url} target="_blank" rel="noopener noreferrer">
                            <FileDown className="h-4 w-4 mr-2" />
                            Baixar Documento
                          </a>
                        </Button>
                      )}
                    </div>

                    {bonusItem.comando_uso && (
                      <div className="relative">
                        <div className="p-3 bg-muted rounded-lg pr-12">
                          <p className="text-xs font-medium text-muted-foreground mb-2">Como usar:</p>
                          <p className="text-sm whitespace-pre-wrap">{bonusItem.comando_uso}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute top-2 right-2"
                          onClick={() => handleCopyComando(bonusItem.comando_uso!, bonusItem.id)}
                        >
                          {copiedId === bonusItem.id ? (
                            <Check className="h-4 w-4 text-green-600" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Bônus Bloqueados */}
          {bonusBloqueados.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {bonusBloqueados.map((bonusItem) => (
                <Card key={bonusItem.id} className="border-muted bg-muted/30 opacity-75">
                  <CardHeader>
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-muted rounded-lg">
                        <Lock className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-lg text-muted-foreground">{bonusItem.nome}</CardTitle>
                        <Badge variant="secondary" className="mt-1">
                          Bloqueado
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      <strong>Para desbloquear:</strong> {bonusItem.condicao_descricao || 
                        (bonusItem.condicao_tipo === 'sorteio' ? 'Aguarde o sorteio' : 'Complete a condição')}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Recursos Section */}
      <div className="mb-6 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar recursos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {categorias.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <Button
              variant={!selectedCategoria ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategoria(null)}
            >
              Todas
            </Button>
            {categorias.map((categoria) => (
              <Button
                key={categoria}
                variant={selectedCategoria === categoria ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategoria(categoria)}
              >
                {categoria}
              </Button>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {recursosFiltrados.length > 0 ? (
          recursosFiltrados.map((recurso) => (
            <Collapsible key={recurso.id}>
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Wrench className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{recurso.nome}</CardTitle>
                        <Badge variant="secondary" className="mt-1">
                          {recurso.categoria}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">{recurso.descricao}</p>
                  
                  <div>
                    <h4 className="font-semibold text-sm mb-2">Para que serve?</h4>
                    <p className="text-sm">{recurso.para_que_serve}</p>
                  </div>

                  {recurso.como_usar && (
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" size="sm" className="w-full">
                        <BookOpen className="h-4 w-4 mr-2" />
                        Ver como usar
                      </Button>
                    </CollapsibleTrigger>
                  )}

                  {recurso.link && (
                    <Button asChild variant="outline" className="w-full">
                      <a href={recurso.link} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Acessar ferramenta
                      </a>
                    </Button>
                  )}
                </CardContent>

                {recurso.como_usar && (
                  <CollapsibleContent>
                    <CardContent className="pt-0">
                      <Card className="bg-muted/50">
                        <CardContent className="pt-6">
                          <h4 className="font-semibold text-sm mb-2">Como usar:</h4>
                          <p className="text-sm whitespace-pre-wrap">{recurso.como_usar}</p>
                        </CardContent>
                      </Card>
                    </CardContent>
                  </CollapsibleContent>
                )}
              </Card>
            </Collapsible>
          ))
        ) : (
          <Card className="col-span-2">
            <CardContent className="py-12 text-center">
              <Wrench className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">
                {searchTerm || selectedCategoria 
                  ? "Nenhum recurso encontrado" 
                  : "Nenhum recurso cadastrado ainda"}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
