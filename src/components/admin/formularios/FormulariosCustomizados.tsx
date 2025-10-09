import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Eye, Edit, Archive, Calendar, Users, CheckCircle2, Clock } from "lucide-react";
import { useFormulariosCustomizados, useUpdateFormulario } from "@/hooks/useFormulariosCustomizados";
import { FormularioCustomizadoModal } from "./FormularioCustomizadoModal";
import { RespostasFormularioDrawer } from "./RespostasFormularioDrawer";
import { format, isPast, differenceInDays } from "date-fns";
import { ptBR } from "date-fns/locale";

export const FormulariosCustomizados = () => {
  const [showModal, setShowModal] = useState(false);
  const [selectedFormularioId, setSelectedFormularioId] = useState<string | null>(null);
  
  const { formularios, isLoading } = useFormulariosCustomizados();
  const updateFormulario = useUpdateFormulario();

  const handleArquivar = async (id: string) => {
    await updateFormulario.mutateAsync({ id, status: "arquivado" });
  };

  const handleReabrir = async (id: string) => {
    await updateFormulario.mutateAsync({ id, status: "ativo" });
  };

  const getStatusColor = (status: string, dataExpiracao?: string) => {
    if (status === "arquivado") return "secondary";
    if (dataExpiracao && isPast(new Date(dataExpiracao))) return "destructive";
    return "default";
  };

  const getStatusLabel = (status: string, dataExpiracao?: string) => {
    if (status === "arquivado") return "Arquivado";
    if (dataExpiracao && isPast(new Date(dataExpiracao))) return "Expirado";
    return "Ativo";
  };

  const getDiasRestantes = (dataExpiracao?: string) => {
    if (!dataExpiracao) return null;
    const dias = differenceInDays(new Date(dataExpiracao), new Date());
    if (dias < 0) return null;
    return dias;
  };

  if (isLoading) {
    return <div className="text-center py-8">Carregando formulários...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Formulários Customizados</h2>
        <Button onClick={() => setShowModal(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Criar Formulário
        </Button>
      </div>

      <div className="space-y-4">
        {formularios.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground mb-4">
              Nenhum formulário criado ainda
            </p>
            <Button onClick={() => setShowModal(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Criar Primeiro Formulário
            </Button>
          </Card>
        ) : (
          formularios.map((formulario) => {
            const diasRestantes = getDiasRestantes(formulario.data_expiracao);
            const expirado = formulario.data_expiracao && isPast(new Date(formulario.data_expiracao));

            return (
              <Card key={formulario.id} className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold">
                        {formulario.titulo}
                      </h3>
                      <Badge variant={getStatusColor(formulario.status, formulario.data_expiracao)}>
                        {getStatusLabel(formulario.status, formulario.data_expiracao)}
                      </Badge>
                    </div>

                    {formulario.descricao && (
                      <p className="text-sm text-muted-foreground mb-3">
                        {formulario.descricao}
                      </p>
                    )}

                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        Para: {formulario.visibilidade === "todos" 
                          ? "Todos os mentorados" 
                          : `${formulario.mentorados_ids.length} mentorado(s)`}
                      </div>

                      {formulario.data_expiracao && (
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {expirado ? "Expirou em: " : "Expira em: "}
                          {format(new Date(formulario.data_expiracao), "dd/MM/yyyy", { locale: ptBR })}
                          {diasRestantes !== null && diasRestantes > 0 && (
                            <span className="text-orange-500">
                              ({diasRestantes} {diasRestantes === 1 ? "dia" : "dias"})
                            </span>
                          )}
                        </div>
                      )}

                      <div className="flex items-center gap-1">
                        <CheckCircle2 className="h-4 w-4" />
                        Respostas: {formulario.total_respostas}
                      </div>

                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {formulario.perguntas_geradas.tempo_estimado}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedFormularioId(formulario.id)}
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      Ver Respostas
                    </Button>

                    {formulario.status === "ativo" && !expirado && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleArquivar(formulario.id)}
                      >
                        <Archive className="mr-2 h-4 w-4" />
                        Arquivar
                      </Button>
                    )}

                    {(formulario.status === "arquivado" || expirado) && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleReabrir(formulario.id)}
                      >
                        Reabrir
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>

      <FormularioCustomizadoModal
        open={showModal}
        onOpenChange={setShowModal}
      />

      {selectedFormularioId && (
        <RespostasFormularioDrawer
          formularioId={selectedFormularioId}
          open={!!selectedFormularioId}
          onOpenChange={(open) => !open && setSelectedFormularioId(null)}
        />
      )}
    </div>
  );
};
