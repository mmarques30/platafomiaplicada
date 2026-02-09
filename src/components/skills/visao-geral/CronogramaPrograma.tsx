import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useSkillsLider } from "@/hooks/useSkillsLider";

export default function CronogramaPrograma() {
  const { roadmap, semanaAtual } = useSkillsLider();

  const phases = useMemo(() => {
    if (roadmap.length > 0) {
      return roadmap.map((fase: any) => ({
        name: fase.nomeFase,
        weeks: Array.from(
          { length: fase.semanaFim - fase.semanaInicio + 1 },
          (_, i) => fase.semanaInicio + i
        ),
        color: fase.nomeFase === "Fundação" ? "bg-[hsl(72,40%,85%)]"
          : fase.nomeFase === "Expansão" ? "bg-[hsl(45,60%,85%)]"
          : "bg-[hsl(210,40%,85%)]",
      }));
    }
    return [
      { name: "Fundação", weeks: [1, 2, 3, 4], color: "bg-[hsl(72,40%,85%)]" },
      { name: "Expansão", weeks: [5, 6, 7, 8], color: "bg-[hsl(45,60%,85%)]" },
      { name: "Consolidação", weeks: [9, 10, 11, 12], color: "bg-[hsl(210,40%,85%)]" },
    ];
  }, [roadmap]);

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Cronograma do Programa
        </CardTitle>
        <CardDescription>Progresso através das 12 semanas</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {phases.map((phase) => (
            <div key={phase.name} className="space-y-2">
              <p className="text-sm font-semibold">{phase.name}</p>
              <div className="grid grid-cols-4 gap-1.5">
                {phase.weeks.map((week) => {
                  const isPast = week < semanaAtual;
                  const isCurrent = week === semanaAtual;
                  return (
                    <div
                      key={week}
                      className={`rounded-md text-center py-2 text-xs font-medium transition-all ${
                        isCurrent
                          ? "bg-[hsl(72,50%,35%)] text-white ring-2 ring-[hsl(72,50%,35%)]/40"
                          : isPast
                          ? phase.color + " text-foreground"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      Sem {week}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
