import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Check, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMinhaEvolucao } from "@/hooks/useMinhaEvolucao";
import { useSequenciaEstudo } from "@/hooks/useEvolucao";
import { useMeusCertificados } from "@/hooks/useCertificados";

interface Conquista {
  id: string;
  titulo: string;
  descricao: string;
  meta: number;
  progresso: number;
  desbloqueada: boolean;
}

export function VitrineConquistas() {
  const { data: evolucao } = useMinhaEvolucao();
  const { data: sequencia } = useSequenciaEstudo();
  const { data: certificados } = useMeusCertificados();

  const totalCertificados = certificados?.filter((c) => c.status === "emitido").length || 0;

  const conquistas: Conquista[] = [
    {
      id: "primeira-trilha",
      titulo: "Primeira Trilha",
      descricao: "Complete sua primeira trilha",
      meta: 1,
      progresso: totalCertificados,
      desbloqueada: totalCertificados >= 1,
    },
    {
      id: "sequencia-7",
      titulo: "Dedicado",
      descricao: "Estude por 7 dias seguidos",
      meta: 7,
      progresso: sequencia || 0,
      desbloqueada: (sequencia || 0) >= 7,
    },
    {
      id: "50-videos",
      titulo: "Maratonista",
      descricao: "Assista 50 vídeos completos",
      meta: 50,
      progresso: evolucao?.totalVideos || 0,
      desbloqueada: (evolucao?.totalVideos || 0) >= 50,
    },
    {
      id: "5-certificados",
      titulo: "Colecionador",
      descricao: "Conquiste 5 certificados",
      meta: 5,
      progresso: totalCertificados,
      desbloqueada: totalCertificados >= 5,
    },
    {
      id: "primeira-ferramenta",
      titulo: "Inovador",
      descricao: "Compartilhe sua primeira ferramenta",
      meta: 1,
      progresso: evolucao?.totalFerramentas || 0,
      desbloqueada: (evolucao?.totalFerramentas || 0) >= 1,
    },
    {
      id: "sequencia-30",
      titulo: "Disciplinado",
      descricao: "Estude por 30 dias seguidos",
      meta: 30,
      progresso: sequencia || 0,
      desbloqueada: (sequencia || 0) >= 30,
    },
  ];

  const desbloqueadas = conquistas.filter((c) => c.desbloqueada).length;

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="font-serif-display text-2xl font-normal">
          Suas <em className="font-serif-italic text-primary">conquistas</em>
        </CardTitle>
        <span className="text-sm text-muted-foreground">
          {desbloqueadas} de {conquistas.length}
        </span>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {conquistas.map((conquista) => {
            const porcentagem = Math.min((conquista.progresso / conquista.meta) * 100, 100);

            return (
              <div
                key={conquista.id}
                className={cn(
                  "flex flex-col gap-3 rounded-xl border bg-card p-4 transition-colors",
                  conquista.desbloqueada ? "border-primary/50" : "border-border"
                )}
              >
                <div className="flex items-start gap-3">
                  <span
                    className={cn(
                      "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                      conquista.desbloqueada ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                    )}
                  >
                    {conquista.desbloqueada ? <Check className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground">{conquista.titulo}</p>
                    <p className="text-xs text-muted-foreground">{conquista.descricao}</p>
                  </div>
                </div>

                {conquista.desbloqueada ? (
                  <span className="text-xs font-medium text-primary">Desbloqueada</span>
                ) : (
                  <div className="space-y-1.5">
                    <Progress value={porcentagem} className="h-1.5" />
                    <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                      <span>
                        {conquista.progresso} / {conquista.meta}
                      </span>
                      <span>{porcentagem.toFixed(0)}%</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
