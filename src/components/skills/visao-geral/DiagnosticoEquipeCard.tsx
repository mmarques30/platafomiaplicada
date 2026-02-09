import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Clock, Users, ClipboardList } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSkillsEquipeDiagnostico } from "@/hooks/useSkillsEquipeDiagnostico";

export default function DiagnosticoEquipeCard() {
  const navigate = useNavigate();
  const {
    membros,
    totalMembros,
    diagnosticosCompletos,
    todosPreencheram,
    meuDiagnosticoCompleto,
    isLoading,
  } = useSkillsEquipeDiagnostico();

  const progressPercent = totalMembros > 0 ? (diagnosticosCompletos / totalMembros) * 100 : 0;

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <ClipboardList className="h-5 w-5 text-[hsl(72,50%,35%)]" />
          Diagnóstico da Equipe
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Carregando...</p>
        ) : totalMembros === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhum membro cadastrado na equipe.</p>
        ) : (
          <>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Preenchimento</span>
                <span className="font-medium">
                  {diagnosticosCompletos} de {totalMembros} membros
                </span>
              </div>
              <Progress
                value={progressPercent}
                className="h-2.5"
                indicatorClassName="bg-[hsl(72,50%,35%)]"
              />
            </div>

            {todosPreencheram && (
              <div className="flex items-center gap-2 rounded-lg bg-[hsl(68,40%,88%)] p-3">
                <CheckCircle2 className="h-4 w-4 text-[hsl(72,50%,35%)]" />
                <p className="text-sm font-medium text-foreground">
                  Todos os membros concluíram o diagnóstico!
                </p>
              </div>
            )}

            <div className="space-y-1.5">
              {membros.map((m) => (
                <div key={m.userId} className="flex items-center gap-2 text-sm">
                  {m.completado ? (
                    <CheckCircle2 className="h-4 w-4 text-[hsl(72,50%,35%)]" />
                  ) : (
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span className={m.completado ? "text-foreground" : "text-muted-foreground"}>
                    {m.nome}
                  </span>
                </div>
              ))}
            </div>

            {!meuDiagnosticoCompleto && (
              <Button
                onClick={() => navigate("/skills/projeto/diagnostico")}
                className="w-full bg-[hsl(72,50%,35%)] text-white hover:bg-[hsl(72,50%,30%)]"
              >
                <ClipboardList className="mr-2 h-4 w-4" />
                Preencher Meu Diagnóstico
              </Button>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
