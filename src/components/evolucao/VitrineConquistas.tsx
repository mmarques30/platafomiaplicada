import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Star, Flame, Award, Zap, Target, Trophy } from "lucide-react";
import { useMinhaEvolucao } from "@/hooks/useMinhaEvolucao";
import { useSequenciaEstudo } from "@/hooks/useEvolucao";
import { useMeusCertificados } from "@/hooks/useCertificados";

interface Conquista {
  id: string;
  titulo: string;
  descricao: string;
  icone: React.ComponentType<{ className?: string }>;
  meta: number;
  progresso: number;
  desbloqueada: boolean;
}

export function VitrineConquistas() {
  const { data: evolucao } = useMinhaEvolucao();
  const { data: sequencia } = useSequenciaEstudo();
  const { data: certificados } = useMeusCertificados();

  const totalCertificados = certificados?.filter(c => c.status === "emitido").length || 0;

  const conquistas: Conquista[] = [
    {
      id: "primeira-trilha",
      titulo: "Primeira Trilha",
      descricao: "Complete sua primeira trilha",
      icone: Award,
      meta: 1,
      progresso: totalCertificados,
      desbloqueada: totalCertificados >= 1,
    },
    {
      id: "sequencia-7",
      titulo: "Dedicado",
      descricao: "Estude por 7 dias seguidos",
      icone: Flame,
      meta: 7,
      progresso: sequencia || 0,
      desbloqueada: (sequencia || 0) >= 7,
    },
    {
      id: "50-videos",
      titulo: "Maratonista",
      descricao: "Assista 50 vídeos completos",
      icone: Star,
      meta: 50,
      progresso: evolucao?.totalVideos || 0,
      desbloqueada: (evolucao?.totalVideos || 0) >= 50,
    },
    {
      id: "5-certificados",
      titulo: "Colecionador",
      descricao: "Conquiste 5 certificados",
      icone: Trophy,
      meta: 5,
      progresso: totalCertificados,
      desbloqueada: totalCertificados >= 5,
    },
    {
      id: "primeira-ferramenta",
      titulo: "Inovador",
      descricao: "Compartilhe sua primeira ferramenta",
      icone: Zap,
      meta: 1,
      progresso: evolucao?.totalFerramentas || 0,
      desbloqueada: (evolucao?.totalFerramentas || 0) >= 1,
    },
    {
      id: "sequencia-30",
      titulo: "Disciplinado",
      descricao: "Estude por 30 dias seguidos",
      icone: Target,
      meta: 30,
      progresso: sequencia || 0,
      desbloqueada: (sequencia || 0) >= 30,
    },
  ];

  return (
    <Card className="border-aplicada-green-900/20">
      <CardHeader>
        <CardTitle className="text-xl">Conquistas</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {conquistas.map((conquista) => {
            const IconeConquista = conquista.icone;
            const porcentagem = Math.min(
              (conquista.progresso / conquista.meta) * 100,
              100
            );

            return (
              <div
                key={conquista.id}
                className={`rounded-lg border p-4 space-y-3 transition-all ${
                  conquista.desbloqueada
                    ? "border-primary/30 bg-primary/5"
                    : "border-border bg-muted/30 opacity-50"
                }`}
              >
                {/* Ícone */}
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    conquista.desbloqueada
                      ? "bg-primary/20"
                      : "bg-muted"
                  }`}
                >
                  <IconeConquista
                    className={`h-6 w-6 ${
                      conquista.desbloqueada
                        ? "text-primary"
                        : "text-muted-foreground"
                    }`}
                  />
                </div>

                {/* Título e descrição */}
                <div>
                  <h3
                    className={`font-medium text-sm ${
                      conquista.desbloqueada
                        ? "text-foreground"
                        : "text-muted-foreground"
                    }`}
                  >
                    {conquista.titulo}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    {conquista.descricao}
                  </p>
                </div>

                {/* Progresso */}
                {!conquista.desbloqueada && (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">
                        {conquista.progresso} / {conquista.meta}
                      </span>
                      <span className="text-muted-foreground">
                        {porcentagem.toFixed(0)}%
                      </span>
                    </div>
                    <Progress value={porcentagem} className="h-1" />
                  </div>
                )}

                {conquista.desbloqueada && (
                  <p className="text-xs text-primary font-medium">
                    ✓ Desbloqueada
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
