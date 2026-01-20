import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Sparkles, Calendar, Target, CheckCircle2, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useGerarEtapasIA, useBulkCreateEtapas, type EtapaGeradaIA } from "@/hooks/useEtapasBusiness";
import { ContratoBusiness } from "@/hooks/useContratosBusiness";

interface GerarEtapasIAModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contrato: ContratoBusiness;
  onSuccess: () => void;
}

export function GerarEtapasIAModal({ open, onOpenChange, contrato, onSuccess }: GerarEtapasIAModalProps) {
  const [etapasGeradas, setEtapasGeradas] = useState<EtapaGeradaIA[] | null>(null);
  const [meta, setMeta] = useState<{ total_etapas: number; dias_por_etapa: number } | null>(null);
  
  const gerarEtapas = useGerarEtapasIA();
  const bulkCreate = useBulkCreateEtapas();

  const handleGerar = async () => {
    // Usa os campos do contrato, com fallback para valores vazios
    const modulosSelecionados = (contrato as any).modulos_selecionados || [];
    const fasesProjetoData = (contrato as any).fases_projeto || [];
    const contexto = (contrato as any).contexto_transformacao || '';
    const dores = (contrato as any).dores_mapeadas || [];
    const empresa = (contrato as any).nome_empresa || 'Cliente';

    const result = await gerarEtapas.mutateAsync({
      modulos_selecionados: modulosSelecionados,
      tempo_consultoria_meses: contrato.tempo_consultoria_meses,
      reunioes_mensais: contrato.reunioes_mensais,
      fases_projeto: fasesProjetoData,
      entregas_esperadas: contrato.entregas_esperadas || [],
      contexto_transformacao: contexto,
      dores_mapeadas: dores,
      nome_empresa: empresa,
      data_inicio: contrato.data_inicio || new Date().toISOString(),
    });

    setEtapasGeradas(result.etapas);
    setMeta(result.meta);
  };

  const handleConfirmar = async () => {
    if (!etapasGeradas) return;

    await bulkCreate.mutateAsync({
      contratoId: contrato.id,
      etapas: etapasGeradas,
    });

    onSuccess();
    onOpenChange(false);
    setEtapasGeradas(null);
    setMeta(null);
  };

  const handleClose = () => {
    onOpenChange(false);
    setEtapasGeradas(null);
    setMeta(null);
  };

  const totalEncontros = contrato.reunioes_mensais * contrato.tempo_consultoria_meses;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Gerar Roadmap via IA
          </DialogTitle>
          <DialogDescription>
            A IA irá criar um roadmap personalizado baseado nos dados do contrato.
          </DialogDescription>
        </DialogHeader>

        {!etapasGeradas ? (
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-3 gap-3">
              <Card className="border-border/50">
                <CardContent className="pt-4 text-center">
                  <p className="text-2xl font-bold text-primary">{contrato.tempo_consultoria_meses}</p>
                  <p className="text-xs text-muted-foreground">meses de contrato</p>
                </CardContent>
              </Card>
              <Card className="border-border/50">
                <CardContent className="pt-4 text-center">
                  <p className="text-2xl font-bold text-primary">{contrato.reunioes_mensais}</p>
                  <p className="text-xs text-muted-foreground">reuniões/mês</p>
                </CardContent>
              </Card>
              <Card className="border-border/50">
                <CardContent className="pt-4 text-center">
                  <p className="text-2xl font-bold text-primary">{totalEncontros}</p>
                  <p className="text-xs text-muted-foreground">encontros totais</p>
                </CardContent>
              </Card>
            </div>

            {((contrato as any).modulos_selecionados?.length > 0) && (
              <div>
                <p className="text-sm font-medium mb-2">Módulos contratados:</p>
                <div className="flex flex-wrap gap-1">
                  {((contrato as any).modulos_selecionados as any[]).map((modulo: any, index: number) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {modulo.nome || modulo}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-muted/50 rounded-lg p-4 text-sm text-muted-foreground">
              <p className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>
                  A IA irá gerar {totalEncontros} etapas distribuídas ao longo de {contrato.tempo_consultoria_meses} meses, 
                  considerando os módulos e entregas do contrato.
                </span>
              </p>
            </div>
          </div>
        ) : (
          <ScrollArea className="max-h-[50vh] pr-4">
            <div className="space-y-3 py-2">
              {meta && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  {meta.total_etapas} etapas geradas (~{meta.dias_por_etapa} dias cada)
                </div>
              )}
              
              {etapasGeradas.map((etapa, index) => (
                <Card key={index} className="border-border/50">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="text-xs">
                            Encontro {etapa.numero_etapa}
                          </Badge>
                          {etapa.data_prevista && (
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {format(new Date(etapa.data_prevista), "dd/MM/yyyy", { locale: ptBR })}
                            </span>
                          )}
                        </div>
                        <h4 className="font-medium text-sm">{etapa.titulo}</h4>
                        {etapa.objetivo && (
                          <p className="text-xs text-muted-foreground mt-1 flex items-start gap-1">
                            <Target className="h-3 w-3 mt-0.5 flex-shrink-0" />
                            {etapa.objetivo}
                          </p>
                        )}
                        {etapa.marcos_proxima_etapa && etapa.marcos_proxima_etapa.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {etapa.marcos_proxima_etapa.map((marco, mIndex) => (
                              <Badge key={mIndex} variant="secondary" className="text-[10px]">
                                {marco}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancelar
          </Button>
          
          {!etapasGeradas ? (
            <Button onClick={handleGerar} disabled={gerarEtapas.isPending}>
              {gerarEtapas.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Gerando...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Gerar Roadmap
                </>
              )}
            </Button>
          ) : (
            <Button onClick={handleConfirmar} disabled={bulkCreate.isPending}>
              {bulkCreate.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Confirmar e Salvar
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
