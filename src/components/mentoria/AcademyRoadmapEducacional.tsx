import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useMentoriaForm } from "@/hooks/useMentoriaForm";
import { useProgressoCertificados } from "@/hooks/useProgressoCertificados";
import { useMinhaEvolucao } from "@/hooks/useMinhaEvolucao";
import { useMeusCertificados } from "@/hooks/useCertificados";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ClipboardList, BookOpen, Trophy, Award } from "lucide-react";

const ICONS = { ClipboardList, BookOpen, Trophy, Award } as const;

interface Stage {
  num: string;
  icon: keyof typeof ICONS;
  title: string;
  status: "concluido" | "atual" | "proximo";
  meta: string;
}

export function AcademyRoadmapEducacional() {
  const { formulario, isLoading: loadingForm } = useMentoriaForm();
  const { data: trilhasProgresso, isLoading: loadingTrilhas } = useProgressoCertificados();
  const { data: evolucao } = useMinhaEvolucao();
  const { data: certificados } = useMeusCertificados();

  const diagnosticoPreenchido = formulario?.completado === true;
  const diagnosticoData = formulario?.updated_at
    ? format(new Date(formulario.updated_at), "dd/MM/yyyy", { locale: ptBR })
    : null;

  const allTrilhas = trilhasProgresso || [];
  const modulosConcluidos = allTrilhas.filter(t => t.percentual === 100).length;
  const totalModulos = allTrilhas.length;

  const certificadosEmitidos = certificados?.filter(c => c.status === "emitido") || [];
  const totalVideos = evolucao?.totalVideos || 0;
  const totalProjetos = evolucao?.totalProjetos || 0;
  const conquistasCount = totalVideos + certificadosEmitidos.length + totalProjetos;
  const certificadoEmitido = certificadosEmitidos.length > 0;

  const isLoading = loadingForm || loadingTrilhas;

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[1, 2, 3, 4].map(i => (
          <Skeleton key={i} className="h-40 w-full bg-white/5 rounded-xl" />
        ))}
      </div>
    );
  }

  const stages: Stage[] = [
    {
      num: "01",
      icon: "ClipboardList",
      title: "Diagnóstico",
      status: diagnosticoPreenchido ? "concluido" : "atual",
      meta: diagnosticoPreenchido
        ? `Preenchido em ${diagnosticoData ?? ""}`
        : "Preencha para começar",
    },
    {
      num: "02",
      icon: "BookOpen",
      title: "Trilhas",
      status: modulosConcluidos > 0 ? "atual" : "proximo",
      meta: `${modulosConcluidos} de ${totalModulos} módulos`,
    },
    {
      num: "03",
      icon: "Trophy",
      title: "Conquistas",
      status: conquistasCount > 0 ? "atual" : "proximo",
      meta: `${conquistasCount} desbloqueadas`,
    },
    {
      num: "04",
      icon: "Award",
      title: "Certificado",
      status: certificadoEmitido ? "concluido" : "proximo",
      meta: certificadoEmitido ? "Emitido" : "Disponível ao concluir trilhas",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {stages.map((stage) => {
        const isConcluido = stage.status === "concluido";
        const isAtual = stage.status === "atual";
        const Icon = ICONS[stage.icon];

        return (
          <Card
            key={stage.num}
            className={`relative border-border/50 bg-card transition-all ${
              isAtual ? "ring-1 ring-amber-500/40" : ""
            } ${isConcluido ? "ring-1 ring-emerald-500/30" : ""}`}
          >
            <CardContent className="flex flex-col items-center gap-3 p-6 text-center">
              <span className="text-[11px] uppercase tracking-wider text-muted-foreground">
                Estágio {stage.num}
              </span>

              <Icon
                className={`h-8 w-8 ${
                  isConcluido
                    ? "text-emerald-500"
                    : isAtual
                    ? "text-amber-400"
                    : "text-muted-foreground"
                }`}
              />

              <span className="text-sm font-semibold">{stage.title}</span>

              <Badge
                className={
                  isConcluido
                    ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                    : isAtual
                    ? "bg-amber-500/20 text-amber-400 border-amber-500/30"
                    : "bg-muted text-muted-foreground border-border"
                }
              >
                {isConcluido ? "Concluído" : isAtual ? "Em andamento" : "Pendente"}
              </Badge>

              <span className="text-xs text-muted-foreground">{stage.meta}</span>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
