import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Target, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useMentoriaObjetivos } from "@/hooks/useMentoriaObjetivos";
import ObjetivoModal from "@/components/admin/mentoria/ObjetivoModal";
import { ObjetivoMentoria } from "@/hooks/useMentoriaObjetivos";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function MentoriaObjetivos() {
  const navigate = useNavigate();
  const { objetivos, createObjetivo, updateObjetivo, isCreating, isUpdating } = useMentoriaObjetivos();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingObjetivo, setEditingObjetivo] = useState<ObjetivoMentoria | undefined>();

  const handleCreate = (data: Partial<ObjetivoMentoria>) => {
    createObjetivo(data);
  };

  const handleEdit = (objetivo: ObjetivoMentoria) => {
    setEditingObjetivo(objetivo);
    setModalOpen(true);
  };

  const handleUpdate = (data: Partial<ObjetivoMentoria>) => {
    if (editingObjetivo) {
      updateObjetivo({ ...data, id: editingObjetivo.id });
      setEditingObjetivo(undefined);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      em_andamento: { variant: "secondary" as const, label: "Em Andamento" },
      concluido: { variant: "default" as const, label: "Concluído" },
      cancelado: { variant: "destructive" as const, label: "Cancelado" }
    };
    const config = variants[status as keyof typeof variants];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <Button
        variant="ghost"
        onClick={() => navigate("/mentoria")}
        className="mb-6 -ml-2"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Voltar para Mentoria
      </Button>

      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-3">Meus Objetivos</h1>
        <p className="text-muted-foreground text-lg">
          Gerencie seus objetivos de aprendizagem e desenvolvimento
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Objetivos de Desenvolvimento
              </CardTitle>
              <CardDescription>
                Defina e acompanhe seus objetivos de aprendizagem
              </CardDescription>
            </div>
            <Button onClick={() => { setEditingObjetivo(undefined); setModalOpen(true); }}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Objetivo
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {objetivos.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Target className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg">Nenhum objetivo cadastrado ainda</p>
              <p className="text-sm mt-2">Comece criando seu primeiro objetivo de desenvolvimento</p>
            </div>
          ) : (
            <div className="space-y-4">
              {objetivos.map((objetivo) => (
                <Card key={objetivo.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleEdit(objetivo)}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{objetivo.objetivo}</CardTitle>
                      {getStatusBadge(objetivo.status)}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {objetivo.progresso !== undefined && objetivo.progresso > 0 && (
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span>Progresso</span>
                          <span className="font-medium">{objetivo.progresso}%</span>
                        </div>
                        <Progress value={objetivo.progresso} />
                      </div>
                    )}
                    <div className="text-sm space-y-1">
                      {objetivo.prazo && (
                        <p>
                          <strong>Prazo:</strong> {format(new Date(objetivo.prazo), "dd/MM/yyyy", { locale: ptBR })}
                        </p>
                      )}
                      {objetivo.observacoes && (
                        <p className="text-muted-foreground">{objetivo.observacoes}</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <ObjetivoModal
        open={modalOpen}
        onOpenChange={(open) => {
          setModalOpen(open);
          if (!open) setEditingObjetivo(undefined);
        }}
        onSubmit={editingObjetivo ? handleUpdate : handleCreate}
        objetivo={editingObjetivo}
        isLoading={isCreating || isUpdating}
      />
    </div>
  );
}
