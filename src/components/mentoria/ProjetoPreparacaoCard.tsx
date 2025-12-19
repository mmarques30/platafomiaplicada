import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { CheckCircle2, AlertCircle, Clock, Lock } from "lucide-react";
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
  
  if (!preparacao || (preparacao.trilhas.length === 0 && preparacao.modulos.length === 0)) {
    return null;
  }
  
  const modulosPendentes = preparacao.modulos.filter(m => !m.concluido && m.status !== 'em_breve');
  const modulosEmBreve = preparacao.modulos.filter(m => m.status === 'em_breve');
  const trilhasEmBreve = preparacao.trilhas.filter((t: any) => t.status === 'em_breve');
  
  return (
    <>
      <Card className="border-l-4 border-l-primary">
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-2">
            <Badge variant={preparacao.progressoGeral === 100 ? "default" : "secondary"}>
              {preparacao.progressoGeral}% concluído
            </Badge>
            {(trilhasEmBreve.length > 0 || modulosEmBreve.length > 0) && (
              <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                <Clock className="h-3 w-3 mr-1" />
                {trilhasEmBreve.length + modulosEmBreve.length} conteúdo(s) em breve
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {preparacao.progressoGeral < 100 && modulosPendentes.length > 0 && (
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
              const isEmBreve = trilha.status === 'em_breve';
              const modulosDaTrilha = preparacao.modulos.filter(
                (m: any) => m.trilha_titulo === trilha.titulo || m.trilha_id === trilha.trilha_id
              );
              const modulosDisponiveis = modulosDaTrilha.filter((m: any) => m.status !== 'em_breve');
              const concluidos = modulosDisponiveis.filter((m: any) => m.concluido).length;
              const total = modulosDisponiveis.length;
              const progresso = total > 0 ? (concluidos / total) * 100 : 0;
              
              return (
                <div 
                  key={idx} 
                  className={`border rounded-lg p-4 space-y-2 ${
                    isEmBreve ? 'bg-muted/30 border-dashed' : ''
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{trilha.titulo}</h4>
                        {isEmBreve && (
                          <Badge variant="secondary" className="bg-amber-100 text-amber-800 text-xs">
                            <Clock className="h-3 w-3 mr-1" />
                            Em breve
                          </Badge>
                        )}
                      </div>
                      {!isEmBreve && (
                        <p className="text-sm text-muted-foreground">
                          {concluidos}/{total} módulos concluídos
                        </p>
                      )}
                      {isEmBreve && (
                        <p className="text-sm text-muted-foreground italic">
                          Este conteúdo será liberado em breve
                        </p>
                      )}
                    </div>
                    {!isEmBreve && progresso === 100 ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                    ) : isEmBreve ? (
                      <Lock className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                    ) : (
                      <Badge variant="outline" className="flex-shrink-0">
                        {trilha.prioridade}
                      </Badge>
                    )}
                  </div>
                  {!isEmBreve && <Progress value={progresso} className="h-2" />}
                </div>
              );
            })}
          </div>
          
          {(modulosPendentes.length > 0 || modulosEmBreve.length > 0) && (
            <Button 
              className="w-full" 
              variant="outline"
              onClick={() => setShowDetalhes(true)}
            >
              Ver Módulos Detalhados ({modulosPendentes.length} pendentes{modulosEmBreve.length > 0 ? `, ${modulosEmBreve.length} em breve` : ''})
            </Button>
          )}
        </CardContent>
      </Card>

      <Dialog open={showDetalhes} onOpenChange={setShowDetalhes}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Módulos de Preparação</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {(preparacao.trilhas as any[]).map((trilha: any, idx: number) => {
              const isEmBreve = trilha.status === 'em_breve';
              const modulosDaTrilha = preparacao.modulos.filter(
                (m: any) => m.trilha_titulo === trilha.titulo || m.trilha_id === trilha.trilha_id
              );
              
              if (modulosDaTrilha.length === 0) return null;
              
              return (
                <div key={idx} className="space-y-3">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{trilha.titulo}</h3>
                    {isEmBreve ? (
                      <Badge variant="secondary" className="bg-amber-100 text-amber-800">
                        <Clock className="h-3 w-3 mr-1" />
                        Em breve
                      </Badge>
                    ) : (
                      <Badge variant="outline">{trilha.prioridade}</Badge>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    {modulosDaTrilha.map((modulo: any, mIdx: number) => {
                      const moduloEmBreve = modulo.status === 'em_breve';
                      
                      return (
                        <div 
                          key={mIdx}
                          className={`border rounded-lg p-3 ${
                            modulo.concluido 
                              ? 'bg-green-50 border-green-200' 
                              : moduloEmBreve 
                                ? 'bg-muted/30 border-dashed'
                                : 'bg-white'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                {modulo.concluido ? (
                                  <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                                ) : moduloEmBreve ? (
                                  <Lock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                ) : (
                                  <div className="h-4 w-4 rounded-full border-2 border-gray-300 flex-shrink-0" />
                                )}
                                <span className={`font-medium ${
                                  modulo.concluido 
                                    ? 'text-green-900' 
                                    : moduloEmBreve 
                                      ? 'text-muted-foreground' 
                                      : ''
                                }`}>
                                  {modulo.titulo}
                                </span>
                                {moduloEmBreve && (
                                  <Badge variant="secondary" className="bg-amber-100 text-amber-800 text-xs">
                                    Em breve
                                  </Badge>
                                )}
                              </div>
                              {!moduloEmBreve ? (
                                <p className="text-sm text-muted-foreground ml-6">
                                  {modulo.videos_concluidos || 0}/{modulo.total_videos || 0} vídeos concluídos
                                </p>
                              ) : (
                                <p className="text-sm text-muted-foreground ml-6 italic">
                                  Será liberado em breve
                                </p>
                              )}
                            </div>
                            {!modulo.concluido && !moduloEmBreve && modulo.video_ids && modulo.video_ids.length > 0 && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  navigate(`/video/${modulo.video_ids[0]}`);
                                  setShowDetalhes(false);
                                }}
                              >
                                Assistir
                              </Button>
                            )}
                          </div>
                        </div>
                      );
                    })}
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
