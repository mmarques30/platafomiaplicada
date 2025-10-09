
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useFormulariosDisponiveis, useRespostasFormulario } from "@/hooks/useFormulariosCustomizados";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { format, differenceInDays, isPast } from "date-fns";
import { ptBR } from "date-fns/locale";
import { FileText, Clock, Calendar, CheckCircle2 } from "lucide-react";

const FormulariosDisponiveis = () => {
  const { user } = useAuth();
  const { formularios, isLoading } = useFormulariosDisponiveis();
  const navigate = useNavigate();

  const getDiasRestantes = (dataExpiracao?: string) => {
    if (!dataExpiracao) return null;
    const dias = differenceInDays(new Date(dataExpiracao), new Date());
    if (dias < 0) return null;
    return dias;
  };


  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Carregando formulários...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl py-8 space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">📋 Seus Formulários</h1>
          <p className="text-muted-foreground">
            Responda aos formulários para compartilhar seu progresso e feedback
          </p>
        </div>

        {/* Pendentes */}
        <div>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            ⏰ Pendentes ({formularios.filter(f => {
              const jaRespondeu = false; // Simplificado por enquanto
              return !jaRespondeu;
            }).length})
          </h2>
          
          <div className="space-y-4">
            {formularios.filter(f => !isPast(new Date(f.data_expiracao || new Date().toISOString()))).length === 0 ? (
              <Card className="p-6 text-center">
                <p className="text-muted-foreground">
                  Nenhum formulário pendente no momento
                </p>
              </Card>
            ) : (
              formularios
                .filter(f => !isPast(new Date(f.data_expiracao || new Date().toISOString())))
                .map((formulario) => {
                  const diasRestantes = getDiasRestantes(formulario.data_expiracao);

                  return (
                    <Card key={formulario.id} className="p-6 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-lg font-semibold">
                              {formulario.titulo}
                            </h3>
                            {diasRestantes !== null && diasRestantes <= 3 && (
                              <Badge variant="destructive">
                                🔴 Vence em {diasRestantes} {diasRestantes === 1 ? "dia" : "dias"}
                              </Badge>
                            )}
                            {diasRestantes !== null && diasRestantes > 3 && (
                              <Badge variant="secondary">
                                🟡 Vence em {diasRestantes} dias
                              </Badge>
                            )}
                          </div>

                          {formulario.descricao && (
                            <p className="text-sm text-muted-foreground mb-3">
                              {formulario.descricao}
                            </p>
                          )}

                          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                            {formulario.data_expiracao && (
                              <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                Vence: {format(new Date(formulario.data_expiracao), "dd/MM/yyyy", { locale: ptBR })}
                              </div>
                            )}
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {formulario.perguntas_geradas.tempo_estimado}
                            </div>
                            <div className="flex items-center gap-1">
                              <FileText className="h-4 w-4" />
                              {formulario.perguntas_geradas.perguntas.length} perguntas
                            </div>
                          </div>
                        </div>

                        <Button 
                          onClick={() => navigate(`/mentoria/formularios/${formulario.id}`)}
                        >
                          Responder Agora
                        </Button>
                      </div>
                    </Card>
                  );
                })
            )}
          </div>
        </div>

        {/* Respondidos */}
        <div>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            ✅ Respondidos
          </h2>
          
          <div className="space-y-4">
            {formularios.filter(f => isPast(new Date(f.data_expiracao || "2099-01-01"))).length === 0 ? (
              <Card className="p-6 text-center">
                <p className="text-muted-foreground">
                  Você ainda não respondeu nenhum formulário
                </p>
              </Card>
            ) : (
              <Card className="p-6">
                <p className="text-sm text-muted-foreground">
                  Histórico de formulários em breve
                </p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FormulariosDisponiveis;
