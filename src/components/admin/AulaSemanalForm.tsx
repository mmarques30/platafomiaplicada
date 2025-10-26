import { useState, useEffect } from "react";
import { useAulaSemanal } from "@/hooks/useAulaSemanal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export function AulaSemanalForm() {
  const { aulaAtiva, isLoading, atualizarAula } = useAulaSemanal();
  const [tema, setTema] = useState("");
  const [horario, setHorario] = useState("19:30");
  const [diaSemana, setDiaSemana] = useState("Toda semana");

  useEffect(() => {
    if (aulaAtiva) {
      setTema(aulaAtiva.tema);
      setHorario(aulaAtiva.horario);
      setDiaSemana(aulaAtiva.dia_semana);
    }
  }, [aulaAtiva]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (tema.trim().length < 10) {
      return;
    }

    atualizarAula.mutate({
      id: aulaAtiva?.id,
      tema,
      horario,
      dia_semana: diaSemana,
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gerenciar Tema da Aula Semanal</CardTitle>
        <CardDescription>
          Configure o tema que aparecerá no dashboard dos usuários
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="tema">Tema da Aula *</Label>
            <Textarea
              id="tema"
              value={tema}
              onChange={(e) => setTema(e.target.value)}
              placeholder="Ex: Automação de processos com IA"
              required
              minLength={10}
              rows={3}
              className="resize-none"
            />
            <p className="text-sm text-muted-foreground">
              Mínimo 10 caracteres ({tema.length}/10)
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="horario">Horário</Label>
              <Input
                id="horario"
                type="text"
                value={horario}
                onChange={(e) => setHorario(e.target.value)}
                placeholder="19:30"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dia_semana">Dia da Semana</Label>
              <Input
                id="dia_semana"
                type="text"
                value={diaSemana}
                onChange={(e) => setDiaSemana(e.target.value)}
                placeholder="Ex: Toda quinta-feira"
              />
            </div>
          </div>

          <Button 
            type="submit" 
            disabled={atualizarAula.isPending || tema.trim().length < 10}
            className="w-full"
          >
            {atualizarAula.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Salvando...
              </>
            ) : (
              'Salvar Tema da Aula'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
