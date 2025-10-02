import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

interface ResumoDiagnosticoProps {
  formulario: any;
  onEditar: () => void;
}

export function ResumoDiagnostico({ formulario, onEditar }: ResumoDiagnosticoProps) {
  if (!formulario) return null;

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-3xl">Seu Diagnóstico de Mentoria IA</CardTitle>
              <CardDescription className="mt-2">
                Preenchido em {formatDate(formulario.created_at)}
              </CardDescription>
            </div>
            <Badge variant="secondary" className="h-fit">
              {formulario.completado ? "Completo" : "Em andamento"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Perfil */}
          <div>
            <h3 className="text-lg font-semibold mb-3">📋 Perfil Profissional</h3>
            <div className="grid gap-2 text-sm">
              <div><span className="font-medium">Nome:</span> {formulario.nome_completo}</div>
              <div><span className="font-medium">Idade:</span> {formulario.idade} anos</div>
              <div><span className="font-medium">Profissão:</span> {formulario.profissao}</div>
              <div><span className="font-medium">Área:</span> {formulario.area_atuacao}</div>
              <div><span className="font-medium">Experiência:</span> {formulario.tempo_experiencia}</div>
            </div>
          </div>

          <Separator />

          {/* Experiência IA */}
          <div>
            <h3 className="text-lg font-semibold mb-3">🤖 Experiência com IA</h3>
            <div className="grid gap-2 text-sm">
              <div><span className="font-medium">Nível:</span> {formulario.nivel_ia}</div>
              <div><span className="font-medium">Frequência de uso:</span> {formulario.frequencia_uso_ia}</div>
              {formulario.maior_dificuldade_ia && (
                <div>
                  <span className="font-medium">Maior dificuldade:</span>
                  <p className="text-muted-foreground mt-1">{formulario.maior_dificuldade_ia}</p>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Objetivos */}
          <div>
            <h3 className="text-lg font-semibold mb-3">🎯 Objetivos</h3>
            <div className="grid gap-2 text-sm">
              <div><span className="font-medium">Objetivo principal:</span> {formulario.objetivo_principal}</div>
              <div>
                <span className="font-medium">Meta 3 meses:</span>
                <p className="text-muted-foreground mt-1">{formulario.meta_3_meses}</p>
              </div>
              <div>
                <span className="font-medium">Meta 12 meses:</span>
                <p className="text-muted-foreground mt-1">{formulario.meta_12_meses}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Desafios */}
          <div>
            <h3 className="text-lg font-semibold mb-3">⚡ Principais Desafios</h3>
            <div className="space-y-2 text-sm">
              <div>
                <span className="font-medium">1.</span> {formulario.desafio_1}
              </div>
              <div>
                <span className="font-medium">2.</span> {formulario.desafio_2}
              </div>
              <div>
                <span className="font-medium">3.</span> {formulario.desafio_3}
              </div>
            </div>
          </div>

          <Separator />

          {/* Aprendizagem */}
          <div>
            <h3 className="text-lg font-semibold mb-3">📚 Estilo de Aprendizagem</h3>
            <div className="grid gap-2 text-sm">
              <div><span className="font-medium">Estilo:</span> {formulario.estilo_aprendizagem}</div>
              <div><span className="font-medium">Melhor horário:</span> {formulario.melhor_horario}</div>
              <div><span className="font-medium">Tipo de feedback:</span> {formulario.tipo_feedback}</div>
            </div>
          </div>

          <Separator />

          {/* Motivação */}
          <div>
            <h3 className="text-lg font-semibold mb-3">💪 Motivação</h3>
            <div className="grid gap-2 text-sm">
              <div>
                <span className="font-medium">Motivação:</span>
                <p className="text-muted-foreground mt-1">{formulario.motivacao_mentoria}</p>
              </div>
              <div>
                <span className="font-medium">Comprometimento:</span> {formulario.nivel_comprometimento}/10
              </div>
            </div>
          </div>

          <Separator />

          {/* Expectativas */}
          <div>
            <h3 className="text-lg font-semibold mb-3">🎁 Expectativas</h3>
            <div className="grid gap-2 text-sm">
              <div><span className="font-medium">Tipo de suporte:</span> {formulario.tipo_suporte}</div>
              <div><span className="font-medium">Frequência de feedback:</span> {formulario.frequencia_feedback}</div>
              <div><span className="font-medium">Preferência de sessões:</span> {formulario.preferencia_sessoes}</div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex gap-3">
          <Button onClick={onEditar}>Editar Respostas</Button>
          <Button variant="outline" onClick={() => window.print()}>
            Imprimir
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
