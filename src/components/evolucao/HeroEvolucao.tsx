import { Progress } from "@/components/ui/progress";

import grafiaEvolucao from "@/assets/grafia-evolucao.svg";
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
    <div className="relative rounded-xl border border-primary/30 bg-card shadow-sm p-4 md:p-6 overflow-hidden">
      {/* Marca d'água decorativa */}
      <img 
        src={grafiaEvolucao} 
        alt="" 
        className="absolute bottom-2 right-2 h-12 md:h-16 opacity-20 pointer-events-none select-none"
        aria-hidden="true"
      />
      <div className="relative space-y-4">
          {/* Header: Nível e Título */}
          <div className="flex items-center justify-between gap-2">
            <div className="space-y-1 min-w-0">
              <span className="text-xs md:text-sm text-muted-foreground">Nível {nivel}</span>
              <h2 className="text-lg md:text-2xl font-semibold text-foreground truncate">{tituloNivel}</h2>
            </div>
            <div className="text-right shrink-0">
              <p className="text-xs text-muted-foreground">Próximo nível</p>
              <p className="text-xs md:text-sm font-medium text-primary truncate max-w-[100px] md:max-w-none">{proximoTitulo}</p>
            </div>
          </div>

          {/* Barra de Progresso XP */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs md:text-sm">
              <span className="text-muted-foreground">Experiência</span>
              <span className="text-muted-foreground">
                {xpAtual.toLocaleString()} / {xpNecessario.toLocaleString()} XP
              </span>
            </div>
            <Progress value={porcentagemNivel} className="h-2" />
          </div>

          {/* Mini Cards de Estatísticas */}
          <div className="grid grid-cols-3 gap-2 md:gap-3 pt-2">
            <div className="rounded-lg border border-border bg-card p-2 md:p-3">
              <span className="text-[10px] md:text-xs uppercase tracking-wide block mb-1 md:mb-2 text-foreground truncate">Sequência</span>
              <p className="text-base md:text-xl font-semibold text-foreground">{sequencia || 0}</p>
              <p className="text-[10px] md:text-xs text-muted-foreground">dias</p>
            </div>

            <div className="rounded-lg border border-border bg-card p-2 md:p-3">
              <span className="text-[10px] md:text-xs uppercase tracking-wide block mb-1 md:mb-2 text-foreground truncate">Vídeos</span>
              <p className="text-base md:text-xl font-semibold text-foreground">{evolucao?.totalVideos || 0}</p>
              <p className="text-[10px] md:text-xs text-muted-foreground">completos</p>
            </div>

            <div className="rounded-lg border border-border bg-card p-2 md:p-3">
              <span className="text-[10px] md:text-xs uppercase tracking-wide block mb-1 md:mb-2 text-foreground truncate">Certificados</span>
              <p className="text-base md:text-xl font-semibold text-foreground">{totalCertificados}</p>
              <p className="text-[10px] md:text-xs text-muted-foreground">obtidos</p>
            </div>
          </div>
      </div>
    </div>
  );
}
