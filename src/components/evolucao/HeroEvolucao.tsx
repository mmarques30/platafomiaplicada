import { Progress } from "@/components/ui/progress";
import { Flame, PlayCircle, Award } from "lucide-react";
import { useNivelUsuario } from "@/hooks/useNivelUsuario";
import { useMinhaEvolucao } from "@/hooks/useMinhaEvolucao";
import { useSequenciaEstudo } from "@/hooks/useEvolucao";
import { useMeusCertificados } from "@/hooks/useCertificados";

export function HeroEvolucao() {
  const { nivel, xpAtual, xpNecessario, porcentagemNivel, tituloNivel, proximoTitulo } = useNivelUsuario();
  const { data: evolucao } = useMinhaEvolucao();
  const { data: sequencia } = useSequenciaEstudo();
  const { data: certificados } = useMeusCertificados();

  const totalCertificados = certificados?.filter((c) => c.status === "emitido").length || 0;

  const stats = [
    { icon: Flame, label: "Sequência", value: sequencia || 0, unit: "dias" },
    { icon: PlayCircle, label: "Vídeos", value: evolucao?.totalVideos || 0, unit: "completos" },
    { icon: Award, label: "Certificados", value: totalCertificados, unit: "obtidos" },
  ];

  return (
    <section className="rounded-2xl border border-border bg-card p-5 md:p-8">
      <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div className="min-w-0 space-y-2">
          <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
            Nível {nivel}
          </span>
          <h2 className="font-serif-display text-3xl leading-none text-foreground md:text-4xl">{tituloNivel}</h2>
          <p className="text-sm text-muted-foreground">
            Próximo nível: <span className="font-medium text-primary">{proximoTitulo}</span>
          </p>
        </div>
        <div className="shrink-0 text-sm text-muted-foreground md:text-right">
          <span className="text-2xl font-semibold text-foreground">{xpAtual.toLocaleString()}</span>
          <span> / {xpNecessario.toLocaleString()} XP</span>
        </div>
      </div>

      <div className="mt-5 space-y-2">
        <Progress value={porcentagemNivel} className="h-2" />
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Experiência</span>
          <span>{Math.round(porcentagemNivel)}% para o próximo nível</span>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-3 gap-3">
        {stats.map(({ icon: Icon, label, value, unit }) => (
          <div key={label} className="rounded-xl border border-border bg-card p-3 md:p-4">
            <div className="flex flex-col items-start gap-1 text-muted-foreground sm:flex-row sm:items-center sm:gap-2">
              <Icon className="h-4 w-4 text-primary" />
              <span className="text-[10px] font-medium uppercase tracking-[0.08em] sm:text-[11px] sm:tracking-[0.12em]">{label}</span>
            </div>
            <p className="mt-2 text-2xl font-semibold leading-none text-foreground md:text-3xl">{value}</p>
            <p className="mt-1 text-xs text-muted-foreground">{unit}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
