import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useFormularios } from "@/hooks/admin/useFormularios";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { User, CheckCircle2, XCircle, Eye, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

type DiagnosticoTipo = 'academy' | 'business' | 'legacy';

interface RespostasDiagnosticoDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tipo: DiagnosticoTipo;
}

const TITULOS = {
  academy: "Diagnóstico Academy",
  business: "Diagnóstico Business",
  legacy: "Diagnóstico Mentoria",
};

export function RespostasDiagnosticoDrawer({ 
  open, 
  onOpenChange, 
  tipo 
}: RespostasDiagnosticoDrawerProps) {
  const titulo = TITULOS[tipo];
  const navigate = useNavigate();
  const { data: formularios, isLoading } = useFormularios();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Filtrar por plano do usuário baseado no tipo selecionado
  const respostas = formularios?.filter(f => {
    const plano = f.profiles?.plano_mentoria;
    
    if (tipo === 'business') {
      return plano === 'business';
    } else if (tipo === 'academy') {
      return plano === 'academy' || plano === 'skills';
    } else {
      // legacy - usuários sem plano específico ou planos antigos
      return !plano || !['academy', 'business', 'skills'].includes(plano);
    }
  }) || [];

  const handleVerDetalhes = (userId: string) => {
    // Navegar para a página de diagnóstico do usuário
    navigate(`/admin/mentoria/academy?user=${userId}`);
    onOpenChange(false);
  };

  // Helper para detectar se é formulário Business (novos campos)
  const isBusinessForm = (resposta: any) => {
    return resposta.empresa_nome || resposta.cargo_atual || resposta.interesse_alem_entrega;
  };

  // Helper para renderizar campos Business
  const renderBusinessFields = (resposta: any) => (
    <>
      {resposta.cargo_atual && (
        <div>
          <p className="text-muted-foreground">Cargo</p>
          <p className="font-medium">{resposta.cargo_atual}</p>
        </div>
      )}
      {resposta.empresa_nome && (
        <div>
          <p className="text-muted-foreground">Empresa</p>
          <p className="font-medium">{resposta.empresa_nome}</p>
        </div>
      )}
      {resposta.tamanho_empresa && (
        <div>
          <p className="text-muted-foreground">Porte</p>
          <p className="font-medium capitalize">{resposta.tamanho_empresa.replace(/_/g, ' ')}</p>
        </div>
      )}
      {resposta.impacto_financeiro_estimado && (
        <div>
          <p className="text-muted-foreground">Impacto Financeiro</p>
          <p className="font-medium">{resposta.impacto_financeiro_estimado}</p>
        </div>
      )}
      {resposta.importancia_projeto && (
        <div>
          <p className="text-muted-foreground">Importância</p>
          <p className="font-medium">{resposta.importancia_projeto}/10</p>
        </div>
      )}
      {resposta.interesse_alem_entrega && Array.isArray(resposta.interesse_alem_entrega) && (
        <div className="col-span-2">
          <p className="text-muted-foreground">Interesse além da entrega</p>
          <div className="flex flex-wrap gap-1 mt-1">
            {resposta.interesse_alem_entrega.map((interesse: string) => (
              <Badge key={interesse} variant="secondary" className="text-xs">
                {interesse}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </>
  );

  // Helper para renderizar campos Academy/Legacy
  const renderAcademyFields = (resposta: any) => (
    <>
      {resposta.profissao && (
        <div>
          <p className="text-muted-foreground">Profissão</p>
          <p className="font-medium">{resposta.profissao}</p>
        </div>
      )}
      {resposta.area_atuacao && (
        <div>
          <p className="text-muted-foreground">Área de Atuação</p>
          <p className="font-medium capitalize">{resposta.area_atuacao.replace(/_/g, ' ')}</p>
        </div>
      )}
      {resposta.nivel_ia && (
        <div>
          <p className="text-muted-foreground">Nível de IA</p>
          <p className="font-medium capitalize">{resposta.nivel_ia.replace(/_/g, ' ')}</p>
        </div>
      )}
      {resposta.objetivo_principal && (
        <div>
          <p className="text-muted-foreground">Objetivo Principal</p>
          <p className="font-medium">{resposta.objetivo_principal}</p>
        </div>
      )}
      {resposta.nivel_comprometimento && (
        <div>
          <p className="text-muted-foreground">Comprometimento</p>
          <p className="font-medium">{resposta.nivel_comprometimento}/10</p>
        </div>
      )}
      {resposta.tempo_disponivel && (
        <div>
          <p className="text-muted-foreground">Tempo Disponível</p>
          <p className="font-medium">{resposta.tempo_disponivel}</p>
        </div>
      )}
    </>
  );

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-2xl">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-aplicada-green-700" />
            Respostas: {titulo}
            <Badge variant="secondary">{respostas.length} total</Badge>
          </SheetTitle>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-120px)] mt-6 pr-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-aplicada-green-700" />
            </div>
          ) : respostas.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              Nenhuma resposta encontrada
            </div>
          ) : (
            <Accordion 
              type="single" 
              collapsible 
              value={expandedId || undefined}
              onValueChange={setExpandedId}
              className="space-y-3"
            >
              {respostas.map((resposta) => {
                const isBusiness = isBusinessForm(resposta);
                
                return (
                  <AccordionItem 
                    key={resposta.id} 
                    value={resposta.id}
                    className="border rounded-lg px-4"
                  >
                    <AccordionTrigger className="hover:no-underline py-3">
                      <div className="flex items-center justify-between w-full pr-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            isBusiness ? 'bg-primary/10' : 'bg-aplicada-green-700/10'
                          }`}>
                            {isBusiness ? (
                              <Building2 className="h-5 w-5 text-primary" />
                            ) : (
                              <User className="h-5 w-5 text-aplicada-green-700" />
                            )}
                          </div>
                          <div className="text-left">
                            <p className="font-medium">
                              {resposta.nome_completo || resposta.profiles?.nome_completo || 'Sem nome'}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {format(new Date(resposta.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {isBusiness && (
                            <Badge variant="default" className="bg-primary text-xs">
                              Business
                            </Badge>
                          )}
                          {resposta.completado ? (
                            <Badge variant="default" className="gap-1">
                              <CheckCircle2 className="h-3 w-3" />
                              Completo
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="gap-1">
                              <XCircle className="h-3 w-3" />
                              Incompleto
                            </Badge>
                          )}
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pb-4">
                      <Card className="border-0 shadow-none bg-muted/50">
                        <CardContent className="pt-4 space-y-4">
                          {/* Resumo das respostas - adaptativo */}
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            {isBusiness ? renderBusinessFields(resposta) : renderAcademyFields(resposta)}
                          </div>

                          {/* Desafios (comum a ambos) */}
                          {(resposta.desafio_1 || resposta.desafio_2 || resposta.desafio_3) && (
                            <div>
                              <p className="text-muted-foreground text-sm mb-2">Desafios</p>
                              <div className="space-y-1">
                                {resposta.desafio_1 && <p className="text-sm">1. {resposta.desafio_1}</p>}
                                {resposta.desafio_2 && <p className="text-sm">2. {resposta.desafio_2}</p>}
                                {resposta.desafio_3 && <p className="text-sm">3. {resposta.desafio_3}</p>}
                              </div>
                            </div>
                          )}

                          {/* Problema principal (Business) */}
                          {resposta.problema_principal && (
                            <div>
                              <p className="text-muted-foreground text-sm">Problema Principal</p>
                              <p className="text-sm">{resposta.problema_principal}</p>
                            </div>
                          )}

                          {/* Metas (Academy) */}
                          {resposta.meta_3_meses && (
                            <div>
                              <p className="text-muted-foreground text-sm">Meta 3 meses</p>
                              <p className="text-sm">{resposta.meta_3_meses}</p>
                            </div>
                          )}

                          {/* Definição de Sucesso (Business novo) */}
                          {resposta.definicao_sucesso && (
                            <div>
                              <p className="text-muted-foreground text-sm">Definição de Sucesso</p>
                              <p className="text-sm">{resposta.definicao_sucesso}</p>
                            </div>
                          )}

                          {/* Botão de ação */}
                          <div className="flex justify-end pt-2">
                            <Button 
                              size="sm" 
                              onClick={() => handleVerDetalhes(resposta.user_id)}
                              className="bg-aplicada-green-700 hover:bg-aplicada-green-800"
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              Ver Diagnóstico Completo
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
