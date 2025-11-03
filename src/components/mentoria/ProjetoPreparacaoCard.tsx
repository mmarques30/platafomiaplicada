import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { BookOpen, CheckCircle2, AlertCircle } from "lucide-react";
import { useProjetoPreparacao } from "@/hooks/useProjetoPreparacao";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useNavigate } from "react-router-dom";

interface ProjetoPreparacaoCardProps {
  projetoId: string;
  userId: string;
}

export const ProjetoPreparacaoCard = ({ projetoId, userId }: ProjetoPreparacaoCardProps) => {
  const { data: preparacao, isLoading } = useProjetoPreparacao(projetoId, userId);
  const [showDetalhes, setShowDetalhes] = useState(false);
  const navigate = useNavigate();
  
  if (isLoading) {
    return (
      <Card className="border-l-4 border-l-primary">
        <CardContent className="py-6">
          <div className="flex items-center justify-center">
            <div className="animate-pulse text-muted-foreground">Carregando preparação...</div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (!preparacao || preparacao.modulos.length === 0) {
    return null;
  }
  
  const modulosPendentes = preparacao.modulos.filter(m => !m.concluido);
  
  return (
    <>
      <Card className="border-l-4 border-l-primary">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <BookOpen className="h-5 w-5" />
              Preparação Recomendada
            </CardTitle>
            <Badge variant={preparacao.progressoGeral === 100 ? "default" : "secondary"}>
              {preparacao.progressoGeral}% concluído
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {preparacao.progressoGeral < 100 && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-amber-900">Atenção</p>
                  <p className="text-sm text-amber-700">
                    Assista esses conteúdos antes da mentoria para focar na prática
                  </p>
                </div>
              </div>
            </div>
          )}
          
          <div className="space-y-3">
            {(preparacao.trilhas as any[]).map((trilha: any, idx: number) => {
              const modulosDaTrilha = preparacao.modulos.filter(
                (m: any) => m.trilha_titulo === trilha.titulo
              );
              const concluidos = modulosDaTrilha.filter((m: any) => m.concluido).length;
              const total = modulosDaTrilha.length;
              const progresso = total > 0 ? (concluidos / total) * 100 : 0;
              
              return (
                <div key={idx} className="border rounded-lg p-4 space-y-2">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium">{trilha.titulo}</h4>
                      <p className="text-sm text-muted-foreground">
                        {concluidos}/{total} módulos concluídos
                      </p>
                    </div>
                    {progresso === 100 ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                    ) : (
                      <Badge variant="outline" className="flex-shrink-0">
                        {trilha.prioridade}
                      </Badge>
                    )}
                  </div>
                  <Progress value={progresso} className="h-2" />
                </div>
              );
            })}
          </div>
          
          {modulosPendentes.length > 0 && (
            <Button 
              className="w-full" 
              variant="outline"
              onClick={() => setShowDetalhes(true)}
            >
              Ver Módulos Detalhados ({modulosPendentes.length} pendentes)
            </Button>
          )}
        </CardContent>
      </Card>

      <Dialog open={showDetalhes} onOpenChange={setShowDetalhes}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Módulos Obrigatórios</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {(preparacao.trilhas as any[]).map((trilha: any, idx: number) => {
              const modulosDaTrilha = preparacao.modulos.filter(
                (m: any) => m.trilha_titulo === trilha.titulo
              );
              
              return (
                <div key={idx} className="space-y-3">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{trilha.titulo}</h3>
                    <Badge variant="outline">{trilha.prioridade}</Badge>
                  </div>
                  
                  <div className="space-y-2">
                    {modulosDaTrilha.map((modulo: any, mIdx: number) => (
                      <div 
                        key={mIdx}
                        className={`border rounded-lg p-3 ${
                          modulo.concluido ? 'bg-green-50 border-green-200' : 'bg-white'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              {modulo.concluido ? (
                                <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                              ) : (
                                <div className="h-4 w-4 rounded-full border-2 border-gray-300 flex-shrink-0" />
                              )}
                              <span className={`font-medium ${modulo.concluido ? 'text-green-900' : ''}`}>
                                {modulo.titulo}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground ml-6">
                              {modulo.videos_concluidos}/{modulo.total_videos} vídeos concluídos
                            </p>
                          </div>
                          {!modulo.concluido && modulo.video_ids.length > 0 && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                // Navegar para o primeiro vídeo não concluído do módulo
                                navigate(`/video/${modulo.video_ids[0]}`);
                                setShowDetalhes(false);
                              }}
                            >
                              Assistir
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
