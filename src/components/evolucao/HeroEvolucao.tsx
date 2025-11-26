import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Trophy } from "lucide-react";
import { useNivelUsuario } from "@/hooks/useNivelUsuario";
import { useMinhaEvolucao } from "@/hooks/useMinhaEvolucao";
import { useSequenciaEstudo } from "@/hooks/useEvolucao";
import { useMeusCertificados } from "@/hooks/useCertificados";

export function HeroEvolucao() {
  const { nivel, xpAtual, xpNecessario, porcentagemNivel, tituloNivel, proximoTitulo } = useNivelUsuario();
  const { data: evolucao } = useMinhaEvolucao();
  const { data: sequencia } = useSequenciaEstudo();
  const { data: certificados } = useMeusCertificados();

  const totalCertificados = certificados?.filter(c => c.status === "emitido").length || 0;

  return (
    <Card className="border-aplicada-green-900/20 bg-aplicada-dark text-foreground">
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Header: Nível e Título */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-primary" />
                <span className="text-sm text-muted-foreground">Nível {nivel}</span>
              </div>
              <h2 className="text-2xl font-semibold text-foreground">{tituloNivel}</h2>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Próximo nível</p>
              <p className="text-sm font-medium text-primary">{proximoTitulo}</p>
            </div>
          </div>

          {/* Barra de Progresso XP */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Experiência</span>
              <span className="text-muted-foreground">
                {xpAtual.toLocaleString()} / {xpNecessario.toLocaleString()} XP
              </span>
            </div>
            <Progress value={porcentagemNivel} className="h-2" />
          </div>

          {/* Mini Cards de Estatísticas */}
          <div className="grid grid-cols-3 gap-3 pt-2">
            <div className="rounded-lg border border-zinc-600 bg-zinc-700 p-3">
              <span className="text-xs text-white uppercase tracking-wide block mb-2">Sequência</span>
              <p className="text-xl font-semibold text-white">{sequencia || 0}</p>
              <p className="text-xs text-zinc-300">dias seguidos</p>
            </div>

            <div className="rounded-lg border border-zinc-600 bg-zinc-700 p-3">
              <span className="text-xs text-white uppercase tracking-wide block mb-2">Vídeos</span>
              <p className="text-xl font-semibold text-white">{evolucao?.totalVideos || 0}</p>
              <p className="text-xs text-zinc-300">completos</p>
            </div>

            <div className="rounded-lg border border-zinc-600 bg-zinc-700 p-3">
              <span className="text-xs text-white uppercase tracking-wide block mb-2">Certificados</span>
              <p className="text-xl font-semibold text-white">{totalCertificados}</p>
              <p className="text-xs text-zinc-300">conquistados</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
