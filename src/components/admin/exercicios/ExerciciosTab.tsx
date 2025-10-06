import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2, Eye } from "lucide-react";
import { useExercicios, useRespostasExercicios } from "@/hooks/useExercicios";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { ExercicioModal } from "./ExercicioModal";
import { AvaliarRespostaModal } from "./AvaliarRespostaModal";

export function ExerciciosTab() {
  const { data: exercicios, isLoading } = useExercicios();
  const { data: respostas } = useRespostasExercicios();
  const [exercicioModal, setExercicioModal] = useState<{ open: boolean; exercicio?: any }>({ open: false });
  const [respostaModal, setRespostaModal] = useState<{ open: boolean; resposta?: any }>({ open: false });

  const respostasPendentes = respostas?.filter(r => r.status === 'pendente' || r.status === 'em_avaliacao') || [];

  if (isLoading) {
    return <Skeleton className="h-96" />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Exercícios Práticos</h2>
          <p className="text-muted-foreground">Gerencie exercícios e avalie respostas dos alunos</p>
        </div>
        <Button onClick={() => setExercicioModal({ open: true })}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Exercício
        </Button>
      </div>

      {/* Respostas Pendentes */}
      {respostasPendentes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              Respostas Pendentes de Avaliação
              <Badge variant="destructive">{respostasPendentes.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {respostasPendentes.map((resposta) => (
                <div key={resposta.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{resposta.exercicios_praticos?.titulo}</p>
                    <p className="text-sm text-muted-foreground">
                      Resposta enviada
                    </p>
                  </div>
                  <Button 
                    size="sm" 
                    onClick={() => setRespostaModal({ open: true, resposta })}
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    Avaliar
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista de Exercícios */}
      <Card>
        <CardHeader>
          <CardTitle>Todos os Exercícios</CardTitle>
        </CardHeader>
        <CardContent>
          {!exercicios || exercicios.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Nenhum exercício cadastrado ainda.
            </p>
          ) : (
            <div className="space-y-3">
              {exercicios.map((exercicio) => (
                <div key={exercicio.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <h3 className="font-semibold">{exercicio.titulo}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-1">{exercicio.descricao}</p>
                    <div className="flex gap-2 mt-2">
                      <Badge variant="outline">{exercicio.tipo_resposta}</Badge>
                      <Badge variant={exercicio.ativo ? 'default' : 'secondary'}>
                        {exercicio.ativo ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setExercicioModal({ open: true, exercicio })}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => {/* implement delete */}}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <ExercicioModal
        open={exercicioModal.open}
        onOpenChange={(open) => setExercicioModal({ open })}
        exercicio={exercicioModal.exercicio}
      />

      <AvaliarRespostaModal
        open={respostaModal.open}
        onOpenChange={(open) => setRespostaModal({ open })}
        resposta={respostaModal.resposta}
      />
    </div>
  );
}
