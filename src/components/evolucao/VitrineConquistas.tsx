import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
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

  const totalCertificados = certificados?.filter(c => c.status === "emitido").length || 0;

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

  return (
    <Card className="border-aplicada-green-900/20">
      <CardHeader>
        <CardTitle className="text-xl">Conquistas</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {conquistas.map((conquista) => {
            const porcentagem = Math.min(
              (conquista.progresso / conquista.meta) * 100,
              100
            );

            return (
              <div
                key={conquista.id}
                className={`rounded-lg border p-4 space-y-3 transition-all ${
                  conquista.desbloqueada
                    ? "border-primary/40 bg-zinc-700"
                    : "border-zinc-600 bg-zinc-700"
                }`}
              >
                {/* Título e descrição */}
                <div>
                  <h3
                    className={`font-semibold text-sm ${
                      conquista.desbloqueada
                        ? "text-primary"
                        : "text-zinc-300"
                    }`}
                  >
                    {conquista.titulo}
                  </h3>
                  <p className="text-xs text-zinc-300 mt-1">
                    {conquista.descricao}
                  </p>
                </div>

                {/* Progresso */}
                {!conquista.desbloqueada && (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-zinc-300">
                        {conquista.progresso} / {conquista.meta}
                      </span>
                      <span className="text-zinc-300">
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
