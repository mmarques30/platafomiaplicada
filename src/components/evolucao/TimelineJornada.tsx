import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Circle, Lock } from "lucide-react";
import { useTrilhasConcluidas, useTrilhasEmAndamento } from "@/hooks/useEvolucao";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export function TimelineJornada() {
  const { data: concluidas } = useTrilhasConcluidas();
  const { data: emAndamento } = useTrilhasEmAndamento();

  // Criar lista de marcos da jornada
  const marcos = [
    ...(concluidas || []).map((t) => ({
      tipo: "concluido" as const,
      titulo: t.titulo,
      data: t.dataConclusao,
      descricao: `Trilha completa com ${t.totalVideos} vídeos`,
    })),
    ...(emAndamento || []).slice(0, 1).map((t) => ({
      tipo: "em_andamento" as const,
      titulo: t.titulo,
      descricao: `${t.videosCompletos} de ${t.totalVideos} vídeos completos`,
    })),
    {
      tipo: "bloqueado" as const,
      titulo: "Próximas conquistas",
      descricao: "Continue estudando para desbloquear mais trilhas",
    },
  ];

  return (
    <Card className="border-aplicada-green-900/20">
      <CardHeader>
        <CardTitle className="text-xl">Minha Jornada</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {marcos.map((marco, index) => (
            <div key={index} className="flex gap-3">
              {/* Linha vertical e ícone */}
              <div className="flex flex-col items-center">
                {marco.tipo === "concluido" && (
                  <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                )}
                {marco.tipo === "em_andamento" && (
                  <Circle className="h-5 w-5 text-primary shrink-0" />
                )}
                {marco.tipo === "bloqueado" && (
                  <Lock className="h-5 w-5 text-muted-foreground shrink-0" />
                )}
                {index < marcos.length - 1 && (
                  <div className="w-px h-full bg-border mt-2" />
                )}
              </div>

              {/* Conteúdo do marco */}
              <div
                className={`flex-1 pb-6 ${
                  marco.tipo === "em_andamento"
                    ? "border border-primary/30 rounded-lg p-3 -ml-3 bg-muted/30"
                    : ""
                }`}
              >
                <h3
                  className={`font-medium ${
                    marco.tipo === "bloqueado"
                      ? "text-muted-foreground"
                      : "text-foreground"
                  }`}
                >
                  {marco.titulo}
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {marco.descricao}
                </p>
                {"data" in marco && marco.data && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {format(new Date(marco.data), "dd 'de' MMMM 'de' yyyy", {
                      locale: ptBR,
                    })}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
