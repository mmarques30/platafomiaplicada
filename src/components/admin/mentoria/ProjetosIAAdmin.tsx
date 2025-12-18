import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Lightbulb, Save, Bell, MessageSquare } from "lucide-react";
import { useMentoriaProjetos } from "@/hooks/useMentoriaProjetos";
import { useProjetosIAAdmin } from "@/hooks/useProjetosIAAdmin";
import { Skeleton } from "@/components/ui/skeleton";

interface ProjetosIAAdminProps {
  userId: string;
}

export function ProjetosIAAdmin({ userId }: ProjetosIAAdminProps) {
  const { projetos, isLoading } = useMentoriaProjetos(userId);
  const { salvarComentario, isSaving } = useProjetosIAAdmin();
  const [comentarios, setComentarios] = useState<Record<string, { dicas: string; devolutiva: string }>>({});

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  // Filtrar projetos gerados pela IA (operacionais em planejamento)
  const projetosIA = projetos?.filter(
    (p) => p.status === "planejamento" && p.tipo === "operacional"
  );

  if (!projetosIA || projetosIA.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Lightbulb className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-lg font-medium">Nenhum projeto gerado pela IA</p>
          <p className="text-sm text-muted-foreground">
            Este aluno ainda não completou o diagnóstico ou não foram gerados projetos
          </p>
        </CardContent>
      </Card>
    );
  }

  const handleComentarioChange = (projetoId: string, field: 'dicas' | 'devolutiva', value: string) => {
    setComentarios(prev => ({
      ...prev,
      [projetoId]: {
        ...prev[projetoId],
        [field]: value
      }
    }));
  };

  const handleSalvar = (projeto: typeof projetosIA[0]) => {
    const comentario = comentarios[projeto.id] || { dicas: '', devolutiva: '' };
    salvarComentario({
      projetoId: projeto.id,
      userId: projeto.user_id,
      comentariosMentor: comentario.dicas || projeto.comentarios_mentor || '',
      devolutivaMentor: comentario.devolutiva || projeto.devolutiva_mentor || '',
      projetoTitulo: projeto.titulo
    });
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-primary" />
            Projetos Gerados pela IA
          </CardTitle>
          <CardDescription>
            Revise os projetos sugeridos e adicione dicas e comentários para o aluno
          </CardDescription>
        </CardHeader>
      </Card>

      {projetosIA.map((projeto) => {
        const comentario = comentarios[projeto.id] || {
          dicas: projeto.comentarios_mentor || '',
          devolutiva: projeto.devolutiva_mentor || ''
        };
        const hasExistingFeedback = projeto.comentarios_mentor || projeto.devolutiva_mentor;

        return (
          <Card key={projeto.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{projeto.titulo}</CardTitle>
                  <CardDescription className="mt-1">{projeto.descricao}</CardDescription>
                </div>
                <div className="flex gap-2">
                  {hasExistingFeedback && (
                    <Badge variant="secondary" className="bg-green-500/10 text-green-600">
                      <MessageSquare className="h-3 w-3 mr-1" />
                      Com feedback
                    </Badge>
                  )}
                  <Badge variant="outline">IA</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Informações do projeto */}
              <div className="grid gap-3 p-4 rounded-lg bg-muted/50">
                <div>
                  <span className="text-sm font-medium text-muted-foreground">Objetivo:</span>
                  <p className="text-sm">{projeto.objetivo_projeto}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-muted-foreground">Contribuição ao plano:</span>
                  <p className="text-sm">{projeto.contribuicao_plano}</p>
                </div>
              </div>

              {/* Campos de feedback */}
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Dicas e Sugestões
                  </label>
                  <Textarea
                    placeholder="Adicione dicas práticas para o aluno implementar este projeto..."
                    value={comentario.dicas}
                    onChange={(e) => handleComentarioChange(projeto.id, 'dicas', e.target.value)}
                    className="min-h-[100px]"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Devolutiva da Mentora
                  </label>
                  <Textarea
                    placeholder="Adicione sua análise e orientações sobre este projeto..."
                    value={comentario.devolutiva}
                    onChange={(e) => handleComentarioChange(projeto.id, 'devolutiva', e.target.value)}
                    className="min-h-[100px]"
                  />
                </div>
              </div>

              <Button
                onClick={() => handleSalvar(projeto)}
                disabled={isSaving}
                className="w-full sm:w-auto"
              >
                <Save className="h-4 w-4 mr-2" />
                Salvar e Notificar Aluno
                <Bell className="h-4 w-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
