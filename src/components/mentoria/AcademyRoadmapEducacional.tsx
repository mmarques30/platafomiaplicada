import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router-dom";
import { useMentoriaForm } from "@/hooks/useMentoriaForm";
import { useProgressoCertificados } from "@/hooks/useProgressoCertificados";
import { useMinhaEvolucao } from "@/hooks/useMinhaEvolucao";
import { useMeusCertificados } from "@/hooks/useCertificados";
import { useSequenciaEstudo } from "@/hooks/useEvolucao";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  ClipboardCheck, BookOpen, Trophy, Target,
  CheckCircle2, Clock, ArrowRight, Award, Flame, Star
} from "lucide-react";
import { useCountUp } from "@/hooks/useCountUp";

export function AcademyRoadmapEducacional() {
  const navigate = useNavigate();
  const { formulario, isLoading: loadingForm } = useMentoriaForm();
  const { data: trilhasProgresso, isLoading: loadingTrilhas } = useProgressoCertificados();
  const { data: evolucao } = useMinhaEvolucao();
  const { data: certificados } = useMeusCertificados();
  const { data: sequencia } = useSequenciaEstudo();

  const diagnosticoCompleto = formulario?.completado === true;
  const insightGerado = !!formulario?.insight_gerado_em;

  const certificadosEmitidos = certificados?.filter(c => c.status === "emitido") || [];
  const totalVideos = evolucao?.totalVideos || 0;
  const totalProjetos = evolucao?.totalProjetos || 0;
  const totalFerramentas = evolucao?.totalFerramentas || 0;
  const diasSequencia = sequencia || 0;

  // Trilhas com progresso (incluindo 100%)
  const allTrilhas = trilhasProgresso || [];

  // Próximo objetivo: trilha com maior progresso que não é 100%
  const proximoObjetivo = allTrilhas.length > 0
    ? allTrilhas.find(t => t.percentual < 100) || null
    : null;

  const isLoading = loadingForm || loadingTrilhas;

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4].map(i => (
          <Skeleton key={i} className="h-32 w-full bg-white/5 rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Seção 1 — Diagnóstico */}
      <Card className="border-border/50 bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <ClipboardCheck className="h-5 w-5 text-primary" />
            Diagnóstico
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Formulário</span>
              {diagnosticoCompleto ? (
                <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                  <CheckCircle2 className="h-3 w-3 mr-1" /> Preenchido
                </Badge>
              ) : (
                <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">
                  <Clock className="h-3 w-3 mr-1" /> Pendente
                </Badge>
              )}
            </div>
            {diagnosticoCompleto && formulario?.updated_at && (
              <span className="text-xs text-muted-foreground">
                {format(new Date(formulario.updated_at), "dd/MM/yyyy", { locale: ptBR })}
              </span>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Insight IA</span>
              {insightGerado ? (
                <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                  <CheckCircle2 className="h-3 w-3 mr-1" /> Gerado
                </Badge>
              ) : (
                <Badge className="bg-zinc-500/20 text-zinc-400 border-zinc-500/30">
                  <Clock className="h-3 w-3 mr-1" /> Aguardando
                </Badge>
              )}
            </div>
            {insightGerado && formulario?.insight_gerado_em && (
              <span className="text-xs text-muted-foreground">
                {format(new Date(formulario.insight_gerado_em), "dd/MM/yyyy", { locale: ptBR })}
              </span>
            )}
          </div>

          {!diagnosticoCompleto && (
            <Button
              size="sm"
              onClick={() => navigate("/diagnostico/formulario")}
              className="w-full mt-2"
            >
              Preencher diagnóstico <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Seção 2 — Trilhas em Andamento */}
      <Card className="border-border/50 bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <BookOpen className="h-5 w-5 text-primary" />
            Trilhas em Andamento
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {allTrilhas.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-sm text-muted-foreground mb-3">
                Você ainda não iniciou nenhuma trilha
              </p>
              <Button size="sm" variant="outline" onClick={() => navigate("/trilhas")}>
                Explorar trilhas <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          ) : (
            allTrilhas.map((trilha) => (
              <div key={trilha.trilhaId} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium truncate max-w-[60%]">{trilha.titulo}</span>
                  <span className="text-xs text-muted-foreground">
                    {trilha.percentual}% · faltam {trilha.faltamVideos} vídeos
                  </span>
                </div>
                <Progress
                  value={trilha.percentual}
                  className="h-2 bg-white/5"
                  indicatorClassName="bg-primary"
                />
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Seção 3 — Conquistas Desbloqueadas */}
      <Card className="border-border/50 bg-card">
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Trophy className="h-5 w-5 text-primary" />
            Conquistas
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-muted-foreground"
            onClick={() => navigate("/evolucao/conquistas")}
          >
            Ver todas
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="flex flex-col items-center gap-1 p-3 rounded-lg bg-white/5">
              <Star className={`h-5 w-5 ${totalVideos > 0 ? "text-primary" : "text-zinc-600"}`} />
              <span className="text-lg font-bold">{totalVideos}</span>
              <span className="text-[11px] text-muted-foreground">Vídeos</span>
            </div>
            <div className="flex flex-col items-center gap-1 p-3 rounded-lg bg-white/5">
              <Award className={`h-5 w-5 ${certificadosEmitidos.length > 0 ? "text-primary" : "text-zinc-600"}`} />
              <span className="text-lg font-bold">{certificadosEmitidos.length}</span>
              <span className="text-[11px] text-muted-foreground">Certificados</span>
            </div>
            <div className="flex flex-col items-center gap-1 p-3 rounded-lg bg-white/5">
              <Flame className={`h-5 w-5 ${diasSequencia > 0 ? "text-orange-400" : "text-zinc-600"}`} />
              <span className="text-lg font-bold">{diasSequencia}</span>
              <span className="text-[11px] text-muted-foreground">Dias seguidos</span>
            </div>
            <div className="flex flex-col items-center gap-1 p-3 rounded-lg bg-white/5">
              <Target className={`h-5 w-5 ${totalProjetos > 0 ? "text-primary" : "text-zinc-600"}`} />
              <span className="text-lg font-bold">{totalProjetos}</span>
              <span className="text-[11px] text-muted-foreground">Projetos</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Seção 4 — Próximo Objetivo */}
      <Card className="border-primary/30 bg-gradient-to-br from-card to-primary/5">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Target className="h-5 w-5 text-primary" />
            Próximo Objetivo
          </CardTitle>
        </CardHeader>
        <CardContent>
          {proximoObjetivo ? (
            <div className="space-y-3">
              <p className="text-sm">
                Continue a trilha <span className="font-semibold text-primary">{proximoObjetivo.titulo}</span>
              </p>
              <div className="flex items-center gap-3">
                <Progress
                  value={proximoObjetivo.percentual}
                  className="h-2.5 flex-1 bg-white/5"
                  indicatorClassName="bg-primary"
                />
                <span className="text-sm font-medium">{proximoObjetivo.percentual}%</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Faltam {proximoObjetivo.faltamVideos} vídeos para concluir
              </p>
              <Button
                size="sm"
                onClick={() => navigate(`/trilhas`)}
                className="w-full"
              >
                Continuar trilha <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          ) : allTrilhas.length > 0 ? (
            <div className="text-center py-2">
              <p className="text-sm text-muted-foreground flex items-center justify-center gap-1"><CheckCircle2 className="h-4 w-4 text-primary" /> Todas as trilhas concluídas!</p>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Comece sua primeira trilha para definir seu objetivo
              </p>
              <Button
                size="sm"
                onClick={() => navigate("/trilhas")}
                className="w-full"
              >
                Começar agora <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
