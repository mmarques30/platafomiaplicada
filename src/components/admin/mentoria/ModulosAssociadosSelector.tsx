import { useState, useEffect } from "react";
import { useModulosDisponiveis } from "@/hooks/useModulosDisponiveis";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Plus, X } from "lucide-react";

interface ModuloAssociado {
  modulo_id: string;
  titulo: string;
  trilha_id: string;
  trilha_titulo: string;
  video_ids: string[];
  obrigatorio?: boolean;
  prioridade?: string;
}

interface TrilhaRecomendada {
  trilha_id: string;
  titulo: string;
  prioridade: string;
}

interface ModulosAssociadosSelectorProps {
  trilhasRecomendadas: TrilhaRecomendada[];
  modulosObrigatorios: ModuloAssociado[];
  onChange: (trilhas: TrilhaRecomendada[], modulos: ModuloAssociado[]) => void;
}

export const ModulosAssociadosSelector = ({
  trilhasRecomendadas,
  modulosObrigatorios,
  onChange
}: ModulosAssociadosSelectorProps) => {
  const { trilhas, isLoadingTrilhas, fetchModulosPorTrilha, fetchVideosPorModulo } = useModulosDisponiveis();
  const [selectedTrilhaId, setSelectedTrilhaId] = useState<string>("");
  const [modulosDaTrilha, setModulosDaTrilha] = useState<any[]>([]);
  const [isLoadingModulos, setIsLoadingModulos] = useState(false);

  const handleAddTrilha = async () => {
    if (!selectedTrilhaId) return;
    
    const trilha = trilhas.find(t => t.id === selectedTrilhaId);
    if (!trilha) return;

    // Verificar se já existe
    if (trilhasRecomendadas.some(t => t.trilha_id === selectedTrilhaId)) {
      return;
    }

    const novaTrilha: TrilhaRecomendada = {
      trilha_id: trilha.id,
      titulo: trilha.titulo,
      prioridade: "média"
    };

    onChange([...trilhasRecomendadas, novaTrilha], modulosObrigatorios);
    setSelectedTrilhaId("");
  };

  const handleRemoveTrilha = (trilhaId: string) => {
    const novasTrilhas = trilhasRecomendadas.filter(t => t.trilha_id !== trilhaId);
    const novosModulos = modulosObrigatorios.filter(m => m.trilha_id !== trilhaId);
    onChange(novasTrilhas, novosModulos);
  };

  const handleUpdatePrioridadeTrilha = (trilhaId: string, prioridade: string) => {
    const novasTrilhas = trilhasRecomendadas.map(t => 
      t.trilha_id === trilhaId ? { ...t, prioridade } : t
    );
    onChange(novasTrilhas, modulosObrigatorios);
  };

  const handleLoadModulos = async (trilhaId: string) => {
    setIsLoadingModulos(true);
    try {
      const modulos = await fetchModulosPorTrilha(trilhaId);
      setModulosDaTrilha(modulos);
    } catch (error) {
      console.error("Erro ao carregar módulos:", error);
    } finally {
      setIsLoadingModulos(false);
    }
  };

  const handleToggleModulo = async (modulo: any, trilhaId: string, trilhaTitulo: string) => {
    const moduloExiste = modulosObrigatorios.some(m => m.modulo_id === modulo.id);

    if (moduloExiste) {
      // Remover
      const novosModulos = modulosObrigatorios.filter(m => m.modulo_id !== modulo.id);
      onChange(trilhasRecomendadas, novosModulos);
    } else {
      // Adicionar - buscar vídeos do módulo
      const videos = await fetchVideosPorModulo(modulo.id);
      const novoModulo: ModuloAssociado = {
        modulo_id: modulo.id,
        titulo: modulo.titulo,
        trilha_id: trilhaId,
        trilha_titulo: trilhaTitulo,
        video_ids: videos.map(v => v.id),
        obrigatorio: true,
        prioridade: "média"
      };
      onChange(trilhasRecomendadas, [...modulosObrigatorios, novoModulo]);
    }
  };

  const handleUpdatePrioridadeModulo = (moduloId: string, prioridade: string) => {
    const novosModulos = modulosObrigatorios.map(m =>
      m.modulo_id === moduloId ? { ...m, prioridade } : m
    );
    onChange(trilhasRecomendadas, novosModulos);
  };

  const getModulosSelecionadosPorTrilha = (trilhaId: string) => {
    return modulosObrigatorios.filter(m => m.trilha_id === trilhaId);
  };

  if (isLoadingTrilhas) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Adicionar Nova Trilha */}
      <Card>
        <CardHeader>
          <CardTitle>Adicionar Trilha Recomendada</CardTitle>
          <CardDescription>
            Selecione trilhas de aprendizado relevantes para este projeto
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Select value={selectedTrilhaId} onValueChange={setSelectedTrilhaId}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Selecione uma trilha..." />
              </SelectTrigger>
              <SelectContent>
                {trilhas.map(trilha => (
                  <SelectItem key={trilha.id} value={trilha.id}>
                    {trilha.titulo}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={handleAddTrilha} disabled={!selectedTrilhaId}>
              <Plus className="h-4 w-4 mr-2" />
              Adicionar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Trilhas Recomendadas */}
      {trilhasRecomendadas.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Trilhas e Módulos Selecionados</h3>
          
          {trilhasRecomendadas.map(trilha => {
            const modulosSelecionados = getModulosSelecionadosPorTrilha(trilha.trilha_id);
            
            return (
              <Card key={trilha.trilha_id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-base">{trilha.titulo}</CardTitle>
                      <CardDescription className="mt-1">
                        {modulosSelecionados.length} módulo(s) selecionado(s)
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Select
                        value={trilha.prioridade}
                        onValueChange={(value) => handleUpdatePrioridadeTrilha(trilha.trilha_id, value)}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="essencial">Essencial</SelectItem>
                          <SelectItem value="alta">Alta</SelectItem>
                          <SelectItem value="média">Média</SelectItem>
                          <SelectItem value="baixa">Baixa</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveTrilha(trilha.trilha_id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleLoadModulos(trilha.trilha_id)}
                      disabled={isLoadingModulos}
                    >
                      {isLoadingModulos ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Plus className="h-4 w-4 mr-2" />
                      )}
                      Selecionar Módulos
                    </Button>

                    {/* Módulos Selecionados */}
                    {modulosSelecionados.length > 0 && (
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Módulos Selecionados:</Label>
                        <div className="space-y-2">
                          {modulosSelecionados.map(modulo => (
                            <div
                              key={modulo.modulo_id}
                              className="flex items-center justify-between p-3 bg-muted rounded-lg"
                            >
                              <div className="flex-1">
                                <p className="text-sm font-medium">{modulo.titulo}</p>
                                <p className="text-xs text-muted-foreground">
                                  {modulo.video_ids.length} vídeo(s)
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                <Select
                                  value={modulo.prioridade || "média"}
                                  onValueChange={(value) => handleUpdatePrioridadeModulo(modulo.modulo_id, value)}
                                >
                                  <SelectTrigger className="w-32">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="essencial">Essencial</SelectItem>
                                    <SelectItem value="alta">Alta</SelectItem>
                                    <SelectItem value="média">Média</SelectItem>
                                    <SelectItem value="baixa">Baixa</SelectItem>
                                  </SelectContent>
                                </Select>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleToggleModulo(
                                    { id: modulo.modulo_id, titulo: modulo.titulo },
                                    trilha.trilha_id,
                                    trilha.titulo
                                  )}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Lista de Módulos para Seleção */}
                    {modulosDaTrilha.length > 0 && (
                      <ScrollArea className="h-64 rounded-md border p-4">
                        <div className="space-y-2">
                          {modulosDaTrilha.map(modulo => {
                            const isSelecionado = modulosObrigatorios.some(
                              m => m.modulo_id === modulo.id
                            );
                            
                            return (
                              <div
                                key={modulo.id}
                                className="flex items-start space-x-3 p-2 hover:bg-muted rounded-lg cursor-pointer"
                                onClick={() => handleToggleModulo(modulo, trilha.trilha_id, trilha.titulo)}
                              >
                                <Checkbox
                                  checked={isSelecionado}
                                  onCheckedChange={() => handleToggleModulo(modulo, trilha.trilha_id, trilha.titulo)}
                                />
                                <div className="flex-1">
                                  <Label className="cursor-pointer font-normal">
                                    {modulo.titulo}
                                  </Label>
                                  {modulo.descricao && (
                                    <p className="text-xs text-muted-foreground mt-1">
                                      {modulo.descricao}
                                    </p>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </ScrollArea>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
